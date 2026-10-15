"""Scientific model evaluation module for FLOODVISTA AI.

Computes mathematically rigorous segmentation evaluation metrics:
- Overall mean IoU and per-class IoU (No Water, Permanent Water, Flood)
- Dice / F1 Score
- Precision & Recall
- Confusion Matrix
- Optional slope/terrain stratification
All metrics strictly ignore nodata pixels (sentinel 255 or 3).
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

from floodmap.segmentation.channels import (
    CLASS_NAMES,
    FLOOD_CLASS_ID,
    IGNORE_INDEX,
    NUM_CLASSES,
    PERMANENT_WATER_CLASS_ID,
    SEMANTIC_VALUES,
)


@dataclass(frozen=True)
class ClassMetrics:
    class_id: int
    name: str
    iou: float
    dice_f1: float
    precision: float
    recall: float
    true_positive: int
    false_positive: int
    false_negative: int
    support: int


@dataclass(frozen=True)
class EvaluationReport:
    mean_iou: float
    mean_dice: float
    overall_accuracy: float
    flood_iou: float
    flood_dice: float
    flood_precision: float
    flood_recall: float
    per_class: Dict[str, ClassMetrics]
    confusion_matrix: List[List[int]]
    total_evaluated_pixels: int
    terrain_stratification: Optional[Dict[str, Dict[str, float]]] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        return d


def evaluate_predictions(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    ignore_val: int = 255,
    slope_raster: Optional[np.ndarray] = None,
) -> EvaluationReport:
    """Compute comprehensive segmentation metrics between truth and prediction rasters.

    Parameters
    ----------
    y_true: Ground truth class array (uint8)
    y_pred: Predicted class array (uint8)
    ignore_val: Nodata sentinel to ignore in both arrays
    slope_raster: Optional slope in degrees for terrain error stratification
    """
    valid = (y_true != ignore_val) & (y_true != IGNORE_INDEX) & (y_pred != ignore_val)

    yt = y_true[valid].astype(np.int64)
    yp = y_pred[valid].astype(np.int64)

    total_valid = int(valid.sum())
    if total_valid == 0:
        raise ValueError("No valid pixels to evaluate (all are masked nodata).")

    # Confusion matrix: rows = true, cols = pred
    cm = np.zeros((NUM_CLASSES, NUM_CLASSES), dtype=np.int64)
    for t_val, p_val in zip(yt, yp):
        if 0 <= t_val < NUM_CLASSES and 0 <= p_val < NUM_CLASSES:
            cm[t_val, p_val] += 1

    per_class: Dict[str, ClassMetrics] = {}
    ious: List[float] = []
    dices: List[float] = []

    for c in range(NUM_CLASSES):
        name = CLASS_NAMES[c] if c < len(CLASS_NAMES) else f"Class_{c}"
        tp = int(cm[c, c])
        fp = int(cm[:, c].sum() - tp)
        fn = int(cm[c, :].sum() - tp)
        support = int(cm[c, :].sum())

        denom_iou = tp + fp + fn
        iou = float(tp / denom_iou) if denom_iou > 0 else 0.0

        denom_dice = 2 * tp + fp + fn
        dice = float((2 * tp) / denom_dice) if denom_dice > 0 else 0.0

        precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        recall = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0

        ious.append(iou)
        dices.append(dice)

        per_class[name] = ClassMetrics(
            class_id=c,
            name=name,
            iou=round(iou, 4),
            dice_f1=round(dice, 4),
            precision=round(precision, 4),
            recall=round(recall, 4),
            true_positive=tp,
            false_positive=fp,
            false_negative=fn,
            support=support,
        )

    mean_iou = float(np.mean(ious))
    mean_dice = float(np.mean(dices))
    overall_acc = float(np.trace(cm) / total_valid) if total_valid > 0 else 0.0

    flood_metrics = per_class.get(CLASS_NAMES[FLOOD_CLASS_ID])
    f_iou = flood_metrics.iou if flood_metrics else 0.0
    f_dice = flood_metrics.dice_f1 if flood_metrics else 0.0
    f_prec = flood_metrics.precision if flood_metrics else 0.0
    f_rec = flood_metrics.recall if flood_metrics else 0.0

    # Optional terrain stratification
    terrain_strat = None
    if slope_raster is not None and slope_raster.shape == y_true.shape:
        terrain_strat = {}
        slope_valid = slope_raster[valid]
        bins = [
            ("flat_0_to_5_deg", slope_valid < 5),
            ("moderate_5_to_15_deg", (slope_valid >= 5) & (slope_valid < 15)),
            ("steep_15_to_30_deg", (slope_valid >= 15) & (slope_valid < 30)),
            ("mountain_over_30_deg", slope_valid >= 30),
        ]
        for bin_name, bin_mask in bins:
            if bin_mask.sum() > 0:
                bin_yt = yt[bin_mask]
                bin_yp = yp[bin_mask]
                bin_tp = int(np.count_nonzero((bin_yt == FLOOD_CLASS_ID) & (bin_yp == FLOOD_CLASS_ID)))
                bin_fp = int(np.count_nonzero((bin_yt != FLOOD_CLASS_ID) & (bin_yp == FLOOD_CLASS_ID)))
                bin_fn = int(np.count_nonzero((bin_yt == FLOOD_CLASS_ID) & (bin_yp != FLOOD_CLASS_ID)))
                denom = bin_tp + bin_fp + bin_fn
                bin_iou = float(bin_tp / denom) if denom > 0 else 0.0
                terrain_strat[bin_name] = {
                    "flood_iou": round(bin_iou, 4),
                    "pixel_count": int(bin_mask.sum()),
                }

    return EvaluationReport(
        mean_iou=round(mean_iou, 4),
        mean_dice=round(mean_dice, 4),
        overall_accuracy=round(overall_acc, 4),
        flood_iou=round(f_iou, 4),
        flood_dice=round(f_dice, 4),
        flood_precision=round(f_prec, 4),
        flood_recall=round(f_rec, 4),
        per_class=per_class,
        confusion_matrix=cm.tolist(),
        total_evaluated_pixels=total_valid,
        terrain_stratification=terrain_strat,
    )
