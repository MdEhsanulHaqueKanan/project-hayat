export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface Detection {
  id: string;
  type: 'Collapse' | 'Voice' | 'Thermal' | 'Hazard';
  description: string;
  time: string;
  priority: Priority;
  confidence: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  // NEW: Stores the Blob URL of the uploaded file so we can view it again later
  mediaUrl?: string; 
}

export interface RescuePlan {
  summary: string;
  priorityZones: string[];
  safePath: string;
  warnings: string[];
}