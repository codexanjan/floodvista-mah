# FLOODVISTA AI — System Architecture Specification

## 1. Architectural Overview

FLOODVISTA AI is structured into decoupled, scientifically verifiable pipeline layers:

1. **Ingestion & Preprocessing (`src/floodmap/preprocessing/`)**: Satellite raster ingestion (Sentinel-1 SAR, Sentinel-2, Copernicus DEM) with radiometrically terrain-corrected alignment.
2. **Feature Engineering (`src/floodmap/features/`)**: Multi-temporal change detection, log-ratio backscatter differences, water indices (NDWI, MNDWI), and slope derivation.
3. **Segmentation Inference (`src/floodmap/inference/`)**: PyTorch sliding-window tiled segmentation producing georeferenced flood class masks and calibrated probability heatmaps.
4. **Evaluation (`src/floodmap/evaluation/`)**: Metric evaluation (IoU, Dice, Precision, Recall, confusion matrix) stratified across terrain slopes.
5. **Infrastructure Exposure (`src/floodmap/infrastructure/`)**: Spatial raster-vector overlay with pre-event OpenStreetMap building and road features.
6. **Network Resilience (`src/floodmap/network/`)**: Graph-based topological connectivity and Dijkstra routing to medical and logistical hubs.
7. **Hydrological Hazard Path (`src/floodmap/hydrology/`)**: D8 steepest descent downstream wave propagation.
8. **Reporting & Rescue Pack (`src/floodmap/reporting/`)**: Deterministic bilingual situation reports (English & Nepali) and self-contained offline rescue packs.
9. **API & Command Center (`src/floodmap/api/`)**: High-performance FastAPI backend serving REST endpoints and React 18 UI.

---

## 2. Mandatory Attributions (§18)

> Contains modified Copernicus Sentinel data 2026.
> Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.
> © OpenStreetMap contributors.
