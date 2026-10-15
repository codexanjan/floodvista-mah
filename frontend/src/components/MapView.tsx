import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, AlertTriangle, ShieldCheck, Info, Compass, CheckCircle2 } from 'lucide-react';

// Support optional CARTO API key from client environment or storage without hardcoding secrets
export const getCartoApiKey = (): string => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('CARTO_API_KEY') || '';
  }
  return '';
};

export const getBasemapUrl = (subpath: string): string => {
  const key = getCartoApiKey();
  const base = `https://{s}.basemaps.cartocdn.com/rastertiles/${subpath}/{z}/{x}/{y}{r}.png`;
  return key ? `${base}?api_key=${encodeURIComponent(key)}` : base;
};

export const BASEMAP_OPTIONS = [
  {
    id: 'satellite',
    label: 'ESRI Space Recon Satellite (High-Res)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics, Copernicus Sentinel-2',
    subdomains: 'abcd',
  },
  {
    id: 'tactical_dark',
    label: 'Tactical Dark Canvas (Night Recon)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, OpenStreetMap',
    subdomains: 'abcd',
  },
  {
    id: 'osm_topo',
    label: 'OpenStreetMap Operational Topo',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    subdomains: 'abc',
  },
  {
    id: 'carto_dark',
    label: 'CARTO Dark Matter (Custom Key)',
    url: getBasemapUrl('dark_all'),
    attribution: '&copy; CARTO &copy; OpenStreetMap',
    subdomains: 'abcd',
  },
];

interface MapViewProps {
  geojsonLayers?: {
    buildings?: any;
    roads?: any;
    settlements?: any;
  };
  hydrologyPath?: any;
  hydrologyCorridor?: any;
  showBuildings?: boolean;
  showRoads?: boolean;
  showSettlements?: boolean;
  showHydrology?: boolean;
  onFeatureClick?: (featureInfo: any) => void;
  center?: [number, number];
  zoom?: number;
  mode?: 'normal' | 'twin';
  bridgeOverrideSevered?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  geojsonLayers,
  hydrologyPath,
  hydrologyCorridor,
  showBuildings = true,
  showRoads = true,
  showSettlements = true,
  showHydrology = true,
  onFeatureClick,
  center = [28.003, 85.097],
  zoom = 14,
  mode = 'normal',
  bridgeOverrideSevered = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [selectedBasemap, setSelectedBasemap] = useState<string>('satellite');
  const [selectedInfo, setSelectedInfo] = useState<any>(null);
  const [showBasemapMenu, setShowBasemapMenu] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: false,
    });

    const baseConfig = BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];
    const tileLayer = L.tileLayer(baseConfig.url, {
      maxZoom: 19,
      subdomains: baseConfig.subdomains,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const group = L.layerGroup().addTo(map);
    layersGroupRef.current = group;
    mapRef.current = map;

    // Click on Map Area for Explainable Point Inspection
    map.on('click', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const distFromRiver = Math.abs(lat - 28.003) + Math.abs(lng - 85.098);
      const isNearFlood = distFromRiver < 0.006;

      const mockExplain = {
        type: isNearFlood ? 'Flood Inundation Pixel' : 'Dry Hillside Terrain',
        coordinates: [lng.toFixed(5), lat.toFixed(5)],
        sensor: 'Sentinel-1 SAR IW (VV/VH 10m)',
        acquisition_date: '2026-08-15 00:15:24 UTC',
        backscatter_db: isNearFlood ? '-19.4 dB (Water Specular)' : '-11.2 dB (Rough Ground)',
        backscatter_change: isNearFlood ? '-7.8 dB Drop (Significant)' : '-0.4 dB (Noise)',
        flood_probability: isNearFlood ? '0.94' : '0.06',
        elevation_m: (1180 + Math.floor(distFromRiver * 12000)) + ' m',
        evidence_tier: isNearFlood ? 'OBSERVED (SAR Specular Reflection)' : 'OBSERVED (Stable Surface)',
        trustscore: '96.4%',
        copernicus_slope: (distFromRiver * 1800).toFixed(1) + '°',
        notes: isNearFlood
          ? 'Clear specular drop in VV polarization consistent with surface water ponding over pre-event river flats.'
          : 'Reflectance consistent with undisturbed terrace agriculture or dense slope vegetation.',
      };
      setSelectedInfo(mockExplain);
      if (onFeatureClick) onFeatureClick(mockExplain);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Basemap Switch
  useEffect(() => {
    if (!mapRef.current) return;
    const baseConfig = BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(baseConfig.url, {
      maxZoom: 19,
      subdomains: baseConfig.subdomains,
    }).addTo(mapRef.current);

    tileLayerRef.current = newLayer;
  }, [selectedBasemap]);

  // Update Vector Layers Dynamically
  useEffect(() => {
    if (!mapRef.current || !layersGroupRef.current) return;
    const group = layersGroupRef.current;
    group.clearLayers();

    // 1. Flood Inundation Footprint Polygon (SAR Prediction)
    const floodPolygonCoords: [number, number][] = [
      [28.0065, 85.093],
      [28.0055, 85.095],
      [28.0042, 85.099],
      [28.0035, 85.102],
      [28.0018, 85.105],
      [28.0005, 85.101],
      [28.0015, 85.097],
      [28.0032, 85.094],
      [28.0050, 85.091],
    ];

    const floodLayer = L.polygon(floodPolygonCoords, {
      color: '#00f2fe',
      fillColor: '#0284c7',
      fillOpacity: 0.55,
      weight: 2,
    }).bindTooltip(`
      <div style="font-family:sans-serif;font-size:12px;">
        <strong style="color:#00f2fe">Predicted Flood / Debris Inundation</strong><br/>
        Sensor: Sentinel-1 SAR IW (VV/VH)<br/>
        Evidence: Multi-Temporal Log-Ratio &bull; Hann Tiled U-Net
      </div>
    `);
    group.addLayer(floodLayer);

    // 2. Hydrology Downstream Corridor & Line
    if (showHydrology && hydrologyCorridor) {
      const corrLayer = L.geoJSON(hydrologyCorridor, {
        style: {
          color: '#d946ef',
          fillColor: '#a855f7',
          fillOpacity: 0.22,
          weight: 1.5,
          dashArray: '5, 5',
        },
      });
      group.addLayer(corrLayer);
    }

    if (showHydrology && hydrologyPath) {
      const pathLayer = L.geoJSON(hydrologyPath, {
        style: {
          color: '#ec4899',
          weight: 4,
          opacity: 0.95,
        },
      });
      group.addLayer(pathLayer);
    }

    // 3. Roads GeoJSON
    if (showRoads && geojsonLayers?.roads) {
      const roadLayer = L.geoJSON(geojsonLayers.roads, {
        style: (feature: any) => {
          let disrupted = feature?.properties?.potentially_disrupted;
          if (bridgeOverrideSevered && feature?.properties?.id === 'r2') {
            disrupted = true;
          }
          return {
            color: disrupted ? '#ef4444' : '#10b981',
            weight: disrupted ? 4.5 : 3,
            dashArray: disrupted ? '7, 5' : undefined,
            opacity: 0.95,
          };
        },
        onEachFeature: (feature, layer) => {
          let disrupted = feature.properties?.potentially_disrupted;
          if (bridgeOverrideSevered && feature?.properties?.id === 'r2') {
            disrupted = true;
          }
          layer.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; min-width: 200px;">
              <strong style="color: ${disrupted ? '#ef4444' : '#10b981'}">
                ${disrupted ? '⚠️ Potentially Disrupted Road Corridor' : '✅ Passable Lifeline Access'}
              </strong><br/>
              <strong>Highway:</strong> ${feature.properties?.highway || 'primary'}<br/>
              <strong>Flooded Extent:</strong> ${feature.properties?.flooded_m ? feature.properties.flooded_m.toFixed(1) + ' m' : (disrupted ? '34.5 m' : '0.0 m')}<br/>
              <span style="font-size:11px;color:#94a3b8">Evidence: Pre-event OSM &bull; Network Inferred</span>
            </div>
          `);
        },
      });
      group.addLayer(roadLayer);
    }

    // 4. Buildings GeoJSON
    if (showBuildings && geojsonLayers?.buildings) {
      const bldLayer = L.geoJSON(geojsonLayers.buildings, {
        style: (feature: any) => {
          const isExposed = feature?.properties?.exposure_status === 'EXPOSED';
          return {
            color: isExposed ? '#ef4444' : '#64748b',
            fillColor: isExposed ? '#dc2626' : '#334155',
            fillOpacity: isExposed ? 0.75 : 0.4,
            weight: 1.5,
          };
        },
        onEachFeature: (feature, layer) => {
          const isExposed = feature.properties?.exposure_status === 'EXPOSED';
          layer.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px;">
              <strong>${isExposed ? '🔴 Exposed Building Structure' : '⚪ Safe Structure'}</strong><br/>
              Status: ${feature.properties?.exposure_status || 'NOT_EXPOSED'}<br/>
              Flood Pixel Intersect: ${isExposed ? 'Direct Overlap' : 'Clear'}<br/>
              <em>Evidence Tier: Spatially Inferred</em>
            </div>
          `);
        },
      });
      group.addLayer(bldLayer);
    }

    // 5. Settlements Markers
    if (showSettlements && geojsonLayers?.settlements) {
      const stlLayer = L.geoJSON(geojsonLayers.settlements, {
        pointToLayer: (feature, latlng) => {
          let isCutOff = feature.properties?.potentially_cut_off;
          if (bridgeOverrideSevered && feature.properties?.name === 'Thulo Dovan') {
            isCutOff = true;
          }
          const marker = L.circleMarker(latlng, {
            radius: 9,
            fillColor: isCutOff ? '#ef4444' : '#10b981',
            color: '#ffffff',
            weight: 2.5,
            fillOpacity: 1,
          });
          return marker;
        },
        onEachFeature: (feature, layer) => {
          let isCutOff = feature.properties?.potentially_cut_off;
          if (bridgeOverrideSevered && feature.properties?.name === 'Thulo Dovan') {
            isCutOff = true;
          }
          layer.bindPopup(`
            <div style="font-family: sans-serif; font-size: 13px; min-width: 220px;">
              <strong style="color: ${isCutOff ? '#ef4444' : '#10b981'}; font-size: 14px;">
                ${feature.properties?.name}
              </strong><br/>
              Status: <strong>${isCutOff ? '🚨 POTENTIALLY CUT OFF' : '🟢 CONNECTED'}</strong><br/>
              Type: ${feature.properties?.settlement_type || 'village'}<br/>
              Nearest Receiving Hub: Dhunche District Hospital<br/>
              <span style="font-size:11px;color:#94a3b8">Evidence: Dijkstra Shortest Path Graph</span>
            </div>
          `);
        },
      });
      group.addLayer(stlLayer);
    }
  }, [geojsonLayers, hydrologyPath, hydrologyCorridor, showBuildings, showRoads, showSettlements, showHydrology, bridgeOverrideSevered]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-cyan-500/20 bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top-Left: Basemap Selector Pill (CARTO Authenticated) */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="relative">
          <button
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-xs font-semibold text-cyan-300 hover:text-white shadow-lg transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Basemap: {BASEMAP_OPTIONS.find(b => b.id === selectedBasemap)?.label.split(' (')[0]}</span>
          </button>

          {showBasemapMenu && (
            <div className="absolute top-9 left-0 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-2xl p-1.5 w-64 space-y-1 text-xs">
              <div className="px-2 py-1 text-[10px] text-slate-400 font-mono uppercase border-b border-slate-800">
                Geospatial Imagery &amp; Tactical Basemaps
              </div>
              {BASEMAP_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedBasemap(opt.id);
                    setShowBasemapMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between text-xs transition-colors ${
                    selectedBasemap === opt.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedBasemap === opt.id && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top-Right: Floating Evidence Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg text-xs shadow-xl transition-all">
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="flex items-center justify-between gap-2 px-3 py-2 font-semibold text-cyan-400 w-full hover:text-cyan-300 transition-colors"
          title="Toggle Legend"
        >
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Map Legend</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {isLegendOpen ? '▲' : '▼'}
          </span>
        </button>

        {isLegendOpen && (
          <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-800 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-sky-500/60 border border-cyan-300 inline-block shrink-0" />
              <span className="text-slate-300">Flooded Extent (SAR AI)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-red-500 inline-block border-t-2 border-dashed border-red-500 shrink-0" />
              <span className="text-slate-300">Disrupted Road Corridor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block shrink-0" />
              <span className="text-slate-300">Passable Lifeline Route</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shrink-0" />
              <span className="text-slate-300">Cut-off Settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              <span className="text-slate-300">Connected Settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-pink-500 inline-block shrink-0" />
              <span className="text-slate-300">Terrain Downstream Path</span>
            </div>
          </div>
        )}
      </div>

      {/* Click-to-Explain Detail Box */}
      {selectedInfo && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 backdrop-blur-md border border-cyan-400/40 p-4 rounded-xl text-xs max-w-sm shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/80 mb-2">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" /> Click-to-Explain Inspector
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              {selectedInfo.evidence_tier.split(' ')[0]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
            <div>Coordinates: <span className="font-mono text-cyan-200">{selectedInfo.coordinates?.join(', ')}</span></div>
            <div>Elevation: <span className="text-emerald-300 font-mono">{selectedInfo.elevation_m}</span></div>
            <div>Slope: <span className="text-amber-300 font-mono">{selectedInfo.copernicus_slope}</span></div>
            <div>Sensor: <span className="text-slate-200 text-[10px]">{selectedInfo.sensor.split(' ')[0]} SAR</span></div>
            <div>Backscatter: <span className="font-mono text-amber-300">{selectedInfo.backscatter_db.split(' ')[0]}</span></div>
            <div>Confidence: <span className="font-mono text-cyan-400 font-bold">{selectedInfo.flood_probability}</span></div>
          </div>
          <div className="mt-2 text-[10px] text-slate-300 border-t border-slate-800 pt-1.5">
            <strong>Rationale:</strong> {selectedInfo.notes}
          </div>
        </div>
      )}
    </div>
  );
};
