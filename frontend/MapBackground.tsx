import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Detection, Priority, RescuePlan } from './types';

// Custom SVG Icon Generator to avoid external asset dependencies
const createIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-pin',
        html: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#1e293b" stroke-width="1.5" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5));">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3" fill="#1e293b"></circle>
            </svg>
        `,
        iconSize: [36, 36],   
        iconAnchor: [18, 36], 
        popupAnchor: [0, -36] 
    });
};

const redIcon = createIcon('#ef4444');   // High Priority
const blueIcon = createIcon('#06b6d4');  // Bio/Audio Signal
const greenIcon = createIcon('#10b981'); // Base Station

// Helper component to programmatically animate map view changes
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 15, { duration: 2.0 });
    }, [center, map]);
    return null;
};

interface MapProps {
    detections: Detection[];
    rescuePlan: RescuePlan | null;
    activeTarget: Detection | null;
    onMarkerClick: (det: Detection) => void;
}

export const MapBackground: React.FC<MapProps> = ({ detections, rescuePlan, activeTarget, onMarkerClick }) => {
    const defaultCenter: [number, number] = [36.2023, 36.1601]; // Antakya Coordinates
    
    // Prioritize user-selected target, fallback to most recent detection
    const targetDetection = activeTarget || (detections.length > 0 ? detections[0] : null);
    
    const activeCenter = targetDetection 
        ? [targetDetection.coordinates.lat, targetDetection.coordinates.lng] as [number, number]
        : defaultCenter;

    // Simulate a base station location relative to the target for visualization
    const baseStationCoords: [number, number] = targetDetection 
        ? [targetDetection.coordinates.lat + 0.004, targetDetection.coordinates.lng - 0.006] 
        : [36.2063, 36.1541];

    const flightPath = [baseStationCoords, activeCenter];

    return (
        <div className="absolute inset-0 z-0 pointer-events-auto">
            <MapContainer 
                center={defaultCenter} 
                zoom={14} 
                style={{ height: '100%', width: '100%', background: '#020617', position: 'absolute', top: 0, left: 0 }}
                zoomControl={false} 
                scrollWheelZoom={true}
            >
                {/* CartoDB Dark Matter Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                <MapUpdater center={activeCenter} />

                {/* Render Flight Path & Base Station if Routing is Active */}
                {rescuePlan && targetDetection && (
                    <>
                        <Polyline 
                            positions={flightPath} 
                            pathOptions={{ color: '#10b981', weight: 4, dashArray: '10, 10', opacity: 0.8 }} 
                        />
                        <Marker position={baseStationCoords} icon={greenIcon}>
                            <Popup className="tactical-popup">
                                <strong>FOB ALPHA</strong><br/>
                                Logistics Base
                            </Popup>
                        </Marker>
                    </>
                )}

                {/* Render Sensor Detections */}
                {detections.map((det) => (
                    <Marker 
                        key={det.id} 
                        position={[det.coordinates.lat, det.coordinates.lng]}
                        icon={det.priority === Priority.CRITICAL ? redIcon : blueIcon}
                        eventHandlers={{
                            click: () => onMarkerClick(det),
                        }}
                    >
                        <Popup className="tactical-popup">
                            <div 
                                className="cursor-pointer hover:text-cyan-400 transition-colors"
                                onClick={() => onMarkerClick(det)}
                            >
                                <strong className="font-mono text-xs">{det.type.toUpperCase()}</strong><br/>
                                <span className="text-[10px] text-slate-500">CLICK TO ROUTE</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            
            {/* Vignette Overlay for Tactical UI Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] z-[400]" />
        </div>
    );
};