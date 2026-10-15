"""Unit and integration tests for FLOODVISTA AI core modules:
- Segmentation predictor
- Evaluation metrics
- Downstream terrain flow path
- Bilingual situation reports
- Offline rescue pack
- FastAPI endpoints
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient

from floodmap.api.server import app
from floodmap.evaluation.evaluator import evaluate_predictions
from floodmap.hydrology.path import trace_downstream_path
from floodmap.reporting.report import (
    CutoffSettlementSummary,
    IncidentSummary,
    PriorityActionItem,
    generate_situation_report,
)
from floodmap.reporting.rescue_pack import build_offline_rescue_pack
from floodmap.segmentation.channels import FLOOD_CLASS_ID, NUM_CLASSES
from floodmap.inference.predict import Predictor


def test_predictor_forward_shape():
    """Verify Predictor runs tiled inference and respects channel contracts."""
    predictor = Predictor(tile_size=64, overlap=16)
    # 4 channels: pre_vv, pre_vh, post_vv, post_vh
    fake_sar = np.random.uniform(0.01, 0.15, (4, 128, 128)).astype(np.float32)
    valid_mask = np.ones((128, 128), dtype=bool)
    valid_mask[0:10, 0:10] = False  # test nodata sentinel

    classes, probs, flood_conf = predictor.predict_array(fake_sar, valid_mask=valid_mask)

    assert classes.shape == (128, 128)
    assert probs.shape == (NUM_CLASSES, 128, 128)
    assert flood_conf.shape == (128, 128)
    # Nodata sentinel 255 applied where invalid
    assert (classes[0:10, 0:10] == 255).all()
    # Confidence in [0, 1]
    assert np.all((flood_conf >= 0.0) & (flood_conf <= 1.0))


def test_evaluation_metrics():
    """Verify IoU, Dice, Precision, and Recall calculation."""
    y_true = np.array([
        [0, 0, 1, 1],
        [0, 2, 2, 1],
        [2, 2, 2, 255],
    ], dtype=np.uint8)

    y_pred = np.array([
        [0, 0, 1, 1],
        [0, 2, 0, 1],
        [2, 2, 2, 0],
    ], dtype=np.uint8)

    report = evaluate_predictions(y_true, y_pred, ignore_val=255)

    assert report.total_evaluated_pixels == 11
    assert 0.0 <= report.mean_iou <= 1.0
    assert 0.0 <= report.flood_iou <= 1.0
    assert 0.0 <= report.flood_dice <= 1.0
    assert report.flood_precision > 0.0
    assert report.flood_recall > 0.0
    assert len(report.confusion_matrix) == NUM_CLASSES


def test_hydrology_downstream_path():
    """Verify terrain-aware steepest descent flow path calculation."""
    result = trace_downstream_path(
        source_point=(85.11, 28.08),
        corridor_buffer_m=100.0,
        flow_speed_m_per_s=5.0,
    )

    assert result.path_length_km > 0.0
    assert result.flow_corridor_geojson["type"] in ("Polygon", "MultiPolygon")
    assert result.path_line_geojson["type"] in ("LineString", "MultiLineString")
    assert len(result.downstream_settlements) > 0
    assert "TERRAIN-DERIVED SCREENING SCENARIO" in result.disclaimer


def test_bilingual_situation_reports():
    """Verify deterministic English and Nepali report generation."""
    summary = IncidentSummary(
        aoi_id="trishuli-test",
        event_name="Trishuli Flood Test",
        event_date="2026-08-26",
        assessed_area_km2=250.0,
        inundation_extent_ha=12.5,
        exposed_buildings_count=15,
        exposed_bridges_count=2,
        flooded_road_km=2.4,
        potentially_disrupted_road_km=5.1,
        cutoff_settlements=[
            CutoffSettlementSummary("Ghyalchok", "Trishuli", 4.0, None, "POTENTIALLY_CUT_OFF", None, False)
        ],
        priority_actions=[
            PriorityActionItem("Bridge 1", "CRITICAL", "Flooded", "Inspect")
        ],
        trustscore_percent=92.5,
        observation_sources=["Sentinel-1 SAR", "Copernicus DEM"],
        is_synthetic=True,
    )

    report = generate_situation_report(summary)

    assert "FLOODVISTA AI" in report.english_markdown
    assert "250.0 km²" in report.english_markdown
    assert "Ghyalchok" in report.english_markdown
    assert "फ्लडभिस्टा एआई" in report.nepali_markdown
    assert "२५०.०" in report.nepali_markdown or "250.0" in report.nepali_markdown
    assert "सम्पर्कविच्छेद" in report.nepali_markdown


def test_offline_rescue_pack(tmp_path: Path):
    """Verify zip creation of complete offline rescue package."""
    summary = IncidentSummary(
        aoi_id="trishuli-test",
        event_name="Trishuli Flood Test",
        event_date="2026-08-26",
        assessed_area_km2=250.0,
        inundation_extent_ha=12.5,
        exposed_buildings_count=15,
        exposed_bridges_count=2,
        flooded_road_km=2.4,
        potentially_disrupted_road_km=5.1,
        cutoff_settlements=[],
        priority_actions=[],
        trustscore_percent=92.5,
        observation_sources=["Sentinel-1 SAR"],
        is_synthetic=True,
    )

    zip_file = tmp_path / "rescue_pack.zip"
    build_offline_rescue_pack(
        summary=summary,
        output_zip_path=zip_file,
        geojson_layers={"test_layer": {"type": "FeatureCollection", "features": []}},
    )

    assert zip_file.exists()
    assert zip_file.stat().st_size > 100


def test_api_endpoints():
    """Verify all FastAPI REST endpoints function correctly."""
    client = TestClient(app)

    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_sources = client.get("/api/data/sources")
    assert res_sources.status_code == 200
    assert "permitted_production_sources" in res_sources.json()

    res_meta = client.get("/api/metadata")
    assert res_meta.status_code == 200
    assert res_meta.json()["app_title"] == "FLOODVISTA AI"

    res_analyses = client.get("/api/analyses")
    assert res_analyses.status_code == 200
    assert len(res_analyses.json()) >= 1

    res_summary = client.get("/api/analyses/trishuli-demo")
    assert res_summary.status_code == 200
    assert "inundation_extent_ha" in res_summary.json()

    res_scenarios = client.post(
        "/api/analyses/trishuli-demo/scenarios",
        json={"road_disruption_m": 30.0, "flood_prob_threshold": 0.5, "spatial_buffer_m": 15.0},
    )
    assert res_scenarios.status_code == 200
    assert "scenario_comparison_matrix" in res_scenarios.json()

    res_eval = client.get("/api/analyses/trishuli-demo/evaluation")
    assert res_eval.status_code == 200
    assert res_eval.json()["mean_iou"] > 0.7

    res_rep = client.post("/api/analyses/trishuli-demo/reports")
    assert res_rep.status_code == 200
    assert "english_markdown" in res_rep.json()
    assert "nepali_markdown" in res_rep.json()
