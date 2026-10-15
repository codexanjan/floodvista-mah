#!/usr/bin/env python3
"""CLI script to run terrain-aware downstream flood path simulation.

Outputs flow corridor and path GeoJSON to artifacts/hydrology/.
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

from floodmap.hydrology.path import trace_downstream_path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-lon", type=float, default=85.112)
    parser.add_argument("--source-lat", type=float, default=28.085)
    parser.add_argument("--buffer-m", type=float, default=120.0)
    parser.add_argument("--speed-mps", type=float, default=6.0)
    parser.add_argument("--output-dir", type=Path, default=Path("artifacts/hydrology"))

    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    print(f"[FLOODVISTA AI] Simulating downhill flood wave from ({args.source_lon}, {args.source_lat})...")
    result = trace_downstream_path(
        source_point=(args.source_lon, args.source_lat),
        corridor_buffer_m=args.buffer_m,
        flow_speed_m_per_s=args.speed_mps,
    )

    path_geo_file = args.output_dir / "downstream_path.geojson"
    corridor_geo_file = args.output_dir / "hazard_corridor.geojson"
    summary_file = args.output_dir / "hydrology_summary.json"

    with open(path_geo_file, "w", encoding="utf-8") as f:
        json.dump(result.path_line_geojson, f, indent=2)
    with open(corridor_geo_file, "w", encoding="utf-8") as f:
        json.dump(result.flow_corridor_geojson, f, indent=2)
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(result.to_dict(), f, indent=2)

    print(f"[FLOODVISTA AI] Simulation completed:")
    print(f"  Path length:     {result.path_length_km:.2f} km")
    print(f"  Elevation drop:  {result.elevation_drop_m:.1f} m (avg slope: {result.average_slope_degrees:.1f}°)")
    print(f"  Downstream path: {path_geo_file}")
    print(f"  Hazard corridor: {corridor_geo_file}")
    print(f"  Settlements in path: {len(result.downstream_settlements)}")
    for s in result.downstream_settlements:
        print(f"    - {s.name:22s} : {s.distance_along_path_km:.1f} km downstream (ETA: ~{s.estimated_arrival_minutes:.0f} min)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
