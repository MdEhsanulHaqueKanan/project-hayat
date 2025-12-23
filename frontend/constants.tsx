import React from 'react';
import { Building2, Mic, Thermometer, AlertTriangle } from 'lucide-react';
import { Detection } from './types';

// CHANGED: Empty array so the Dashboard starts clean.
// Only REAL detections from your AI will appear here now.
export const MOCK_DETECTIONS: Detection[] = [];

export const getIconForType = (type: string) => {
  switch (type) {
    case 'Collapse': return <Building2 size={16} />;
    case 'Voice': return <Mic size={16} />;
    case 'Thermal': return <Thermometer size={16} />;
    case 'Hazard': return <AlertTriangle size={16} />;
    default: return <AlertTriangle size={16} />;
  }
};