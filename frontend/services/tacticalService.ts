import { Detection, Priority, RescuePlan } from '../types';

/**
 * TACTICAL LOGIC ENGINE (Offline Mode)
 * Generates military-style reports based on detected threats.
 * PRIORITIZATION: Life Signs (Audio) > Structural Damage (Visual) > Safe
 */
export const generateRescuePlan = async (detections: Detection[]): Promise<RescuePlan> => {
  
  // 1. Simulate "Processing" delay (so it looks like the AI is thinking)
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 2. Analyze the Detection Data provided by your Python Backend
  const criticalThreats = detections.filter(d => d.priority === Priority.CRITICAL);
  const voiceContacts = detections.filter(d => d.type === 'Voice');
  
  const hasVoiceDetected = voiceContacts.length > 0;
  const hasCriticalDamage = criticalThreats.length > 0;
  
  // 3. Generate Scenario-Based Intel Report
  
  // --- SCENARIO A: LIFE DETECTED (HIGHEST PRIORITY) ---
  // If a human voice is heard, this takes precedence over structural damage.
  if (hasVoiceDetected) {
    return {
      summary: `URGENT - BIO-SIGNAL DETECTED: Acoustic sensors have isolated human distress signals at ${voiceContacts.length} location(s). Immediate SAR extraction team required. Structural instability may be present in the sector.`,
      priorityZones: [
        "Audio Source Alpha (Primary Target)", 
        hasCriticalDamage ? "Collapse Zone (Hazard)" : "Access Corridor B"
      ],
      safePath: "Route generated for Light Rescue Team (K-9 Unit). Heavy machinery must hold position to avoid vibration interference with sensors.",
      warnings: [
        "MAINTAIN AUDIO SILENCE for sensor accuracy",
        "Verify biological signs with thermal optics",
        hasCriticalDamage ? "Caution: Active falling debris in sector" : "Standard seismic protocols active"
      ]
    };
  } 
  
  // --- SCENARIO B: CRITICAL DAMAGE (NO VOICE) ---
  // If no voice, but buildings are collapsed, focus on logistics and heavy equipment.
  else if (hasCriticalDamage) {
    return {
      summary: `CRITICAL ALERT: Aerial reconnaissance confirms ${criticalThreats.length} structural failure(s) in Sector 4. Main supply routes are compromised by heavy debris. Immediate heavy-lift equipment required.`,
      priorityZones: [
        "Grid 04-Alpha (Collapse Zone)", 
        "Sector 7 (Debris Flow)"
      ],
      safePath: "Primary Route blocked. Re-route Aid Convoy via Northern Access Road (Lat 36.21). Maintain 50m standoff distance from unstable structures.",
      warnings: [
        "Unstable masonry detected - Risk of secondary collapse",
        "Possible gas line rupture in debris field",
        "Aftershock vulnerability high"
      ]
    };
  } 
  
  // --- SCENARIO C: ALL CLEAR ---
  else {
    return {
      summary: "AREA SCAN COMPLETE: No critical structural anomalies or distress signals detected. Route appears navigable for standard logistics vehicles. Proceed with standard patrol.",
      priorityZones: ["Standard Patrol Sector", "Logistics Corridor Green"],
      safePath: "All main arteries are green. Proceed with standard aid delivery protocol via Route Alpha.",
      warnings: [
        "Standard seismic caution",
        "Monitor local frequencies for updates"
      ]
    };
  }
};