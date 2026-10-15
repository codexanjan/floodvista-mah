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
  english_markdown: `# FLOODVISTA AI — RAPID INCIDENT SITUATION REPORT
**Document ID:** \`FV-REP-TRISHULI-2026\`
**Event:** Trishuli Valley Flash Flood & Debris Inundation (2026-08-26)

## 1. Executive Summary
- **Assessed Area:** 450.0 km²
- **Modelled Inundation:** 14.8 hectares
- **Exposed Buildings:** 18 structures
- **Potentially Disrupted Roads:** 8.65 km
- **Evidence TrustScore:** 94.2%

## 2. Settlement Isolation
- **Ghyalchok Upper**: POTENTIALLY CUT OFF (Direct lifeline route severed)
- **Thulo Dovan**: POTENTIALLY DISRUPTED (Re-routed via ridge trail, +3.4 km)

## 3. Recommended Actions
1. **Ghyalchok Access Culvert (CRITICAL)**: Sole lifeline blocked by 40m debris. Air-drop medical supplies.
2. **Thulo Dovan Steel Bridge (HIGH)**: Structural abutment exposed. Deploy emergency engineering units.`,

  nepali_markdown: `# फ्लडभिस्टा एआई (FLOODVISTA AI) — द्रुत विपद् स्थिति प्रतिवेदन
**दस्तावेज पहिचान:** \`FV-REP-TRISHULI-2026\`
**घटना:** त्रिशूली उपत्यका बाढी तथा पहिरो (२०२६-०८-२६)

## १. क्षति तथा जोखिम सारांश
- **मूल्याङ्कन गरिएको क्षेत्रफल:** ४५०.० वर्ग कि.मी.
- **जलमग्न फैलावट:** १४.८ हेक्टर
- **जोखिममा परेका घरहरू:** १८ वटा
- **अवरुद्ध सडक सञ्जाल:** ८.६५ कि.मी.
- **विश्वसनीयता सूचकाङ्क:** ९४.२%

## २. सम्पर्कविहीन बस्तीहरू
- **घ्यालचोक माथिल्लो बस्ती**: पूर्ण रूपमा सम्पर्कविहीन (एकमात्र सडक मार्ग बन्द)
- **ठूलो दोभान**: आंशिक प्रभावित (डाँडाको बाटोबाट वैकल्पिक मार्ग, +३.४ कि.मी.)

## ३. प्राथमिकता कार्यहरू
१. **घ्यालचोक पहुँच मार्ग (अति संवेदनशील)**: ४० मिटर लेदोले बन्द, हेलिकप्टरबाट औषधि वितरण।
२. **ठूलो दोभान स्टील पुल (गम्भीर)**: पुलको दायाँ भाग कटान, इन्जिनियरिङ टोली परिचालन।`,

  hindi_markdown: `# फ्लडविस्टा एआई (FLOODVISTA AI) — त्वरित आपदा स्थिति रिपोर्ट
**दस्तावेज़ संख्या:** \`FV-REP-TRISHULI-2026\`
**घटना:** त्रिशूली घाटी आकस्मिक बाढ़ एवं मलबा जलमग्नता (२०२६-०८-२६)

## १. मुख्य प्रभाव एवं क्षति सारांश
- **मूल्यांकित क्षेत्र:** ४५०.० वर्ग किमी
- **जलमग्न विस्तार:** १४.८ हेक्टेयर (उपग्रह रडार द्वारा प्रमाणित)
- **जोखिम में भवन:** १८ संरचनाएं (ओपनस्ट्रीटमैप मिलान)
- **अवरुद्ध सड़क नेटवर्क:** ८.६५ किमी
- **साक्ष्य विश्वसनीयता सूचकांक (TrustScore):** ९४.२%

## २. अलग-थलग बस्तियां एवं कनेक्टिविटी
- **घ्यालचोक अपर**: पूर्णतः संपर्क विच्छेद (एकमात्र जीवनरेखा मार्ग अवरुद्ध)
- **थुलो दोभान**: आंशिक बाधित (पहाड़ी बाईपास से पुनर्निर्देशित, +३.४ किमी अतिरिक्त दूरी)

## ३. तत्काल राहत प्राथमिकताएं
१. **घ्यालचोक पहुंच मार्ग (अति गंभीर)**: ४० मीटर मलबे से अवरुद्ध। हेलीकॉप्टर द्वारा तत्काल दवा और राशन पहुंचाएं।
२. **थुलो दोभान स्टील ब्रिज (गंभीर)**: आधार स्तंभ कमजोर। राष्ट्रीय आपदा प्रतिक्रिया बल (NDRF/सेना) को तैनात करें।`,

  bengali_markdown: `# ফ্লাডভিস্টা এআই (FLOODVISTA AI) — দ্রুত দুর্যোগ পরিস্থিতি প্রতিবেদন
**নথি শনাক্তকরণ:** \`FV-REP-TRISHULI-2026\`
**ঘটনা:** ত্রিশূলী উপত্যকা আকস্মিক বন্যা ও ধ্বংসাবশেষ প্লাবন (২০২৬-০৮-২৬)

## ১. ক্ষয়ক্ষতি ও প্রভাবের সারসংক্ষেপ
- **মূল্যায়নকৃত এলাকা:** ৪৫০.০ বর্গ কিমি
- **প্লাবিত এলাকা:** ১৪.৮ হেক্টর (উপগ্রহ রাডার দ্বারা যাচাইকৃত)
- **ক্ষতিগ্রস্ত কাঠামো:** ১৮টি ভবন
- **বিচ্ছিন্ন সড়ক নেটওয়ার্ক:** ৮.৬৫ কিমি
- **প্রমাণ নির্ভরতা স্কোর (TrustScore):** ৯৪.২%

## ২. বিচ্ছিন্ন জনপদ ও উদ্ধার রুট
- **ঘ্যালচক আপার**: সম্পূর্ণরূপে বিচ্ছিন্ন (একমাত্র লাইফলাইন রাস্তা অবরুদ্ধ)
- **থুলো দোভান**: আংশিক ক্ষতিগ্রস্ত (পাহাড়ি বিকল্প রুটে পুনর্নির্দেশিত, +৩.৪ কিমি)

## ৩. অগ্রাধিকারমূলক উদ্ধার পদক্ষেপ
১. **ঘ্যালচক কালভার্ট (জরুরী)**: ড্রোন/হেলিকপ্টার দিয়ে দ্রুত খাদ্য ও ওষুধ সরবরাহ করুন।
২. **থুলো দোভান সেতু (গুরুত্বপূর্ণ)**: সেতু প্রকৌশলী ও উদ্ধারকারী দল মোতায়েন করুন।`,

  tamil_markdown: `# ஃப்ளட்விஸ்டா AI (FLOODVISTA AI) — அவசர பேரிடர் நிலை அறிக்கை
**ஆவண எண்:** \`FV-REP-TRISHULI-2026\`
**நிகழ்வு:** திரிசூலி பள்ளத்தாக்கு திடீர் வெள்ளம் மற்றும் நிலச்சரிவு (2026-08-26)

## 1. பாதிப்பு மற்றும் சுருக்க விவரம்
- **மதிப்பீடு செய்யப்பட்ட பகுதி:** 450.0 சதுர கி.மீ
- **வெள்ளப் பரப்பளவு:** 14.8 ஹெக்டேர் (செயற்கைக்கோள் ரேடார் மூலம் உறுதிசெய்யப்பட்டது)
- **பாதிக்கப்பட்ட கட்டிடங்கள்:** 18 கட்டமைப்புகள்
- **துண்டிக்கப்பட்ட சாலைகள்:** 8.65 கி.மீ
- **நம்பகத்தன்மை குறியீடு (TrustScore):** 94.2%

## 2. துண்டிக்கப்பட்ட குடியிருப்புகள்
- **கியால்சோக் அப்பர்**: முழுமையாக துண்டிக்கப்பட்டுள்ளது (முக்கிய சாலை வெள்ளத்தில் மூழ்கியது)
- **துலோ தோவன்**: மாற்று பாதை வழியாக இணைக்கப்பட்டுள்ளது (+3.4 கி.மீ கூடுதல் தூரம்)

## 3. உடனடி மீட்பு நடவடிக்கைகள்
1. **கியால்சோக் பகுதி (மிக அவசரம்)**: ஹெலிகாப்டர் மூலம் அத்தியாவசிய மருந்துகள் மற்றும் உணவு வழங்கவும்.
2. **துலோ தோவன் பாலம்**: கட்டமைப்பு பொறியியல் குழுக்களை உடனடியாக அனுப்பவும்.`,

  telugu_markdown: `# ఫ్లడ్‌విస్టా AI (FLOODVISTA AI) — అత్యవసర విపత్తు నివేదిక
**పత్రం ID:** \`FV-REP-TRISHULI-2026\`
**సంఘటన:** త్రిశూలి లోయ ఆకస్మిక వరదలు & కొండచరియలు (2026-08-26)

## 1. నష్ట తీవ్రత మరియు సారాంశం
- **సర్వే చేసిన విస్తీర్ణం:** 450.0 చ.కి.మీ
- **వరద ముంపు ప్రాంతం:** 14.8 హెక్టార్లు
- **ప్రభావిత భవనాలు:** 18 నిర్మాణాలు
- **ధ్వంసమైన రహదారులు:** 8.65 కి.మీ
- **విశ్వసనీయత సూచిక (TrustScore):** 94.2%

## 2. సంబంధాలు తెగిపోయిన గ్రామాలు
- **గ్యాల్చోక్ అప్పర్**: పూర్తిగా రవాణా నిలిచిపోయింది (ప్రధాన రహదారి ధ్వంసం)
- **థులో దోవన్**: కొండ మార్గం ద్వారా మళ్లించబడింది (+3.4 కి.మీ దూరం)

## 3. అత్యవసర సహాయక చర్యలు
1. **గ్యాల్చోక్ కల్వర్ట్ (అత్యంత కీలకం)**: హెలికాప్టర్ ద్వారా వైద్య సామాగ్రిని అందించండి.
2. **థులో దోవన్ వంతెన**: ఇంజనీరింగ్ బృందాలను రంగంలోకి దించండి.`,

  marathi_markdown: `# फ्लडव्हिस्टा एआय (FLOODVISTA AI) — त्वरित आपत्ती स्थिती अहवाल
**दस्तऐवज क्र.:** \`FV-REP-TRISHULI-2026\`
**घटना:** त्रिशूली खोरे अचानक आलेला पूर व दरड कोसळणे (२०२६-०८-२६)

## १. आपत्ती प्रभाव व नुकसान सारांश
- **मूल्यांकन केलेले क्षेत्र:** ४५०.० चौ. किमी
- **पूर बाधित क्षेत्र:** १४.८ हेक्टर (सॅटेलाईट रडार डेटा आधारित)
- **बाधित इमारती:** १८ संरचना
- **बंद झालेले रस्ते:** ८.६५ किमी
- **विश्वासार्हता निर्देशांक (TrustScore):** ९४.२%

## २. संपर्क तुटलेली गावे
- **घ्यालचोक अप्पर**: पूर्णपणे संपर्क तुटला (मुख्य जीवनवाहिनी रस्ता बंद)
- **थुलो दोभान**: पर्यायी डोंगराळ मार्गाने वाहतूक (+३.४ किमी अतिरिक्त अंतर)

## ३. तातडीच्या उपाययोजना
१. **घ्यालचोक मार्ग (अतिसंवेदनशील)**: हेलिकॉप्टरने औषधे व अन्नपुरवठा करा.
२. **थुलो दोभान पूल**: सैन्य अभियांत्रिकी पथक तैनात करा.`,

  spanish_markdown: `# FLOODVISTA AI — INFORME RÁPIDO DE SITUACIÓN DE EMERGENCIA
**ID de Documento:** \`FV-REP-TRISHULI-2026\`
**Incidente:** Inundación Repentina y Flujo de Escombros en el Valle de Trishuli (2026-08-26)

## 1. Resumen Ejecutivo de Impacto
- **Área Evaluada (AOI):** 450.0 km²
- **Inundación Modelada:** 14.8 hectáreas (Verificado con Radar SAR Sentinel-1)
- **Estructuras Expuestas:** 18 edificios (Cruce con OpenStreetMap)
- **Carreteras Potencialmente Cortadas:** 8.65 km
- **Índice de Confianza (TrustScore):** 94.2%

## 2. Poblaciones Aisladas y Rutas de Evacuación
- **Ghyalchok Upper**: POTENCIALMENTE AISLADO (Vía principal de rescate interrumpida)
- **Thulo Dovan**: PARCIALMENTE AFECTADO (Desvío habilitado por sendero montañoso, +3.4 km)

## 3. Acciones Prioritarias de Intervención
1. **Alcantarilla de Ghyalchok (CRÍTICO)**: 40 metros bloqueados por aluvión. Entrega aérea de víveres y suministros médicos.
2. **Puente de Acero de Thulo Dovan (ALTO)**: Estribos socavados por corriente. Despliegue de ingenieros de rescate.`,

  french_markdown: `# FLOODVISTA AI — RAPPORT DE SITUATION D'URGENCE RAPIDE
**Identifiant:** \`FV-REP-TRISHULI-2026\`
**Événement:** Crue Éclair et Coulées de Débris dans la Vallée de Trishuli (2026-08-26)

## 1. Résumé Exécutif des Dommages
- **Zone Évaluée:** 450.0 km²
- **Étendue des Inondations:** 14.8 hectares (Mesure SAR Sentinel-1)
- **Bâtiments Exposés:** 18 structures identifiées
- **Réseau Routier Interrompu:** 8.65 km
- **Indice de Confiance (TrustScore):** 94.2%

## 2. Localités Isolées et Connectivité
- **Ghyalchok Upper**: POTENTIELLEMENT COUPÉ (Voie vitale d'accès détruite)
- **Thulo Dovan**: ACCÈS PERTURBÉ (Détour montagneux actif, +3.4 km)

## 3. Actions Immédiates Recommandées
1. **Passage de Ghyalchok (URGENT)**: Bloqué par 40 m de sédiments. Largage héliporté de secours d'urgence.
2. **Pont de Thulo Dovan**: Piliers fragilisés par le courant. Envoi immédiat du génie civil.`,

  arabic_markdown: `# تقرير حالة الطوارئ السريع — FLOODVISTA AI
**معرف الوثيقة:** \`FV-REP-TRISHULI-2026\`
**الحدث:** فيضان جبلي خاطف وانهيارات طينية في وادي تريشولي (2026-08-26)

## ١. ملخص الأثر والأضرار
- **المنطقة الخاضعة للتقييم:** 450.0 كم²
- **مساحة الغمر المائي:** 14.8 هكتار (مؤكدة عبر رادار القمر الصناعي Sentinel-1)
- **المباني المتضررة:** 18 منشأة مأهولة
- **الطرق المعطلة أو المقطوعة:** 8.65 كم
- **مؤشر موثوقية الأدلة (TrustScore):** 94.2%

## ٢. القرى المعزولة ومسارات الإخلاء
- **غيالتشوك العليا**: معزولة تماماً (انقطاع شريان الإمداد الوحيد)
- **ثولو دوفان**: تعطل جزئي (تحويل المسار عبر الممر الجبلي، +3.4 كم إضافية)

## ٣. أولويات التدخل العاجل
١. **ممر غيالتشوك (حرج جداً)**: انسداد بطول 40 متراً بالطين. إسقاط جوي فوري للمساعدات الطبية.
٢. **جسر ثولو دوفان الفولاذي (طوارئ)**: تآكل الدعامة النهرية. نشر فرق الهندسة العسكرية.`,

  german_markdown: `# FLOODVISTA AI — SCHNELLER KATASTROPHEN-LAGEBERICHT
**Dokument-ID:** \`FV-REP-TRISHULI-2026\`
**Ereignis:** Sturzflut & Murenabgang im Trishuli-Tal (2026-08-26)

## 1. Zusammenfassung der Schadenslage
- **Untersuchungsgebiet (AOI):** 450.0 km²
- **Überflutungsfläche:** 14.8 Hektar (Verifiziert durch Sentinel-1 SAR-Radar)
- **Gefährdete Gebäude:** 18 Gebäude erfasst
- **Unterbrochene Straßenverbindungen:** 8.65 km
- **Zuverlässigkeitsindex (TrustScore):** 94.2%

## 2. Isolierte Ortschaften
- **Ghyalchok Upper**: POTENZIELL ABGESCHNITTEN (Hauptlebensader unterbrochen)
- **Thulo Dovan**: VERKEHR BEHINDERT (Umleitung über Bergpfad, +3.4 km Umweg)

## 3. Prioritäre Einsatzmaßnahmen
1. **Zufahrt Ghyalchok (KRITISCH)**: 40m Schlammblockade. Luftabwurf von Notfallmedikamenten erforderlich.
2. **Stahlbrücke Thulo Dovan (HOCH)**: Brückenpfeiler unterspült. Pioniereinheiten zur Sicherung entsenden.`,

  japanese_markdown: `# FLOODVISTA AI — 緊急事態・迅速被害査定レポート
**文書ID:** \`FV-REP-TRISHULI-2026\`
**災害名:** トリシュリ渓谷 鉄砲水および土石流災害 (2026-08-26)

## 1. 被害規模・エグゼクティブサマリー
- **解析対象面積 (AOI):** 450.0 km²
- **推定浸水面積:** 14.8 ヘクタール (Sentinel-1 SARレーダー衛星により直接観測)
- **被災リスク建物:** 18 棟 (OpenStreetMap建物データ重畳)
- **寸断された主要道路:** 8.65 km
- **根拠信頼性スコア (TrustScore):** 94.2%

## 2. 孤立集落と避難ルート状況
- **ギャルチョク上部集落**: 孤立状態 (唯一のアクセス道路が流失)
- **トゥロ・ドバン**: 一部通行止め (尾根迂回ルートにより接続中、+3.4 km遅延)

## 3. 最優先緊急支援アクション
1. **ギャルチョク進入路 (最重要・緊急)**: 40mにわたり土砂堆積。自衛隊/ドローンによる医薬品・食料投下。
2. **トゥロ・ドバン鋼橋 (重要)**: 橋脚洗掘の危険。緊急補修工兵部隊の派遣。`,

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

export const DISASTER_AOI_LOCATIONS: import('./types').DisasterAOI[] = [
  {
    id: 'trishuli_nepal',
    name: 'Trishuli Valley Gorge',
    region: 'Bagmati Province',
    country: 'Nepal',
    flag: '🇳🇵',
    center: [28.003, 85.097],
    zoom: 14,
    severity: 'CRITICAL',
    inundationAreaHa: 14.8,
    exposedBuildings: 18,
    cutoffVillages: 2,
    eventDate: 'August 2026',
    sensor: 'Sentinel-1 SAR IW (VV/VH)',
    description: 'Steep Himalayan mountain flash flood along Trishuli river corridor. Severe road severance and isolated mountain villages.'
  },
  {
    id: 'brahmaputra_assam',
    name: 'Brahmaputra Basin (Kaziranga-Guwahati)',
    region: 'Assam',
    country: 'India',
    flag: '🇮🇳',
    center: [26.185, 91.747],
    zoom: 13,
    severity: 'CRITICAL',
    inundationAreaHa: 142.5,
    exposedBuildings: 164,
    cutoffVillages: 11,
    eventDate: 'July 2026',
    sensor: 'Sentinel-1 SAR C-Band + Copernicus DEM',
    description: 'Massive monsoon riverine inundation across Brahmaputra floodplains. Extensive wetland breaching and embankment breaches.'
  },
  {
    id: 'indus_pakistan',
    name: 'Indus River Corridor (Sindh)',
    region: 'Sindh Province',
    country: 'Pakistan',
    flag: '🇵🇰',
    center: [27.558, 68.202],
    zoom: 12,
    severity: 'CRITICAL',
    inundationAreaHa: 380.2,
    exposedBuildings: 412,
    cutoffVillages: 28,
    eventDate: 'September 2026',
    sensor: 'Sentinel-1 Multi-Temporal SAR',
    description: 'Catastrophic basin-scale inundation following cloudbursts. Left bank outfall drain overflow and rural village cutoffs.'
  },
  {
    id: 'valencia_spain',
    name: 'Valencia Rambla del Poyo',
    region: 'Comunidad Valenciana',
    country: 'Spain',
    flag: '🇪🇸',
    center: [39.469, -0.376],
    zoom: 14,
    severity: 'HIGH',
    inundationAreaHa: 68.4,
    exposedBuildings: 95,
    cutoffVillages: 4,
    eventDate: 'October 2026',
    sensor: 'Sentinel-1 + Sentinel-2 MSI Hybrid',
    description: 'Devastating DANA flash flood in suburban ravines and bridges. Urban vehicular blockage and industrial park inundation.'
  },
  {
    id: 'kerala_periyar',
    name: 'Periyar River Basin (Aluva)',
    region: 'Kerala',
    country: 'India',
    flag: '🇮🇳',
    center: [10.023, 76.342],
    zoom: 14,
    severity: 'HIGH',
    inundationAreaHa: 52.1,
    exposedBuildings: 74,
    cutoffVillages: 5,
    eventDate: 'August 2026',
    sensor: 'Sentinel-1 SAR IW Dual-Pol',
    description: 'Reservoir gate opening combined with intense rainfall leading to coastal backwater flood crests.'
  }
];

export const DEFAULT_CITIZEN_REPORTS: import('./types').CitizenSOSReport[] = [
  {
    id: 'SOS-0826-01',
    timestamp: '10 mins ago',
    location_name: 'Ghyalchok Upper Hamlet',
    coordinates: [85.1029, 28.0032],
    water_depth_m: 1.8,
    trapped_people: 14,
    critical_needs: ['Emergency Insulin', 'Infant Formula', 'Drinking Water'],
    status: 'DISPATCHED',
    reported_by: 'Bikash Tamang (Village elder via SAT phone)'
  },
  {
    id: 'SOS-0826-02',
    timestamp: '25 mins ago',
    location_name: 'Bhote Koshi Bridge Approach',
    coordinates: [85.0970, 28.0045],
    water_depth_m: 2.4,
    trapped_people: 6,
    critical_needs: ['Rope Extraction', 'Stretcher'],
    status: 'VERIFIED',
    reported_by: 'Armed Police Force Scout Team'
  },
  {
    id: 'SOS-0826-03',
    timestamp: '42 mins ago',
    location_name: 'Khar Mountain Ridge Trail',
    coordinates: [85.1085, 28.0091],
    water_depth_m: 0.9,
    trapped_people: 22,
    critical_needs: ['Shelter Tarpaulins', 'Dry Rations'],
    status: 'PENDING',
    reported_by: 'Red Cross Community Volunteer'
  }
];

