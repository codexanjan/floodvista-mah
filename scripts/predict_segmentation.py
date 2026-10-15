#!/usr/bin/env python3
"""Run flood/debris segmentation inference on input SAR rasters.

Outputs a georeferenced flood class mask (0: no water, 1: permanent water, 2: flood, 255: nodata)
and an optional confidence map GeoTIFF.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
_SRC = _REPOSITORY_ROOT / "src"
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from floodmap.inference.predict import predict_raster


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input-raster",
        type=Path,
        required=True,
        help="Path to input 4-channel SAR raster (or preprocessed GeoTIFF)",
    )
    parser.add_argument(
        "--output-mask",
        type=Path,
        required=True,
        help="Output path for single-band uint8 flood class mask GeoTIFF",
    )
    parser.add_argument(
        "--output-confidence",
        type=Path,
        default=None,
        help="Optional output path for float32 flood confidence GeoTIFF",
    )
    parser.add_argument(
        "--checkpoint",
        type=Path,
        default=None,
        help="Optional path to model checkpoint (.pt)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.5,
        help="Probability threshold for flood classification (default 0.5)",
    )

    args = parser.parse_args()

    print(f"[FLOODVISTA AI] Running segmentation inference on: {args.input_raster}")
    out = predict_raster(
        input_raster_path=args.input_raster,
        output_mask_path=args.output_mask,
        output_confidence_path=args.output_confidence,
        checkpoint_path=args.checkpoint,
        flood_threshold=args.threshold,
    )

    flooded_pixels = int(np.count_nonzero(out.class_mask == 2))
    water_pixels = int(np.count_nonzero(out.class_mask == 1))
    nodata_pixels = int(np.count_nonzero(out.class_mask == 255))
    total_pixels = out.class_mask.size

    print(f"[FLOODVISTA AI] Prediction complete:")
    print(f"  Output mask: {args.output_mask}")
    if args.output_confidence:
        print(f"  Confidence map: {args.output_confidence}")
    print(f"  Flooded pixels: {flooded_pixels:,} ({flooded_pixels/total_pixels*100:.2f}%)")
    print(f"  Permanent water: {water_pixels:,} ({water_pixels/total_pixels*100:.2f}%)")
    print(f"  Nodata pixels: {nodata_pixels:,} ({nodata_pixels/total_pixels*100:.2f}%)")
    return 0


if __name__ == "__main__":
    import numpy as np
    sys.exit(main())
