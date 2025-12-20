# Project Hayat - Development Log & Roadmap

## 🏁 Phase 1: The "Eagle Eye" Prototype (COMPLETED)
**Objective:** Build an end-to-end MVP capable of detecting structural damage from drone imagery.
- [x] **Data Pipeline:** Acquired Turkey Earthquake 2023 dataset (Kaggle).
- [x] **AI Model:** Trained YOLOv8-Classification on 'Damaged' vs 'Undamaged' structures (Accuracy: 99.2%).
- [x] **Backend:** Built FastAPI server with async inference endpoints.
- [x] **Frontend:** Developed React "Tactical Dashboard" with real-time alert systems.
- [x] **Integration:** Successfully connected Python Backend to React Frontend via Axios.

---

## 🎧 Phase 2: The "Listener" (Audio Intelligence)
**Objective:** Isolate human speech from high-noise drone environments.
**Hardware Required:** Desktop PC (RTX 3050).
- [ ] **Research:** Investigate "Rotors-informed Wave-U-Net" for noise cancellation.
- [ ] **Data:** Acquire ESC-50 (Environmental Sound Classification) dataset.
- [ ] **Model:** Train a Denoising Autoencoder to filter drone propeller frequencies.
- [ ] **Integration:** Add audio waveform visualization to the Dashboard.

---

## 🌍 Phase 3: "Ghost Protocol" (Deployment & Optimization)
**Objective:** Optimize for edge deployment in low-bandwidth disaster zones.
- [ ] **Docker:** Containerize the Backend and Frontend for one-click deployment.
- [ ] **Edge Optimization:** Quantize YOLOv8 model (Float32 -> Int8) to run on Raspberry Pi/Jetson Nano.
- [ ] **Mapping:** Replace static background with offline Leaflet maps (OpenStreetMap).

---

## 🤝 Project Legacy & Impact
*"Intercepting Time to Save Lives."*
This project serves as a technical proof-of-concept for:
1.  **AFAD (Turkey):** Automated damage assessment.
2.  **KSrelief (KSA):** Smart humanitarian logistics.