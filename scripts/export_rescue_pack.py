#!/usr/bin/env python3
"""CLI script to build a self-contained Offline Rescue Pack archive.

Packages bilingual reports, GeoJSON layers, and an offline interactive HTML
tactical viewer for deployment in disaster zones with no internet.
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

from floodmap.reporting.report import (
    CutoffSettlementSummary,
    IncidentSummary,
    PriorityActionItem,
)
from floodmap.reporting.rescue_pack import build_offline_rescue_pack


def load_layer(path: Path) -> dict:
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--aoi-id", default="trishuli-demo")
    parser.add_argument("--output-zip", type=Path, default=Path("artifacts/rescue_packs/FLOODVISTA_Rescue_Pack_trishuli.zip"))
    parser.add_argument("--demo-layers-dir", type=Path, default=Path("artifacts/dashboard_demo/layers"))

    args = parser.parse_args()

    summary = IncidentSummary(
        aoi_id=args.aoi_id,
        event_name="Trishuli Valley Flash Flood",
        event_date="2026-08-26",
        assessed_area_km2=450.0,
        inundation_extent_ha=14.8,
        exposed_buildings_count=18,
        exposed_bridges_count=2,
        flooded_road_km=3.42,
        potentially_disrupted_road_km=8.65,
        cutoff_settlements=[
            CutoffSettlementSummary("Ghyalchok Upper", "Trishuli Town", 5.1, None, "POTENTIALLY_CUT_OFF", None, False),
            CutoffSettlementSummary("Thulo Dovan", "Dhunche Hospital", 3.8, 7.2, "POTENTIALLY_DISRUPTED", 1.89, True),
        ],
        priority_actions=[
            PriorityActionItem("Ghyalchok Road", "CRITICAL", "Road access severed", "Helicopter reconnaissance"),
        ],
        trustscore_percent=94.2,
        observation_sources=["Sentinel-1 SAR", "Copernicus DEM", "Pre-event OpenStreetMap"],
        is_synthetic=True,
    )

    layers = {
        "buildings": load_layer(args.demo_layers_dir / "buildings_exposed.geojson"),
        "roads": load_layer(args.demo_layers_dir / "roads.geojson"),
        "settlements": load_layer(args.demo_layers_dir / "settlements.geojson"),
    }

    out_zip = build_offline_rescue_pack(summary, args.output_zip, layers)
    print(f"[FLOODVISTA AI] Offline rescue pack successfully created:")
    print(f"  Archive: {out_zip} ({out_zip.stat().st_size:,} bytes)")
    print(f"  Includes: EN/NE SitReps, offline tactical map HTML, GeoJSON layers, incident JSON.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
