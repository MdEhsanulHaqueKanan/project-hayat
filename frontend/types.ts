
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
}

export interface RescuePlan {
  summary: string;
  priorityZones: string[];
  safePath: string;
  warnings: string[];
}
