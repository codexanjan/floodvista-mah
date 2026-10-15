"""Bilingual Situation Report Generator for FLOODVISTA AI.

Produces deterministic, audit-traceable incident reports in both English and
Nepali (द्विभाषिक विपद् स्थिति प्रतिवेदन). All metrics are directly pulled
from computed analysis records and strictly adhere to data boundaries.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

__all__ = ["IncidentSummary", "BilingualSituationReport", "generate_situation_report"]


@dataclass(frozen=True)
class CutoffSettlementSummary:
    name: str
    nearest_hub: str
    baseline_distance_km: float
    scenario_distance_km: Optional[float]
    status: str
    detour_multiplier: Optional[float]
    alternative_route_available: bool


@dataclass(frozen=True)
class PriorityActionItem:
    location: str
    urgency_tier: str
    reason: str
    recommended_action: str


@dataclass(frozen=True)
class IncidentSummary:
    aoi_id: str
    event_name: str
    event_date: str
    assessed_area_km2: float
    inundation_extent_ha: float
    exposed_buildings_count: int
    exposed_bridges_count: int
    flooded_road_km: float
    potentially_disrupted_road_km: float
    cutoff_settlements: List[CutoffSettlementSummary]
    priority_actions: List[PriorityActionItem]
    trustscore_percent: float
    observation_sources: List[str]
    is_synthetic: bool = False


@dataclass(frozen=True)
class BilingualSituationReport:
    report_id: str
    generated_at_utc: str
    summary: IncidentSummary
    english_markdown: str
    nepali_markdown: str
    english_html: str
    nepali_html: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def generate_situation_report(summary: IncidentSummary) -> BilingualSituationReport:
    """Generate deterministic English and Nepali incident reports."""
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    report_id = f"FV-REP-{summary.aoi_id.upper()}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M')}"

    # Build English Markdown
    cutoff_rows_en = "\n".join(
        f"| {s.name} | {s.nearest_hub} | {s.baseline_distance_km:.1f} km | "
        f"{f'{s.scenario_distance_km:.1f} km' if s.scenario_distance_km else 'BLOCKED'} | "
        f"{s.status} | {'YES' if s.alternative_route_available else 'NO'} |"
        for s in summary.cutoff_settlements
    ) or "| None detected | - | - | - | CONNECTED | YES |"

    priority_rows_en = "\n".join(
        f"- **[{p.urgency_tier}] {p.location}**: {p.reason}. *Action*: {p.recommended_action}"
        for p in summary.priority_actions
    ) or "- No critical priority actions required at this time."

    sources_list_en = ", ".join(summary.observation_sources)

    en_md = f"""# FLOODVISTA AI — RAPID INCIDENT SITUATION REPORT
**Document ID:** `{report_id}`  
**Issue Timestamp:** {now_utc}  
**Event Name:** {summary.event_name}  
**Event Date:** {summary.event_date} | **AOI ID:** `{summary.aoi_id}`  
**Mode:** {"⚠️ SYNTHETIC DEMONSTRATION FIXTURE" if summary.is_synthetic else "🛰️ OPERATIONAL SATELLITE PIPELINE"}

---

## 1. Executive Damage & Exposure Summary
Satellite observations processed through the FLOODVISTA multimodal pipeline provide the following damage indicators:

| Critical Indicator | Computed Measurement | Evidence Classification |
|---|---|---|
| **Total Assessed Area** | {summary.assessed_area_km2:,.1f} km² | Spatial Boundary |
| **Modelled Inundation Extent** | {summary.inundation_extent_ha:,.2f} hectares | Spatially Inferred (Sentinel-1 SAR) |
| **Exposed Buildings** | {summary.exposed_buildings_count:,} structures | Spatially Inferred (Pre-event OSM) |
| **Exposed Bridges** | {summary.exposed_bridges_count:,} critical links | Spatially Inferred (Pre-event OSM) |
| **Flooded Road Segments** | {summary.flooded_road_km:.2f} km | Spatially Inferred |
| **Potentially Disrupted Corridors** | {summary.potentially_disrupted_road_km:.2f} km | Network Inferred |
| **Overall Evidence TrustScore** | **{summary.trustscore_percent:.1f}%** | Multi-sensor Consistency Index |

---

## 2. Settlement Isolation & Road Network Resilience
Graph connectivity analysis across pre-event and post-flood road networks:

| Settlement | Primary Hub | Baseline Route | Post-Event Route | Impact Status | Alternate Access |
|---|---|---|---|---|---|
{cutoff_rows_en}

*Note: Disruption indicates modeled loss of road accessibility, not confirmed physical destruction.*

---

## 3. Priority Assessment Queue
Immediate ground or drone verification is recommended for the following high-priority locations:
{priority_rows_en}

---

## 4. Scientific Provenance & Boundary Safeguards
- **Input Sources:** {sources_list_en}
- **Data Boundary Safeguard:** External post-event damage vectors quarantined as validation-only references.
- **Attribution:** Contains modified Copernicus Sentinel data (2026), Copernicus WorldDEM-30 © DLR/Airbus/ESA, © OpenStreetMap contributors.
"""

    # Build Nepali Markdown (नेपाली संस्करण)
    cutoff_rows_ne = "\n".join(
        f"| {s.name} | {s.nearest_hub} | {s.baseline_distance_km:.1f} कि.मी. | "
        f"{f'{s.scenario_distance_km:.1f} कि.मी.' if s.scenario_distance_km else 'अवरुद्ध'} | "
        f"{'सम्पर्कविच्छेद' if s.status == 'POTENTIALLY_CUT_OFF' else 'सम्पर्कमा'} | {'छ' if s.alternative_route_available else 'छैन'} |"
        for s in summary.cutoff_settlements
    ) or "| कुनै पनि देखिएन | - | - | - | सम्पर्कमा | छ |"

    priority_rows_ne = "\n".join(
        f"- **[{'अति आवश्यक' if p.urgency_tier == 'CRITICAL' else 'उच्च प्राथमिकता'}] {p.location}**: {p.reason}। *सिफारिस कार्य*: {p.recommended_action}"
        for p in summary.priority_actions
    ) or "- हाल कुनै आकस्मिक कार्य आवश्यक देखिएको छैन।"

    ne_md = f"""# फ्लडभिस्टा एआई (FLOODVISTA AI) — द्रुत विपद् स्थिति प्रतिवेदन
**दस्तावेज पहिचान:** `{report_id}`  
**जारी मिति:** {now_utc}  
**विपद् घटना:** {summary.event_name}  
**घटना मिति:** {summary.event_date} | **प्रभावित क्षेत्र पहिचान:** `{summary.aoi_id}`  
**मोड:** {"⚠️ कृत्रिम प्रदर्शन नमूना (डेमो)" if summary.is_synthetic else "🛰️ प्रत्यक्ष उपग्रह विश्लेषण प्रणाली"}

---

## १. क्षति तथा जोखिम सारांश
FLOODVISTA बहु-मोडल उपग्रह विश्लेषणबाट प्राप्त आधिकारिक तथ्याङ्क:

| महत्वपूर्ण सूचक | मापन गरिएको तथ्याङ्क | प्रमाण वर्गीकरण |
|---|---|---|
| **कुल मूल्याङ्कन गरिएको क्षेत्रफल** | {summary.assessed_area_km2:,.1f} वर्ग कि.मी. | भौगोलिक सीमा |
| **जलमग्न/बाढी फैलावट** | {summary.inundation_extent_ha:,.2f} हेक्टर | उपग्रह राडार अनुमानित (Sentinel-1 SAR) |
| **जोखिममा परेका घर/संरचना** | {summary.exposed_buildings_count:,} वटा | स्थानिक अनुमान (Pre-event OSM) |
| **जोखिममा परेका पुलहरू** | {summary.exposed_bridges_count:,} वटा | स्थानिक अनुमान (Pre-event OSM) |
| **बाढीले छोएको सडक** | {summary.flooded_road_km:.2f} कि.मी. | स्थानिक अनुमान |
| **सम्भावित अवरुद्ध सडक सञ्जाल** | {summary.potentially_disrupted_road_km:.2f} कि.मी. | सञ्जाल विश्लेषण |
| **विश्लेषण विश्वसनीयता (TrustScore)** | **{summary.trustscore_percent:.1f}%** | बहु-स्रोत प्रमाण सूचकाङ्क |

---

## २. बस्तीहरूको पहुँच र सडक सञ्जाल विश्लेषण
बाढी पूर्व र पश्चातको सडक सञ्जालको विश्लेषण (ग्राफ कनेक्टिभिटी):

| बस्तीको नाम | मुख्य केन्द्र/अस्पताल | पहिलेको दूरी | विपद् पछिको दूरी | अवस्था | वैकल्पिक मार्ग |
|---|---|---|---|---|---|
{cutoff_rows_ne}

*सूचना: 'सम्पर्कविच्छेद' ले सडक आवागमनमा अवरोध जनाउँछ, भौतिक संरचना पूर्ण नष्ट भएको पुष्टि गर्दैन।*

---

## ३. प्राथमिकताका आधारमा सिफारिस गरिएका कार्यहरू
स्थलगत निरीक्षण तथा ड्रोन टोली परिचालनका लागि तत्काल ध्यान दिनुपर्ने क्षेत्रहरू:
{priority_rows_ne}

---

## ४. वैज्ञानिक प्रमाण र स्रोत जानकारी
- **प्रयोग गरिएका स्रोतहरू:** {sources_list_en}
- **तथ्याङ्क गोपनीयता तथा शुद्धता:** कुनै पनि बाह्य पुष्टिकरण नक्सालाई मोडेलको इनपुटमा मिसाइएको छैन।
- **प्रतिलिपि अधिकार:** Contains modified Copernicus Sentinel data (2026), Copernicus WorldDEM-30 © DLR/Airbus/ESA, © OpenStreetMap contributors.
"""

    # Generate clean HTML templates
    en_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>FLOODVISTA AI Incident Report - {summary.aoi_id}</title>
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }}
h1 {{ color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }}
h2 {{ color: #0f172a; margin-top: 28px; }}
table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
th, td {{ border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }}
th {{ background-color: #f1f5f9; color: #334155; }}
.badge {{ display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; background: #e0f2fe; color: #0369a1; }}
.alert {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 20px 0; }}
</style>
</head>
<body>
<span class="badge">{report_id}</span>
<h1>FLOODVISTA AI — Incident Situation Report</h1>
<p><strong>Generated:</strong> {now_utc} | <strong>Event:</strong> {summary.event_name} ({summary.event_date})</p>
<hr>
<h2>1. Executive Damage & Exposure Summary</h2>
<table>
<tr><th>Critical Indicator</th><th>Computed Value</th><th>Evidence Tier</th></tr>
<tr><td>Total Assessed Area</td><td><strong>{summary.assessed_area_km2:,.1f} km²</strong></td><td>Spatial AOI</td></tr>
<tr><td>Modelled Inundation Extent</td><td><strong>{summary.inundation_extent_ha:,.2f} ha</strong></td><td>Spatially Inferred</td></tr>
<tr><td>Exposed Buildings</td><td><strong>{summary.exposed_buildings_count:,}</strong></td><td>Spatially Inferred</td></tr>
<tr><td>Exposed Bridges</td><td><strong>{summary.exposed_bridges_count:,}</strong></td><td>Spatially Inferred</td></tr>
<tr><td>Potentially Disrupted Roads</td><td><strong>{summary.potentially_disrupted_road_km:.2f} km</strong></td><td>Network Inferred</td></tr>
<tr><td>Evidence TrustScore</td><td><strong>{summary.trustscore_percent:.1f}%</strong></td><td>Multi-sensor Index</td></tr>
</table>
<h2>2. Settlement Accessibility & Road Network</h2>
<table>
<tr><th>Settlement</th><th>Nearest Hub</th><th>Normal Distance</th><th>Post-Event Distance</th><th>Status</th><th>Alternate Route</th></tr>
{"".join(f"<tr><td>{s.name}</td><td>{s.nearest_hub}</td><td>{s.baseline_distance_km:.1f} km</td><td>{f'{s.scenario_distance_km:.1f} km' if s.scenario_distance_km else 'BLOCKED'}</td><td><strong>{s.status}</strong></td><td>{'YES' if s.alternative_route_available else 'NO'}</td></tr>" for s in summary.cutoff_settlements)}
</table>
<h2>3. Immediate Priority Actions</h2>
<ul>
{"".join(f"<li><strong>[{p.urgency_tier}] {p.location}</strong>: {p.reason} (<em>Action: {p.recommended_action}</em>)</li>" for p in summary.priority_actions)}
</ul>
<hr>
<p><small>© FLOODVISTA AI • Copernicus Sentinel • OpenStreetMap</small></p>
</body>
</html>"""

    ne_html = f"""<!DOCTYPE html>
<html lang="ne">
<head>
<meta charset="utf-8">
<title>फ्लडभिस्टा एआई विपद् प्रतिवेदन - {summary.aoi_id}</title>
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }}
h1 {{ color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }}
h2 {{ color: #0f172a; margin-top: 28px; }}
table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
th, td {{ border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }}
th {{ background-color: #f1f5f9; color: #334155; }}
.badge {{ display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: bold; background: #e0f2fe; color: #0369a1; }}
</style>
</head>
<body>
<span class="badge">{report_id}</span>
<h1>फ्लडभिस्टा एआई (FLOODVISTA AI) — द्रुत विपद् स्थिति प्रतिवेदन</h1>
<p><strong>जारी मिति:</strong> {now_utc} | <strong>घटना:</strong> {summary.event_name} ({summary.event_date})</p>
<hr>
<h2>१. क्षति तथा जोखिम सारांश</h2>
<table>
<tr><th>महत्वपूर्ण सूचक</th><th>मापन गरिएको तथ्याङ्क</th><th>प्रमाण वर्गीकरण</th></tr>
<tr><td>कुल मूल्याङ्कन गरिएको क्षेत्रफल</td><td><strong>{summary.assessed_area_km2:,.1f} वर्ग कि.मी.</strong></td><td>भौगोलिक सीमा</td></tr>
<tr><td>जलमग्न/बाढी फैलावट</td><td><strong>{summary.inundation_extent_ha:,.2f} हेक्टर</strong></td><td>उपग्रह अनुमानित</td></tr>
<tr><td>जोखिममा परेका घर/संरचना</td><td><strong>{summary.exposed_buildings_count:,}</strong></td><td>स्थानिक अनुमान</td></tr>
<tr><td>जोखिममा परेका पुलहरू</td><td><strong>{summary.exposed_bridges_count:,}</strong></td><td>स्थानिक अनुमान</td></tr>
<tr><td>सम्भावित अवरुद्ध सडक</td><td><strong>{summary.potentially_disrupted_road_km:.2f} कि.मी.</strong></td><td>सञ्जाल विश्लेषण</td></tr>
<tr><td>विश्वसनीयता सूचकाङ्क</td><td><strong>{summary.trustscore_percent:.1f}%</strong></td><td>प्रमाण सूचकाङ्क</td></tr>
</table>
<h2>२. बस्तीहरूको पहुँच र सडक सञ्जाल</h2>
<table>
<tr><th>बस्ती</th><th>मुख्य केन्द्र</th><th>पहिलेको दूरी</th><th>पछिको दूरी</th><th>अवस्था</th><th>वैकल्पिक मार्ग</th></tr>
{"".join(f"<tr><td>{s.name}</td><td>{s.nearest_hub}</td><td>{s.baseline_distance_km:.1f} कि.मी.</td><td>{f'{s.scenario_distance_km:.1f} कि.मी.' if s.scenario_distance_km else 'अवरुद्ध'}</td><td><strong>{'सम्पर्कविच्छेद' if s.status == 'POTENTIALLY_CUT_OFF' else 'सम्पर्कमा'}</strong></td><td>{'छ' if s.alternative_route_available else 'छैन'}</td></tr>" for s in summary.cutoff_settlements)}
</table>
<h2>३. प्राथमिकताका आधारमा सिफारिस गरिएका कार्यहरू</h2>
<ul>
{"".join(f"<li><strong>[{'अति आवश्यक' if p.urgency_tier == 'CRITICAL' else 'उच्च प्राथमिकता'}] {p.location}</strong>: {p.reason} (<em>कार्य: {p.recommended_action}</em>)</li>" for p in summary.priority_actions)}
</ul>
<hr>
<p><small>© FLOODVISTA AI • Copernicus Sentinel • OpenStreetMap</small></p>
</body>
</html>"""

    return BilingualSituationReport(
        report_id=report_id,
        generated_at_utc=now_utc,
        summary=summary,
        english_markdown=en_md,
        nepali_markdown=ne_md,
        english_html=en_html,
        nepali_html=ne_html,
    )
