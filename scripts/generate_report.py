#!/usr/bin/env python3
"""CLI script to generate bilingual situation reports in English and Nepali.

Outputs Markdown and HTML reports in artifacts/reports/.
"""

from __future__ import annotations

import argparse
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
    generate_situation_report,
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--aoi-id", default="trishuli-demo")
    parser.add_argument("--event-name", default="Trishuli Valley Flash Flood & Debris Inundation")
    parser.add_argument("--event-date", default="2026-08-26")
    parser.add_argument("--output-dir", type=Path, default=Path("artifacts/reports"))

    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    summary = IncidentSummary(
        aoi_id=args.aoi_id,
        event_name=args.event_name,
        event_date=args.event_date,
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
            PriorityActionItem("Ghyalchok Culvert", "CRITICAL", "Lifeline blocked", "Air-drop medical supplies"),
            PriorityActionItem("Thulo Dovan Bridge", "HIGH", "Abutment exposed", "Deploy structural engineering inspection"),
        ],
        trustscore_percent=94.2,
        observation_sources=["Sentinel-1 SAR", "Sentinel-2 MSI", "Copernicus DEM", "Pre-event OpenStreetMap"],
        is_synthetic=True,
    )

    report = generate_situation_report(summary)

    en_md_path = args.output_dir / "situation_report_en.md"
    ne_md_path = args.output_dir / "situation_report_ne.md"
    en_html_path = args.output_dir / "situation_report_en.html"
    ne_html_path = args.output_dir / "situation_report_ne.html"

    en_md_path.write_text(report.english_markdown, encoding="utf-8")
    ne_md_path.write_text(report.nepali_markdown, encoding="utf-8")
    en_html_path.write_text(report.english_html, encoding="utf-8")
    ne_html_path.write_text(report.nepali_html, encoding="utf-8")

    print(f"[FLOODVISTA AI] Bilingual situation reports generated:")
    print(f"  English Markdown: {en_md_path}")
    print(f"  Nepali Markdown:  {ne_md_path}")
    print(f"  English HTML:     {en_html_path}")
    print(f"  Nepali HTML:      {ne_html_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
