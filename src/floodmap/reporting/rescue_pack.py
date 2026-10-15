"""Offline Rescue Pack Packager for FLOODVISTA AI.

Bundles all critical disaster intelligence into a compact, self-contained ZIP
archive for deployment in field scenarios with severed internet connectivity:
- Bilingual Situation Reports (English + Nepali) in Markdown and HTML
- GeoJSON vector layers (exposed buildings, disrupted roads, cut-off settlements)
- Standalone self-contained offline interactive HTML viewer
- Data provenance, attribution, and model run metadata
"""

from __future__ import annotations

import json
import zipfile
from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, List, Optional

from floodmap.reporting.report import BilingualSituationReport, generate_situation_report, IncidentSummary

__all__ = ["build_offline_rescue_pack"]


def _generate_standalone_offline_viewer(
    summary: IncidentSummary,
    geojson_layers: Dict[str, Dict[str, Any]],
) -> str:
    """Produce a standalone single-file HTML/JS interactive map that requires no web server."""
    layers_json_str = json.dumps(geojson_layers)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>FLOODVISTA AI — Offline Tactical Field Map ({summary.aoi_id})</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  body, html {{ margin: 0; padding: 0; height: 100%; font-family: -apple-system, sans-serif; background: #0b132b; color: #fff; }}
  #header {{ height: 50px; background: #1c2541; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; border-bottom: 2px solid #00f2fe; }}
  #map {{ height: calc(100% - 50px); width: 100%; background: #050811; }}
  .badge {{ background: #00f2fe; color: #050811; font-weight: bold; padding: 4px 8px; border-radius: 4px; font-size: 12px; }}
  .panel {{ position: absolute; bottom: 20px; left: 20px; z-index: 1000; background: rgba(11, 19, 43, 0.9); padding: 14px; border-radius: 8px; border: 1px solid rgba(0, 242, 254, 0.3); max-width: 300px; }}
</style>
</head>
<body>
<div id="header">
  <div><strong>FLOODVISTA AI</strong> &bull; Offline Tactical Map &bull; <em>{summary.event_name}</em></div>
  <span class="badge">OFFLINE PACK ACTIVE</span>
</div>
<div id="map"></div>
<div class="panel">
  <h4 style="margin:0 0 8px 0; color:#00f2fe;">Quick Telemetry</h4>
  <div>Area: <strong>{summary.assessed_area_km2:.1f} km²</strong></div>
  <div>Inundation: <strong>{summary.inundation_extent_ha:.1f} ha</strong></div>
  <div>Exposed Buildings: <strong>{summary.exposed_buildings_count}</strong></div>
  <div>Cut-off Hamlets: <strong style="color:#ef4444;">{len(summary.cutoff_settlements)}</strong></div>
</div>
<script>
  const layers = {layers_json_str};
  const map = L.map('map').setView([28.003, 85.097], 14);

  L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }}).addTo(map);

  if (layers.buildings) {{
    L.geoJSON(layers.buildings, {{
      style: {{ color: '#ef4444', weight: 2, fillOpacity: 0.6 }}
    }}).bindPopup(layer => `<strong>Building</strong><br>Status: ${{layer.feature.properties.exposure_status || 'Exposed'}}`).addTo(map);
  }}

  if (layers.roads) {{
    L.geoJSON(layers.roads, {{
      style: feature => ({{
        color: feature.properties.potentially_disrupted ? '#f59e0b' : '#3b82f6',
        weight: 3
      }})
    }}).addTo(map);
  }}

  if (layers.settlements) {{
    L.geoJSON(layers.settlements, {{
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {{
        radius: 8,
        fillColor: feature.properties.potentially_cut_off ? '#ef4444' : '#10b981',
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      }})
    }}).bindPopup(layer => `<strong>${{layer.feature.properties.name}}</strong><br>Status: ${{layer.feature.properties.potentially_cut_off ? 'POTENTIALLY CUT OFF' : 'CONNECTED'}}`).addTo(map);
  }}
</script>
</body>
</html>"""


def build_offline_rescue_pack(
    summary: IncidentSummary,
    output_zip_path: Path,
    geojson_layers: Dict[str, Dict[str, Any]],
) -> Path:
    """Build and save a self-contained offline rescue zip package."""
    output_zip_path = Path(output_zip_path)
    output_zip_path.parent.mkdir(parents=True, exist_ok=True)

    report = generate_situation_report(summary)
    offline_viewer_html = _generate_standalone_offline_viewer(summary, geojson_layers)

    with zipfile.ZipFile(output_zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Write reports
        zf.writestr("SITUATION_REPORT_EN.md", report.english_markdown)
        zf.writestr("SITUATION_REPORT_NE.md", report.nepali_markdown)
        zf.writestr("SITUATION_REPORT_EN.html", report.english_html)
        zf.writestr("SITUATION_REPORT_NE.html", report.nepali_html)
        zf.writestr("offline_map_viewer.html", offline_viewer_html)

        # Write geojson layers
        for layer_name, data in geojson_layers.items():
            zf.writestr(f"layers/{layer_name}.geojson", json.dumps(data, indent=2))

        # Write machine-readable summary
        zf.writestr("incident_summary.json", json.dumps(asdict(summary), indent=2))

    return output_zip_path
