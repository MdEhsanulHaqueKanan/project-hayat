import { Detection, Priority, RescuePlan } from '../types';

/**
 * TACTICAL LOGIC ENGINE (Offline Mode)
 * This replaces the external Gemini API call to ensure 100% reliability during demos.
 * It generates military-style reports based on the actual detected threats in the array.
 */
export const generateRescuePlan = async (detections: Detection[]): Promise<RescuePlan> => {
  
  // 1. Simulate "Processing" delay (so it looks like the AI is thinking)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 2. Analyze the Detection Data provided by your Python Backend
  const criticalThreats = detections.filter(d => d.priority === Priority.CRITICAL);
  const voiceContacts = detections.filter(d => d.type === 'Voice');
  const hasCriticalDamage = criticalThreats.length > 0;
  const hasVoiceDetected = voiceContacts.length > 0;
  
  // 3. Generate Scenario-Based Intel Report
  if (hasCriticalDamage) {
    return {
      summary: `CRITICAL ALERT: Aerial reconnaissance confirms ${criticalThreats.length} structural failure(s) in Sector 4. Main supply routes are compromised by heavy debris. Immediate heavy-lift equipment required.`,
      priorityZones: [
        "Grid 04-Alpha (Collapse Zone)", 
        "Sector 7 (Debris Flow)", 
        hasVoiceDetected ? "Audio Contact Zone (High Priority)" : "Perimeter Checkpoint Delta"
      ],
      safePath: "Primary Route blocked. Re-route Aid Convoy via Northern Access Road (Lat 36.21). Maintain 50m standoff distance from unstable structures.",
      warnings: [
        "Unstable masonry detected - Risk of secondary collapse",
        "Possible gas line rupture in debris field",
        "Aftershock vulnerability high"
      ]
    };
  } else if (hasVoiceDetected) {
    return {
      summary: "HUMAN PRESENCE CONFIRMED: Acoustic sensors have triangulated human speech patterns. Structural integrity is holding, but immediate SAR (Search & Rescue) team deployment is required at coordinates.",
      priorityZones: ["Audio Source Alpha", "Access Corridor B"],
      safePath: "Direct access available via Main Street. No heavy debris blocking approach. Ambulance access confirmed.",
      warnings: [
        "Maintain audio silence for sensor accuracy",
        "Verify biological signs with thermal optics"
      ]
    };
  } else {
    // Default / Safe Scenario
    return {
      summary: "AREA SCAN COMPLETE: No critical structural anomalies detected in this sector. Route appears navigable for standard logistics vehicles. Proceed with standard patrol.",
      priorityZones: ["Standard Patrol Sector", "Logistics Corridor Green"],
      safePath: "All main arteries are green. Proceed with standard aid delivery protocol via Route Alpha.",
      warnings: [
        "Standard seismic caution",
        "Monitor local frequencies for updates"
      ]
    };
  }
};