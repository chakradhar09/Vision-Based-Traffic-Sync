import { LaneStatus } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';
import { generateAITrafficInsight, calculateAIBestRoute } from '../services/aiTrafficService';

/**
 * Calculate the best route based on current traffic conditions
 * Uses AI if available, falls back to rule-based logic
 */
export async function calculateBestRoute(lanes: LaneStatus[]): Promise<string> {
  // Try AI-powered route calculation first
  const aiRoute = await calculateAIBestRoute(lanes);
  if (aiRoute) {
    return aiRoute;
  }

  // Fallback to rule-based calculation
  const bestLane = [...lanes].sort((a, b) => {
    // Prioritize: no emergency, lower vehicle count, green signal
    if (a.isEmergency && !b.isEmergency) return 1;
    if (!a.isEmergency && b.isEmergency) return -1;
    if (a.status === 'green' && b.status !== 'green') return -1;
    if (a.status !== 'green' && b.status === 'green') return 1;
    return a.vehicleCount - b.vehicleCount;
  })[0];
  
  return bestLane.label;
}

/**
 * Generate traffic insight using AI if available, falls back to rule-based logic
 */
export async function generateTrafficInsight(lanes: LaneStatus[]): Promise<string> {
  // Try AI-powered insight generation first
  const aiInsight = await generateAITrafficInsight(lanes);
  if (aiInsight) {
    return aiInsight;
  }

  // Fallback to rule-based insight generation
  const totalCars = lanes.reduce((acc, l) => acc + l.vehicleCount, 0);
  const busiest = [...lanes].sort((a, b) => b.vehicleCount - a.vehicleCount)[0];
  const hasEmergency = lanes.some(l => l.isEmergency);

  if (totalCars > TRAFFIC_CONFIG.HIGH_CONGESTION_THRESHOLD) {
    return `High congestion detected at ${busiest.label}. Suggest rerouting via ORR Service Road to avoid delays.`;
  }
  
  if (hasEmergency) {
    return 'Emergency corridor active. Signal pre-emption in effect. Commuters advised to yield.';
  }
  
  return 'Traffic flow optimal. Green wave synchronization active across IT Corridor.';
}

