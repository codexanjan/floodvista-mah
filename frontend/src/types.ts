export interface AnalysisSummary {
  analysis_id: string;
  event_name: string;
  event_date: string;
  is_synthetic: boolean;
  assessed_area_km2: number;
  inundation_extent_ha: number;
  exposed_buildings_count: number;
  exposed_bridges_count: number;
  flooded_road_km: number;
  potentially_disrupted_road_km: number;
  cutoff_settlements: string[];
  trustscore_percent: number;
  evidence_profile: {
    observed_pct: number;
    spatially_inferred_pct: number;
    network_inferred_pct: number;
    sar_temporal_coherence: string;
    optical_cloud_cover_pct: number;
  };
}

export interface SettlementResilience {
  name: string;
  status: 'CONNECTED' | 'POTENTIALLY_DISRUPTED' | 'POTENTIALLY_CUT_OFF' | 'INSUFFICIENT_DATA';
  nearest_hub: string;
  baseline_distance_km: number;
  post_event_distance_km: number | null;
  detour_ratio: number | null;
  alternative_route_available: boolean;
  explanation: string;
}

export interface ScenarioResult {
  parameters: {
    flood_prob_threshold: number;
    road_disruption_m: number;
    spatial_buffer_m: number;
    selected_hubs: string[];
  };
  current_scenario: {
    disruption_threshold_m: number;
    flood_probability_threshold: number;
    cut_off_settlements_count: number;
    disrupted_road_length_km: number;
    isolated_settlements: Array<{
      name: string;
      isolation_likelihood: string;
      alternate_routes: number;
    }>;
  };
  scenario_comparison_matrix: {
    lower_disruption: {
      label: string;
      threshold_m: number;
      disrupted_road_km: number;
      cut_off_count: number;
      stability: string;
    };
    default_disruption: {
      label: string;
      threshold_m: number;
      disrupted_road_km: number;
      cut_off_count: number;
      stability: string;
    };
    higher_disruption: {
      label: string;
      threshold_m: number;
      disrupted_road_km: number;
      cut_off_count: number;
      stability: string;
    };
  };
  sensitivity_summary: string;
}

export interface ModelEvaluation {
  dataset_name: string;
  model_architecture: string;
  total_evaluated_pixels: number;
  mean_iou: number;
  mean_dice_f1: number;
  overall_pixel_accuracy: number;
  classes: Record<string, {
    class_id: number;
    iou: number;
    dice_f1: number;
    precision: number;
    recall: number;
    support: number;
  }>;
  confusion_matrix: number[][];
  terrain_stratification: Record<string, {
    flood_iou: number;
    pixel_count: number;
  }>;
}

export interface HydrologyResult {
  source_coordinates: [number, number];
  source_elevation_m: number;
  path_length_km: number;
  elevation_drop_m: number;
  average_slope_degrees: number;
  flow_corridor_geojson: any;
  path_line_geojson: any;
  downstream_settlements: Array<{
    name: string;
    distance_along_path_km: number;
    estimated_arrival_minutes: number;
    elevation_m: number;
    coordinates: [number, number];
  }>;
  disrupted_bridges_count: number;
  disclaimer: string;
}

export interface BilingualReport {
  report_id: string;
  generated_at_utc: string;
  summary: any;
  english_markdown: string;
  nepali_markdown: string;
  english_html: string;
  nepali_html: string;
  hindi_markdown?: string;
  hindi_html?: string;
  bengali_markdown?: string;
  bengali_html?: string;
  tamil_markdown?: string;
  tamil_html?: string;
  telugu_markdown?: string;
  telugu_html?: string;
  marathi_markdown?: string;
  marathi_html?: string;
  spanish_markdown?: string;
  spanish_html?: string;
  french_markdown?: string;
  french_html?: string;
  arabic_markdown?: string;
  arabic_html?: string;
  german_markdown?: string;
  german_html?: string;
  japanese_markdown?: string;
  japanese_html?: string;
}

export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi
  | 'ne' // Nepali
  | 'bn' // Bengali
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'mr' // Marathi
  | 'es' // Spanish
  | 'fr' // French
  | 'ar' // Arabic
  | 'de' // German
  | 'ja'; // Japanese

export interface DisasterAOI {
  id: string;
  name: string;
  region: string;
  country: string;
  flag: string;
  center: [number, number];
  zoom: number;
  severity: 'CRITICAL' | 'HIGH' | 'MONITORING';
  inundationAreaHa: number;
  exposedBuildings: number;
  cutoffVillages: number;
  eventDate: string;
  sensor: string;
  description: string;
}

export interface CitizenSOSReport {
  id: string;
  timestamp: string;
  location_name: string;
  coordinates: [number, number];
  water_depth_m: number;
  trapped_people: number;
  critical_needs: string[];
  status: 'VERIFIED' | 'DISPATCHED' | 'PENDING';
  reported_by: string;
}

