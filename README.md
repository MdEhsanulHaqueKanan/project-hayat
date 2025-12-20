# Project Hayat (مشروع حياة)
### AI-Augmented Urban Search & Rescue (USAR) Intelligence Platform

![Status](https://img.shields.io/badge/Status-Prototype_v1.0-emerald?style=for-the-badge)
![Focus](https://img.shields.io/badge/Focus-Humanitarian_Defense-blue?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-YOLOv8_|_FastAPI_|_React-slate?style=for-the-badge)

> *"And whoever saves one [life] - it is as if he had saved mankind entirely."* (Quran 5:32)

---


## 📸 Interface Preview
![Project Hayat Dashboard](./project_hayat.png)
> *The Dashboard displays live telemetry, real-time detection logs, and an automated rescue strategy generator.*

---

## 🚨 The Mission
**Project Hayat** is a Rapid Response Command & Control (C2) platform designed to win the "Golden Hour" following catastrophic seismic events. 

In the chaos of the **2023 Kahramanmaraş Earthquake**, rescuers faced three critical "Blind Spots":
1.  **Visual Blindness:** Inability to distinguish between "damaged" and "collapsed" structures from altitude.
2.  **Logistical Deadlock:** Aid convoys routing through destroyed roads because standard GPS data was outdated.
3.  **Signal Noise:** Difficulty isolating human cries for help from machinery noise.

**Hayat** solves this by fusing **Computer Vision (Satellite/Drone)** and **Signal Processing** into a unified Tactical Dashboard.

---

## ⚡ Core Capabilities (MVP v1.0)

### 1. "Eagle Eye" - Semantic Damage Assessment
*   **Tech:** Ultralytics YOLOv8 (Fine-tuned on Turkey 2023 Earthquake Dataset).
*   **Function:** Analysis of post-disaster drone imagery to classify structural integrity.
*   **Output:** Real-time semantic segmentation of:
    *   🔴 **CRITICAL FAILURE:** Collapsed/Pancaked structures (Priority SAR Zones).
    *   🟢 **STRUCTURAL INTEGRITY:** Standing structures safe for logistics routing.

### 2. Tactical Intelligence Engine
*   **Tech:** Rule-Based Expert System (TypeScript).
*   **Function:** Generates military-grade Situation Reports (SITREPs) based on visual data.
*   **Output:** Automated routing advice (e.g., *"Sector 4 compromised. Re-route Convoy Alpha via Northern Access Road."*).

---

## 🛠️ Technical Architecture

### The "Triad" Stack
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Eye (Vision)** | **YOLOv8 Custom** | Fine-tuned on xView2/Turkey data for rubble detection. |
| **Brain (API)** | **FastAPI (Python)** | Async inference engine serving <100ms predictions. |
| **Face (UI)** | **React + Vite** | Low-latency "Command Center" dashboard with Tailwind CSS. |

---

## 🚀 Deployment Strategy
This project is designed for "Dual-Use" application:
1.  **Humanitarian:** Deployed by AFAD (Turkey) or KSrelief (KSA) for disaster response.
2.  **Resilience:** Used by NEOM (The Line) for smart-city structural health monitoring.

## 📦 Installation (Local Dev)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Author:** 
Md. Ehsanul Haque Kanan
AI Engineer
Dhaka, Bangladesh
