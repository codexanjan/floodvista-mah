import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, ChevronDown, ChevronRight, Code2, Server } from 'lucide-react';

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  summary: string;
  description: string;
  requestBody?: any;
  sampleResponse: any;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/api/analyses/{analysis_id}',
    summary: 'Get Master Disaster Telemetry Summary',
    description: 'Retrieves the complete computed disaster intelligence summary for an area of interest, including assessed area, inundation extent, exposed buildings, disrupted road corridors, cut-off settlements, and TrustScore.',
    sampleResponse: {
      analysis_id: "trishuli-demo",
      event_name: "Trishuli Valley Flash Flood & Debris Inundation",
      event_date: "2026-08-26",
      is_synthetic: true,
      assessed_area_km2: 450.0,
      inundation_extent_ha: 14.8,
      exposed_buildings_count: 18,
      exposed_bridges_count: 2,
      flooded_road_km: 3.42,
      potentially_disrupted_road_km: 8.65,
      cutoff_settlements: ["Ghyalchok Upper", "Khar Mountain Hamlet"],
      trustscore_percent: 94.2
    }
  },
  {
    method: 'GET',
    path: '/api/analyses/{analysis_id}/layers',
    summary: 'Get Vector GeoJSON Map Layers',
    description: 'Returns standard GeoJSON FeatureCollections for exposed buildings, classified road network corridors, and mountain settlement triage points.',
    sampleResponse: {
      buildings: { type: "FeatureCollection", features: [{ type: "Feature", properties: { id: "b1", exposure_status: "EXPOSED" } }] },
      roads: { type: "FeatureCollection", features: [{ type: "Feature", properties: { id: "r1", potentially_disrupted: true, flooded_m: 34.5 } }] },
      settlements: { type: "FeatureCollection", features: [{ type: "Feature", properties: { name: "Ghyalchok Upper", potentially_cut_off: true } }] }
    }
  },
  {
    method: 'POST',
    path: '/api/analyses/{analysis_id}/scenarios',
    summary: 'Execute What-If Disaster Simulation',
    description: 'Recalculates infrastructure exposure, network graph connectivity, and isolated settlements dynamically based on adjustable physical disruption thresholds and model confidence.',
    requestBody: {
      road_disruption_m: 30.0,
      flood_prob_threshold: 0.50,
      spatial_buffer_m: 15.0
    },
    sampleResponse: {
      parameters: { road_disruption_m: 30.0, flood_prob_threshold: 0.50, spatial_buffer_m: 15.0 },
      current_scenario: { cut_off_settlements_count: 2, disrupted_road_length_km: 8.65 },
      scenario_comparison_matrix: {
        lower_disruption: { threshold_m: 10.0, disrupted_road_km: 4.2, cut_off_count: 1 },
        default_disruption: { threshold_m: 30.0, disrupted_road_km: 8.65, cut_off_count: 2 },
        higher_disruption: { threshold_m: 100.0, disrupted_road_km: 14.8, cut_off_count: 4 }
      }
    }
  },
  {
    method: 'GET',
    path: '/api/analyses/{analysis_id}/connectivity',
    summary: 'Get Graph Network Resilience & Detour Analysis',
    description: 'Performs NetworkX Dijkstra shortest path routing from all population settlements to designated hospitals and town centers before vs after flood disruption.',
    sampleResponse: {
      reference_hubs: [{ id: "h1", name: "Dhunche District Hospital", type: "Hospital" }],
      settlements_resilience: [
        { name: "Sano Dovan", status: "CONNECTED", baseline_distance_km: 2.4, post_event_distance_km: 2.4, detour_ratio: 1.0 },
        { name: "Thulo Dovan", status: "POTENTIALLY_DISRUPTED", baseline_distance_km: 3.8, post_event_distance_km: 7.2, detour_ratio: 1.89 },
        { name: "Ghyalchok Upper", status: "POTENTIALLY_CUT_OFF", baseline_distance_km: 5.1, post_event_distance_km: null }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/analyses/{analysis_id}/reports',
    summary: 'Generate Bilingual Incident Situation Report',
    description: 'Generates deterministic emergency situation reports formatted in both English and Nepali (नेपाली) with HTML, Markdown, and priority action queues.',
    sampleResponse: {
      report_id: "FV-REP-TRISHULI-2026",
      generated_at_utc: "2026-10-15T06:00:00Z",
      languages: ["en", "ne"],
      english_markdown: "# FLOODVISTA AI — SITUATION REPORT\n...",
      nepali_markdown: "# फ्लडभिस्टा एआई — द्रुत विपद् स्थिति प्रतिवेदन\n..."
    }
  },
  {
    method: 'GET',
    path: '/api/analyses/{analysis_id}/rescue-pack',
    summary: 'Download Tactical Offline Rescue Pack (.zip)',
    description: 'Builds and streams a self-contained ZIP archive containing offline GeoJSON layers, situation reports, metadata manifest, and a zero-dependency HTML map viewer.',
    sampleResponse: "Binary Stream: application/zip (floodvista_rescue_pack_trishuli.zip)"
  },
  {
    method: 'POST',
    path: '/api/analyses/{analysis_id}/hydrology',
    summary: 'Trace Terrain-Aware Downstream Flow Path',
    description: 'Simulates D8 steepest descent downstream flow path using Copernicus WorldDEM-30, computing flow velocity and warning arrival countdowns for downstream settlements.',
    requestBody: {
      source_lon: 85.112,
      source_lat: 28.085,
      corridor_buffer_m: 120.0,
      flow_speed_m_per_s: 6.0
    },
    sampleResponse: {
      path_length_km: 14.2,
      elevation_drop_m: 820.0,
      average_slope_degrees: 6.8,
      downstream_settlements: [
        { name: "Syabrubesi Upper", distance_along_path_km: 1.2, estimated_arrival_minutes: 3.3 },
        { name: "Dhunche Riverside", distance_along_path_km: 6.8, estimated_arrival_minutes: 18.9 }
      ]
    }
  },
  {
    method: 'GET',
    path: '/api/analyses/{analysis_id}/evaluation',
    summary: 'Get Quantitative Scientific Benchmark Scores',
    description: 'Returns held-out Kuro Siwo benchmark segmentation metrics: mIoU, Dice/F1, Precision, Recall, confusion matrix, and terrain slope error stratification.',
    sampleResponse: {
      dataset_name: "Kuro Siwo Multi-Temporal SAR Benchmark",
      mean_iou: 0.8124,
      mean_dice_f1: 0.8965,
      overall_pixel_accuracy: 0.9482,
      flood_class: { iou: 0.7640, precision: 0.9142, recall: 0.8229 }
    }
  }
];

export const ApiDocs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCurl = (ep: Endpoint, idx: number) => {
    const isPost = ep.method === 'POST';
    const baseUrl = window.location.origin;
    const bodyPart = isPost && ep.requestBody ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(ep.requestBody)}'` : '';
    const curl = `curl -X ${ep.method} "${baseUrl}${ep.path.replace('{analysis_id}', 'trishuli-demo')}"${bodyPart}`;
    navigator.clipboard.writeText(curl);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in p-4 text-slate-100">
      <div className="glow-card p-6 rounded-2xl bg-[#0b1329]/90 border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">FLOODVISTA AI &bull; REST API Documentation</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            High-performance geospatial endpoints powering satellite segmentation, graph-based Dijkstra resilience routing, What-If simulation, and bilingual situation reporting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
            OpenAPI 3.1 &bull; FastAPI 1.0+
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {ENDPOINTS.map((ep, idx) => {
          const isOpen = openIndex === idx;
          const isGet = ep.method === 'GET';
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-800 bg-[#091124] overflow-hidden transition-all shadow-md"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded ${
                      isGet ? 'bg-sky-950 text-sky-300 border border-sky-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-cyan-300 font-semibold">{ep.path}</span>
                  <span className="hidden sm:inline text-xs text-slate-400">&bull; {ep.summary}</span>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {isOpen && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-4 text-xs">
                  <p className="text-slate-300 text-xs leading-relaxed">{ep.description}</p>

                  {ep.requestBody && (
                    <div className="space-y-1.5">
                      <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Request Body (application/json)
                      </div>
                      <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                        {JSON.stringify(ep.requestBody, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Response Payload (200 OK)
                      </span>
                      <button
                        onClick={() => copyCurl(ep, idx)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedIndex === idx ? 'Copied cURL' : 'Copy cURL'}
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-60">
                      {typeof ep.sampleResponse === 'string'
                        ? ep.sampleResponse
                        : JSON.stringify(ep.sampleResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
