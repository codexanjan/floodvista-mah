# FLOODVISTA AI — Product Requirements Document (PRD)

**Project:** FLOODVISTA AI  
**Track:** Multimodal AI Hackathon 2026 — Track B: Mapping Flood Damage from Space  
**Tagline:** *See. Understand. Rescue Faster.*  

---

## 1. Objective & Scope

FLOODVISTA AI provides operational geospatial intelligence for rapid disaster decision-making during catastrophic mountain flash flood events. Using the August 2026 Trishuli flood in Nepal as our reference scenario, the platform integrates multi-temporal Sentinel-1 SAR, Copernicus WorldDEM-30, and OpenStreetMap infrastructure vectors to assess inundation, infrastructure exposure, and settlement connectivity.

---

## 2. Core Operational Capabilities

1. **Flood Evidence Twin**: Synchronized before-and-after satellite viewer displaying raw SAR amplitude, optical indices, DEM slope, and Hann-window smoothed U-Net inference with click-to-explain transparency.
2. **Rescue Route Resilience Lab**: Graph-based network analysis using NetworkX Dijkstra shortest path routing to assess severed road segments, detour penalties, and cut-off settlements.
3. **TrustScore Uncertainty Engine**: Separates impact severity from evidence certainty across Observed, Spatially Inferred, and Network Inferred tiers.
4. **What-If Disaster Simulator**: Real-time interactive parameter sliders for road disruption thresholds, model confidence cutoffs, and debris buffer hazard margins.
5. **Offline Rescue Pack & Bilingual SitReps**: Production of compact, offline-executable `.zip` rescue packs and deterministic bilingual situation reports in English and Nepali.

---

## 3. Mandatory Attributions

> Contains modified Copernicus Sentinel data 2026.
> Produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.
> © OpenStreetMap contributors.
