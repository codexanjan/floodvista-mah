import { AnalysisSummary, SettlementResilience, ScenarioResult, ModelEvaluation, HydrologyResult, BilingualReport } from './types';

export const DEFAULT_SUMMARY: AnalysisSummary = {
  analysis_id: 'trishuli-demo',
  event_name: 'Trishuli Valley Flash Flood & Debris Inundation',
  event_date: '2026-08-26',
  is_synthetic: true,
  assessed_area_km2: 450.0,
  inundation_extent_ha: 14.8,
  exposed_buildings_count: 18,
  exposed_bridges_count: 2,
  flooded_road_km: 3.42,
  potentially_disrupted_road_km: 8.65,
  cutoff_settlements: ['Ghyalchok Upper', 'Khar Mountain Hamlet'],
  trustscore_percent: 94.2,
  evidence_profile: {
    observed_pct: 82.5,
    spatially_inferred_pct: 14.1,
    network_inferred_pct: 3.4,
    sar_temporal_coherence: 'High (Same-orbit track)',
    optical_cloud_cover_pct: 12.0
  }
};

export const DEFAULT_LAYERS = {
  buildings: {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { id: "b1", exposure_status: "EXPOSED" }, geometry: { type: "Polygon", coordinates: [[[85.097, 28.004], [85.098, 28.004], [85.098, 28.005], [85.097, 28.005], [85.097, 28.004]]] } },
      { type: "Feature", properties: { id: "b2", exposure_status: "EXPOSED" }, geometry: { type: "Polygon", coordinates: [[[85.094, 28.001], [85.095, 28.001], [85.095, 28.002], [85.094, 28.002], [85.094, 28.001]]] } },
      { type: "Feature", properties: { id: "b3", exposure_status: "NOT_EXPOSED" }, geometry: { type: "Polygon", coordinates: [[[85.103, 28.005], [85.104, 28.005], [85.104, 28.006], [85.103, 28.006], [85.103, 28.005]]] } },
      { type: "Feature", properties: { id: "b4", exposure_status: "NOT_EXPOSED" }, geometry: { type: "Polygon", coordinates: [[[85.101, 28.008], [85.102, 28.008], [85.102, 28.009], [85.101, 28.009], [85.101, 28.008]]] } }
    ]
  },
  roads: {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { id: "r1", potentially_disrupted: true, highway: "primary", flooded_m: 34.5 }, geometry: { type: "LineString", coordinates: [[85.093, 28.000], [85.097, 28.004], [85.102, 28.008]] } },
      { type: "Feature", properties: { id: "r2", potentially_disrupted: true, highway: "secondary", flooded_m: 18.2 }, geometry: { type: "LineString", coordinates: [[85.097, 28.004], [85.099, 28.002], [85.103, 28.003]] } },
      { type: "Feature", properties: { id: "r3", potentially_disrupted: false, highway: "tertiary", flooded_m: 0.0 }, geometry: { type: "LineString", coordinates: [[85.093, 28.000], [85.091, 27.997], [85.088, 27.994]] } },
      { type: "Feature", properties: { id: "r4", potentially_disrupted: false, highway: "primary", flooded_m: 0.0 }, geometry: { type: "LineString", coordinates: [[85.103, 28.003], [85.107, 28.006], [85.112, 28.009]] } }
    ]
  },
  settlements: {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { name: "Sano Dovan", potentially_cut_off: false, settlement_type: "village" }, geometry: { type: "Point", coordinates: [85.09705, 28.004525] } },
      { type: "Feature", properties: { name: "Thulo Dovan", potentially_cut_off: false, settlement_type: "village" }, geometry: { type: "Point", coordinates: [85.09359, 28.000181] } },
      { type: "Feature", properties: { name: "Ghyalchok Upper", potentially_cut_off: true, settlement_type: "hamlet" }, geometry: { type: "Point", coordinates: [85.10295, 28.003258] } },
      { type: "Feature", properties: { name: "Khar Mountain Hamlet", potentially_cut_off: true, settlement_type: "isolated_hamlet" }, geometry: { type: "Point", coordinates: [85.10850, 28.009100] } }
    ]
  }
};

export const DEFAULT_CONNECTIVITY = {
  reference_hubs: [
    { id: "h1", name: "Dhunche District Hospital", type: "Hospital", coords: [85.093, 27.998] },
    { id: "h2", name: "Trishuli Administrative Town Center", type: "Town", coords: [85.105, 28.012] }
  ],
  settlements_resilience: [
    {
      name: "Sano Dovan",
      status: "CONNECTED",
      nearest_hub: "Dhunche District Hospital",
      baseline_distance_km: 2.4,
      post_event_distance_km: 2.4,
      detour_ratio: 1.0,
      alternative_route_available: true,
      explanation: "Primary valley road clear of detected flood inundation."
    },
    {
      name: "Thulo Dovan",
      status: "POTENTIALLY_DISRUPTED",
      nearest_hub: "Dhunche District Hospital",
      baseline_distance_km: 3.8,
      post_event_distance_km: 7.2,
      detour_ratio: 1.89,
      alternative_route_available: true,
      explanation: "Direct bridge segment flooded; re-routed via ridge bypass trail (+3.4 km)."
    },
    {
      name: "Ghyalchok Upper",
      status: "POTENTIALLY_CUT_OFF",
      nearest_hub: "Trishuli Town Center",
      baseline_distance_km: 5.1,
      post_event_distance_km: null,
      detour_ratio: null,
      alternative_route_available: false,
      explanation: "Single vehicular access road intersecting high-probability flood zone."
    },
    {
      name: "Khar Mountain Hamlet",
      status: "POTENTIALLY_CUT_OFF",
      nearest_hub: "Dhunche District Hospital",
      baseline_distance_km: 6.4,
      post_event_distance_km: null,
      detour_ratio: null,
      alternative_route_available: false,
      explanation: "Both lower bridge and middle spur road blocked by debris flows."
    }
  ]
};

export const DEFAULT_EVALUATION: ModelEvaluation = {
  dataset_name: "Kuro Siwo Multi-Temporal SAR Benchmark (Held-out Himalayan Test Fold)",
  model_architecture: "UNet Baseline (4-channel SAR: pre_vv, pre_vh, post_vv, post_vh)",
  total_evaluated_pixels: 3518208,
  mean_iou: 0.8124,
  mean_dice_f1: 0.8965,
  overall_pixel_accuracy: 0.9482,
  classes: {
    "No Water": {
      class_id: 0,
      iou: 0.9312,
      dice_f1: 0.9644,
      precision: 0.9710,
      recall: 0.9578,
      support: 2980140
    },
    "Permanent Water": {
      class_id: 1,
      iou: 0.7420,
      dice_f1: 0.8519,
      precision: 0.8654,
      recall: 0.8388,
      support: 248900
    },
    "Floods (Primary Target)": {
      class_id: 2,
      iou: 0.7640,
      dice_f1: 0.8662,
      precision: 0.9142,
      recall: 0.8229,
      support: 289168
    }
  },
  confusion_matrix: [
    [2854378, 42100, 83662],
    [19450, 208777, 20673],
    [35412, 15800, 237956]
  ],
  terrain_stratification: {
    "flat_0_to_5_deg": { flood_iou: 0.8415, pixel_count: 180400 },
    "moderate_5_to_15_deg": { flood_iou: 0.7930, pixel_count: 82100 },
    "steep_15_to_30_deg": { flood_iou: 0.6842, pixel_count: 21400 },
    "mountain_over_30_deg": { flood_iou: 0.5420, pixel_count: 5268 }
  }
};

export const DEFAULT_HYDROLOGY: HydrologyResult = {
  source_coordinates: [85.112, 28.085],
  source_elevation_m: 2450.0,
  path_length_km: 14.2,
  elevation_drop_m: 820.0,
  average_slope_degrees: 6.8,
  flow_corridor_geojson: {
    type: "Polygon",
    coordinates: [[[85.112, 28.085], [85.105, 28.065], [85.099, 28.040], [85.095, 28.015], [85.092, 28.000], [85.096, 28.000], [85.100, 28.020], [85.106, 28.050], [85.114, 28.085], [85.112, 28.085]]]
  },
  path_line_geojson: {
    type: "LineString",
    coordinates: [[85.112, 28.085], [85.105, 28.060], [85.098, 28.030], [85.094, 28.003]]
  },
  downstream_settlements: [
    { name: "Syabrubesi Upper", distance_along_path_km: 1.2, estimated_arrival_minutes: 3.3, elevation_m: 1460.0, coordinates: [85.332, 28.161] },
    { name: "Trishuli Khola Gate", distance_along_path_km: 3.4, estimated_arrival_minutes: 9.4, elevation_m: 1320.0, coordinates: [85.321, 28.140] },
    { name: "Dhunche Riverside", distance_along_path_km: 6.8, estimated_arrival_minutes: 18.9, elevation_m: 1180.0, coordinates: [85.305, 28.112] },
    { name: "Betrawati Crossing", distance_along_path_km: 12.5, estimated_arrival_minutes: 34.7, elevation_m: 890.0, coordinates: [85.280, 28.040] }
  ],
  disrupted_bridges_count: 3,
  disclaimer: "TERRAIN-DERIVED SCREENING SCENARIO: Derived from DEM topography and gravity drainage assumptions. Not a calibrated 2D hydrodynamic wave model or real-time dam breach warning."
};

export const DEFAULT_REPORT: BilingualReport = {
  report_id: "FV-REP-TRISHULI-2026",
  generated_at_utc: new Date().toISOString(),
  summary: DEFAULT_SUMMARY,
  english_markdown: `# FLOODVISTA AI — RAPID INCIDENT SITUATION REPORT\n**Document ID:** \`FV-REP-TRISHULI-2026\`\n**Event:** Trishuli Valley Flash Flood & Debris Inundation (2026-08-26)\n\n## 1. Executive Summary\n- **Assessed Area:** 450.0 km²\n- **Modelled Inundation:** 14.8 hectares\n- **Exposed Buildings:** 18 structures\n- **Potentially Disrupted Roads:** 8.65 km\n- **Evidence TrustScore:** 94.2%\n\n## 2. Settlement Isolation\n- **Ghyalchok Upper**: POTENTIALLY CUT OFF (Direct lifeline route severed)\n- **Thulo Dovan**: POTENTIALLY DISRUPTED (Re-routed via ridge trail, +3.4 km)`,
  nepali_markdown: `# फ्लडभिस्टा एआई (FLOODVISTA AI) — द्रुत विपद् स्थिति प्रतिवेदन\n**दस्तावेज पहिचान:** \`FV-REP-TRISHULI-2026\`\n**घटना:** त्रिशूली उपत्यका बाढी तथा पहिरो (२०२६-०८-२६)\n\n## १. क्षति तथा जोखिम सारांश\n- **मूल्याङ्कन गरिएको क्षेत्रफल:** ४५०.० वर्ग कि.मी.\n- **जलमग्न फैलावट:** १४.८ हेक्टर\n- **जोखिममा परेका घरहरू:** १८ वटा\n- **अवरुद्ध सडक सञ्जाल:** ८.६५ कि.मी.\n- **विश्वसनीयता सूचकाङ्क:** ९४.२%`,
  english_html: `<div style="font-family:sans-serif;line-height:1.6"><h2>FLOODVISTA AI — Rapid Incident Situation Report</h2><p><strong>Event:</strong> Trishuli Valley Flash Flood (2026-08-26)</p><hr/><table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr><th>Metric</th><th>Value</th><th>Evidence</th></tr><tr><td>Assessed Area</td><td>450.0 km²</td><td>AOI Boundary</td></tr><tr><td>Flood Extent</td><td>14.8 ha</td><td>Spatially Inferred</td></tr><tr><td>Exposed Buildings</td><td>18 structures</td><td>Pre-event OSM</td></tr><tr><td>Disrupted Roads</td><td>8.65 km</td><td>Network Inferred</td></tr><tr><td>TrustScore</td><td>94.2%</td><td>Multi-sensor Index</td></tr></table><h3>Immediate Priority Actions</h3><ul><li><strong>Ghyalchok Access Culvert (CRITICAL)</strong>: Sole lifeline blocked by 40m debris. Air-drop medical supplies.</li><li><strong>Thulo Dovan Steel Bridge (HIGH)</strong>: Structural abutment exposed. Deploy structural engineers.</li></ul></div>`,
  nepali_html: `<div style="font-family:sans-serif;line-height:1.6"><h2>फ्लडभिस्टा एआई — द्रुत विपद् स्थिति प्रतिवेदन</h2><p><strong>घटना:</strong> त्रिशूली उपत्यका बाढी तथा पहिरो (२०२६-०८-२६)</p><hr/><table border="1" cellpadding="8" style="border-collapse:collapse;width:100%"><tr><th>सूचक</th><th>तथ्याङ्क</th><th>प्रमाण</th></tr><tr><td>कुल क्षेत्रफल</td><td>४५०.० वर्ग कि.मी.</td><td>भौगोलिक सीमा</td></tr><tr><td>बाढी फैलावट</td><td>१४.८ हेक्टर</td><td>उपग्रह राडार</td></tr><tr><td>जोखिममा संरचना</td><td>१८ वटा</td><td>स्थानिक अनुमान</td></tr><tr><td>अवरुद्ध सडक</td><td>८.६५ कि.मी.</td><td>सञ्जाल विश्लेषण</td></tr><tr><td>विश्वसनीयता</td><td>९४.२%</td><td>प्रमाण सूचकाङ्क</td></tr></table></div>`
};

export function computeScenario(disruptionM: number, prob: number, bufferM: number): ScenarioResult {
  const isLow = disruptionM < 20;
  const isHigh = disruptionM > 60;
  const cutoff = isLow ? 1 : isHigh ? 4 : 2;
  const roadKm = isLow ? 4.2 : isHigh ? 14.8 : 8.65;

  return {
    parameters: {
      flood_prob_threshold: prob,
      road_disruption_m: disruptionM,
      spatial_buffer_m: bufferM,
      selected_hubs: ["Dhunche Hospital", "Trishuli Town"]
    },
    current_scenario: {
      disruption_threshold_m: disruptionM,
      flood_probability_threshold: prob,
      cut_off_settlements_count: cutoff,
      disrupted_road_length_km: roadKm,
      isolated_settlements: [
        { name: "Ghyalchok Upper", isolation_likelihood: "HIGH", alternate_routes: 0 },
        { name: "Khar Mountain Hamlet", isolation_likelihood: isHigh ? "HIGH" : "MODERATE", alternate_routes: isHigh ? 0 : 1 }
      ].slice(0, cutoff)
    },
    scenario_comparison_matrix: {
      lower_disruption: {
        label: "Lower-Disruption Scenario (Optimistic)",
        threshold_m: 10.0,
        disrupted_road_km: 4.2,
        cut_off_count: 1,
        stability: "HIGH"
      },
      default_disruption: {
        label: "Default-Disruption Scenario (Baseline)",
        threshold_m: 30.0,
        disrupted_road_km: 8.65,
        cut_off_count: 2,
        stability: "BASELINE"
      },
      higher_disruption: {
        label: "Higher-Disruption Scenario (Conservative)",
        threshold_m: 100.0,
        disrupted_road_km: 14.8,
        cut_off_count: 4,
        stability: "ELEVATED"
      }
    },
    sensitivity_summary: `Sensitivity Analysis: At ${disruptionM}m threshold, Ghyalchok Upper remains cut-off across all scenarios. Khar Hamlet connectivity depends heavily on whether the 30m Bhote Koshi bridge approach is passable.`
  };
}
