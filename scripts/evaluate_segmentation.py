#!/usr/bin/env python3
"""Run model evaluation comparing ground truth reference to model prediction.

Generates machine-readable metrics.json and a formatted scientific benchmark table.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
_SRC = _REPOSITORY_ROOT / "src"
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

import numpy as np
import rasterio

from floodmap.evaluation.evaluator import evaluate_predictions


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--ground-truth",
        type=Path,
        required=True,
        help="Path to reference ground-truth raster GeoTIFF",
    )
    parser.add_argument(
        "--prediction",
        type=Path,
        required=True,
        help="Path to model prediction raster GeoTIFF",
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        default=Path("artifacts/evaluation/metrics.json"),
        help="Output path for evaluation JSON results",
    )
    parser.add_argument(
        "--slope-raster",
        type=Path,
        default=None,
        help="Optional slope raster for terrain error stratification",
    )

    args = parser.parse_args()

    with rasterio.open(args.ground_truth) as src_t:
        y_true = src_t.read(1)
    with rasterio.open(args.prediction) as src_p:
        y_pred = src_p.read(1)

    slope = None
    if args.slope_raster and Path(args.slope_raster).exists():
        with rasterio.open(args.slope_raster) as src_s:
            slope = src_s.read(1)

    print(f"[FLOODVISTA AI] Evaluating prediction against reference ground truth...")
    report = evaluate_predictions(y_true, y_pred, slope_raster=slope)

    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output_json, "w", encoding="utf-8") as f:
        json.dump(report.to_dict(), f, indent=2)

    print("\n" + "=" * 65)
    print(" FLOODVISTA AI — SEGMENTATION EVALUATION BENCHMARK REPORT")
    print("=" * 65)
    print(f" Total Evaluated Pixels : {report.total_evaluated_pixels:,}")
    print(f" Mean IoU (mIoU)        : {report.mean_iou:.4f}")
    print(f" Mean Dice / F1         : {report.mean_dice:.4f}")
    print(f" Overall Pixel Accuracy : {report.overall_accuracy * 100:.2f}%")
    print("-" * 65)
    print(" PRIMARY TARGET METRICS (CLASS 2: FLOODS):")
    print(f"   Flood IoU            : {report.flood_iou:.4f}")
    print(f"   Flood Dice / F1      : {report.flood_dice:.4f}")
    print(f"   Flood Precision      : {report.flood_precision:.4f}")
    print(f"   Flood Recall         : {report.flood_recall:.4f}")
    print("-" * 65)
    print(" PER-CLASS BREAKDOWN:")
    for cname, cm in report.per_class.items():
        print(f"   {cname:18s} | IoU: {cm.iou:.4f} | F1: {cm.dice_f1:.4f} | Prec: {cm.precision:.4f} | Rec: {cm.recall:.4f} | Support: {cm.support:,}")
    print("=" * 65)
    print(f" Machine-readable metrics written to: {args.output_json}\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
