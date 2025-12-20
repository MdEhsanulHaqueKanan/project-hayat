
import React from 'react';
import { Building2, Mic, Thermometer, AlertTriangle } from 'lucide-react';
import { Detection, Priority } from './types';

export const MOCK_DETECTIONS: Detection[] = [
  {
    id: 'det-001',
    type: 'Collapse',
    description: 'Structural collapse - Multi-story residential',
    time: '10:42 AM',
    priority: Priority.CRITICAL,
    confidence: 0.98,
    coordinates: { lat: 36.2023, lng: 36.1601 }
  },
  {
    id: 'det-002',
    type: 'Voice',
    description: 'Human Voice Pattern Detected',
    time: '10:44 AM',
    priority: Priority.HIGH,
    confidence: 0.89,
    coordinates: { lat: 36.2025, lng: 36.1612 }
  },
  {
    id: 'det-003',
    type: 'Thermal',
    description: 'Cluster of 4 heat signatures detected sub-surface',
    time: '10:48 AM',
    priority: Priority.HIGH,
    confidence: 0.94,
    coordinates: { lat: 36.2031, lng: 36.1598 }
  },
  {
    id: 'det-004',
    type: 'Hazard',
    description: 'Gas leak detected - Sector 4B',
    time: '10:51 AM',
    priority: Priority.CRITICAL,
    confidence: 1.0,
    coordinates: { lat: 36.2018, lng: 36.1625 }
  },
  {
    id: 'det-005',
    type: 'Collapse',
    description: 'Secondary debris flow detected',
    time: '10:55 AM',
    priority: Priority.MEDIUM,
    confidence: 0.76,
    coordinates: { lat: 36.2045, lng: 36.1582 }
  }
];

export const getIconForType = (type: string) => {
  switch (type) {
    case 'Collapse': return <Building2 size={16} />;
    case 'Voice': return <Mic size={16} />;
    case 'Thermal': return <Thermometer size={16} />;
    case 'Hazard': return <AlertTriangle size={16} />;
    default: return <AlertTriangle size={16} />;
  }
};
