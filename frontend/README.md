# Project Hayat - Tactical Dashboard (Frontend)

This directory contains the user interface logic for **Project Hayat**. It is a high-performance React application designed for low-latency rendering of geospatial data and sensor telemetry.

## 🛠️ Tech Stack
*   **Core:** React 18 + Vite (for sub-millisecond HMR).
*   **Styling:** Tailwind CSS (Dark mode tactical theme).
*   **Mapping:** Leaflet + React-Leaflet (CartoDB Dark Matter tiles).
*   **Icons:** Lucide-React + Dynamic SVG generation.
*   **State:** Local React State (optimized for real-time updates).

## 📂 Key Architecture
*   **`App.tsx`**: Main controller. Handles state lifting between the Sidebar, Map, and Media Overlays. Manages the connection to the Python Backend.
*   **`MapBackground.tsx`**: A specialized Map component that handles:
    *   Dynamic route generation (Green Polylines).
    *   Custom SVG Pin rendering (Red/Blue/Green indicators).
    *   Automatic camera fly-to animations.
*   **`types.ts`**: Strict TypeScript definitions for Sensor Data and Rescue Plans to ensure type safety.

## 🚀 Local Development setup

If you are running the frontend independently (outside of Docker), follow these steps:

### 1. Prerequisites
*   Node.js (v18 or higher)
*   npm

### 2. Installation
```bash
cd frontend
npm install