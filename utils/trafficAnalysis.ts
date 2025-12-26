import { LaneStatus } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';

/**
 * Calculate the best route based on current traffic conditions
 */
export function calculateBestRoute(lanes: LaneStatus[]): string {
  const bestLane = [...lanes].sort((a, b) => a.vehicleCount - b.vehicleCount)[0];
  return bestLane.label;
}

/**
 * Generate Gemini AI insight based on traffic conditions
 */
export function generateTrafficInsight(lanes: LaneStatus[]): string {
  const totalCars = lanes.reduce((acc, l) => acc + l.vehicleCount, 0);
  const busiest = [...lanes].sort((a, b) => b.vehicleCount - a.vehicleCount)[0];
  const hasEmergency = lanes.some(l => l.isEmergency);

  if (totalCars > TRAFFIC_CONFIG.HIGH_CONGESTION_THRESHOLD) {
    return `High congestion detected at ${busiest.label}. Suggest rerouting students via ORR Service Road to avoid delays.`;
  }
  
  if (hasEmergency) {
    return 'Emergency corridor active. Analyzing signal pre-emption efficiency. Commuters advised to yield.';
  }
  
  return 'Traffic flow optimal. Green wave synchronization active across IT Corridor.';
}

