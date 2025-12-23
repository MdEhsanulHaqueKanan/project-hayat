import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Detection, Priority } from './types';

// --- ICON FIXES (Use CDN Links instead of local imports) ---
// This bypasses the TypeScript "Cannot find module" error
const DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- CUSTOM TACTICAL ICONS ---
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// --- HELPER: Smooth FlyTo Animation ---
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 15, { duration: 2.5 }); // Smooth zoom to new detection
    }, [center, map]);
    return null;
};

interface MapProps {
    detections: Detection[];
}

export const MapBackground: React.FC<MapProps> = ({ detections }) => {
    // Default Center: Antakya, Turkey (Earthquake Epicenter)
    const defaultCenter: [number, number] = [36.2023, 36.1601];
    
    // Focus on the most recent detection (top of list)
    const activeCenter = detections.length > 0 
        ? [detections[0].coordinates.lat, detections[0].coordinates.lng] as [number, number]
        : defaultCenter;

    return (
        <div className="absolute inset-0 z-0 pointer-events-auto">
            <MapContainer 
                center={defaultCenter} 
                zoom={14} 
                style={{ height: '100%', width: '100%', background: '#020617', position: 'absolute', top: 0, left: 0 }}
                zoomControl={false} // Minimalist mode
                scrollWheelZoom={true}
            >
                {/* DARK MODE TILES (CartoDB Dark Matter) */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <MapUpdater center={activeCenter} />

                {/* RENDER PINS */}
                {detections.map((det) => (
                    <Marker 
                        key={det.id} 
                        position={[det.coordinates.lat, det.coordinates.lng]}
                        icon={det.priority === Priority.CRITICAL ? redIcon : blueIcon}
                    >
                        <Popup className="tactical-popup">
                            <div className="text-xs font-mono font-bold">
                                {det.type.toUpperCase()}
                            </div>
                            <div className="text-[10px] text-slate-500">
                                {det.time}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            
            {/* VIGNETTE OVERLAY (Makes it look like a screen) */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] z-[400]" />
        </div>
    );
};