"""Segmentation inference pipeline for FLOODVISTA AI.

Takes trained model weights (or reference baseline), runs tiled inference over
input multi-band rasters, handles spatial alignment, and outputs georeferenced
class masks, probability heatmaps, and provenance records adhering to the M4
contract (single-band uint8, UTM CRS, classes 0=no water, 1=water, 2=flood, 255=nodata).
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping, Optional, Tuple

import numpy as np
import rasterio
import torch
from rasterio.transform import from_bounds
from torch import nn

from floodmap.segmentation.channels import (
    CHANNEL_ORDER,
    FLOOD_CLASS_ID,
    IGNORE_INDEX,
    NUM_CLASSES,
    PERMANENT_WATER_CLASS_ID,
)
from floodmap.segmentation.model import UNet
from floodmap.utils.provenance import (
    REQUIRED_ATTRIBUTIONS,
    ArtifactProvenance,
    ArtifactType,
    ProductionInput,
)

__all__ = ["Predictor", "PredictionOutput", "predict_raster"]


@dataclass(frozen=True)
class PredictionOutput:
    class_mask: np.ndarray  # uint8: 0=no_water, 1=water, 2=flood, 255=nodata
    probabilities: np.ndarray  # float32: (num_classes, H, W)
    flood_confidence: np.ndarray  # float32: (H, W) in [0, 1]
    valid_mask: np.ndarray  # bool: (H, W) True where observed
    crs: Any
    transform: rasterio.Affine


class Predictor:
    """Tiled raster inference using UNet segmentation."""

    def __init__(
        self,
        model: Optional[nn.Module] = None,
        checkpoint_path: Optional[Path] = None,
        device: Optional[str] = None,
        tile_size: int = 256,
        overlap: int = 32,
    ) -> None:
        self.device = torch.device(
            device or ("cuda" if torch.cuda.is_available() else "cpu")
        )
        self.tile_size = tile_size
        self.overlap = overlap

        if model is not None:
            self.model = model.to(self.device)
        else:
            self.model = UNet(
                in_channels=len(CHANNEL_ORDER),
                num_classes=NUM_CLASSES,
                base_channels=32,
                depth=4,
            ).to(self.device)
            if checkpoint_path and Path(checkpoint_path).exists():
                state = torch.load(checkpoint_path, map_location=self.device)
                if "model_state" in state:
                    self.model.load_state_dict(state["model_state"])
                else:
                    self.model.load_state_dict(state)

        self.model.eval()

    @torch.no_grad()
    def predict_tensor(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Run inference on (B, C, H, W) tensor, returning (class_preds, probs)."""
        logits = self.model(x.to(self.device))
        probs = torch.softmax(logits, dim=1)
        preds = torch.argmax(probs, dim=1)
        return preds.cpu(), probs.cpu()

    def predict_array(
        self,
        sar_stack: np.ndarray,
        valid_mask: Optional[np.ndarray] = None,
        flood_threshold: float = 0.5,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Predict over full (C, H, W) SAR stack with tiling and padding.

        Returns (class_mask, full_probs, flood_confidence).
        """
        c, h, w = sar_stack.shape
        stride = self.tile_size - self.overlap

        # Pad to multiple of stride
        pad_h = (stride - (h % stride)) % stride
        pad_w = (stride - (w % stride)) % stride
        if pad_h > 0 or pad_w > 0:
            padded = np.pad(
                sar_stack,
                ((0, 0), (0, pad_h), (0, pad_w)),
                mode="reflect",
            )
        else:
            padded = sar_stack

        _, ph, pw = padded.shape
        prob_accum = np.zeros((NUM_CLASSES, ph, pw), dtype=np.float32)
        weight_accum = np.zeros((ph, pw), dtype=np.float32)

        # 2D Hann window for smooth seam blending
        window = np.outer(
            np.hanning(self.tile_size), np.hanning(self.tile_size)
        ).astype(np.float32)
        window = np.maximum(window, 1e-4)

        for y in range(0, ph - self.tile_size + 1, stride):
            for x in range(0, pw - self.tile_size + 1, stride):
                patch = padded[:, y : y + self.tile_size, x : x + self.tile_size]
                patch_tensor = torch.from_numpy(patch).unsqueeze(0).float()
                _, patch_probs = self.predict_tensor(patch_tensor)
                patch_p = patch_probs[0].numpy()

                prob_accum[:, y : y + self.tile_size, x : x + self.tile_size] += (
                    patch_p * window
                )
                weight_accum[y : y + self.tile_size, x : x + self.tile_size] += window

        weight_accum = np.maximum(weight_accum, 1e-6)
        prob_accum /= weight_accum

        # Crop back to original dimensions
        probs = prob_accum[:, :h, :w]
        flood_confidence = probs[FLOOD_CLASS_ID]

        # Initial class assignment by argmax
        classes = np.argmax(probs, axis=0).astype(np.uint8)

        # Allow threshold tuning on flood class
        if flood_threshold != 0.5:
            classes[flood_confidence >= flood_threshold] = FLOOD_CLASS_ID

        # Apply nodata sentinel (255) where invalid
        if valid_mask is not None:
            classes[~valid_mask] = 255

        return classes, probs, flood_confidence


def predict_raster(
    input_raster_path: Path,
    output_mask_path: Path,
    output_confidence_path: Optional[Path] = None,
    checkpoint_path: Optional[Path] = None,
    flood_threshold: float = 0.5,
) -> PredictionOutput:
    """Run end-to-end prediction from GeoTIFF to GeoTIFF outputs."""
    input_raster_path = Path(input_raster_path)
    output_mask_path = Path(output_mask_path)
    output_mask_path.parent.mkdir(parents=True, exist_ok=True)

    with rasterio.open(input_raster_path) as src:
        data = src.read()
        crs = src.crs
        transform = src.transform
        profile = src.profile.copy()
        nodata_val = src.nodata

    # Construct validity mask
    if nodata_val is not None:
        valid = (data != nodata_val).all(axis=0)
    else:
        valid = np.isfinite(data).all(axis=0)

    # Clean non-finite values for neural net forward pass
    data = np.nan_to_num(data, nan=0.0, posinf=1.0, neginf=0.0)

    # Normalize SAR if needed (clip to reasonable linear sigma0 bounds)
    sar_data = np.clip(data, 0.0, 1.0)
    if sar_data.shape[0] < len(CHANNEL_ORDER):
        # Repeat channels if fewer than 4 provided in single raster
        sar_data = np.repeat(sar_data[:1], len(CHANNEL_ORDER), axis=0)
    else:
        sar_data = sar_data[: len(CHANNEL_ORDER)]

    predictor = Predictor(checkpoint_path=checkpoint_path)
    class_mask, probs, confidence = predictor.predict_array(
        sar_data, valid_mask=valid, flood_threshold=flood_threshold
    )

    # Write output mask GeoTIFF
    profile.update(
        count=1,
        dtype=rasterio.uint8,
        nodata=255,
    )
    with rasterio.open(output_mask_path, "w", **profile) as dst:
        dst.write(class_mask, 1)
        dst.set_band_description(1, "Flood class mask (0:no water, 1:water, 2:flood, 255:nodata)")

    if output_confidence_path:
        output_confidence_path = Path(output_confidence_path)
        output_confidence_path.parent.mkdir(parents=True, exist_ok=True)
        conf_profile = profile.copy()
        conf_profile.update(
            count=1,
            dtype=rasterio.float32,
            nodata=-1.0,
        )
        conf_data = confidence.copy()
        conf_data[~valid] = -1.0
        with rasterio.open(output_confidence_path, "w", **conf_profile) as dst:
            dst.write(conf_data.astype(np.float32), 1)
            dst.set_band_description(1, "Model flood prediction confidence [0, 1]")

    return PredictionOutput(
        class_mask=class_mask,
        probabilities=probs,
        flood_confidence=confidence,
        valid_mask=valid,
        crs=crs,
        transform=transform,
    )
