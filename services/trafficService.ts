import { SingleLaneAnalysisResult, LaneStatus, LaneId } from "../types";
import { TRAFFIC_CONFIG, calculateGreenTime } from "../config/trafficConfig";
import { logger } from "../utils/logger";

/**
 * Backend API URL - points to secure backend server
 * API keys are kept server-side only, never exposed to browser
 */
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const analyzeLaneImage = async (base64Image: string, laneLabel: string): Promise<SingleLaneAnalysisResult> => {
  try {
    // Call backend proxy instead of direct API
    // API key is kept server-side, never exposed to browser
    const response = await fetch(`${BACKEND_API_URL}/api/gemini/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Image, laneLabel }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    return {
      vehicleCount: data.vehicleCount || 0,
      emergency: data.emergency || false,
      emergencyType: data.emergencyType || null,
    };
  } catch (error) {
    logger.error("Lane analysis failed", error, {
      component: 'trafficService',
      function: 'analyzeLaneImage',
    });
    throw error;
  }
};

export const calculateTrafficTimings = (currentLanes: LaneStatus[]): Record<LaneId, { status: 'red' | 'green', timer: number }> => {
  const timings: Record<LaneId, { status: 'red' | 'green', timer: number }> = {
    lane_1: { status: 'red', timer: 0 },
    lane_2: { status: 'red', timer: 0 },
    lane_3: { status: 'red', timer: 0 },
    lane_4: { status: 'red', timer: 0 },
  };

  // 1. Check for Emergency Priority
  const emergencyLane = currentLanes.find(l => l.isEmergency);

  if (emergencyLane) {
    // Grant Green to emergency lane immediately
    currentLanes.forEach(lane => {
      if (lane.id === emergencyLane.id) {
        timings[lane.id] = { status: 'green', timer: TRAFFIC_CONFIG.EMERGENCY_GREEN_TIME };
      } else {
        timings[lane.id] = { status: 'red', timer: 0 };
      }
    });
    return timings;
  }

  // 2. Standard Density-Based Priority (Green Wave)
  // Find the lane with the highest vehicle count
  const sortedLanes = [...currentLanes].sort((a, b) => b.vehicleCount - a.vehicleCount);
  const priorityLane = sortedLanes[0];

  // If even the busiest lane has 0 cars, default to Lane 1
  if (priorityLane.vehicleCount === 0) {
    timings['lane_1'] = { status: 'green', timer: TRAFFIC_CONFIG.DEFAULT_EMPTY_TIMER };
    return timings;
  }

  currentLanes.forEach(lane => {
    if (lane.id === priorityLane.id) {
      // Ensure minimum green time is always enforced (even for empty lanes)
      const greenTime = lane.vehicleCount === 0 
        ? TRAFFIC_CONFIG.DEFAULT_EMPTY_TIMER 
        : calculateGreenTime(lane.vehicleCount);
      timings[lane.id] = { status: 'green', timer: greenTime };
    } else {
      timings[lane.id] = { status: 'red', timer: 0 };
    }
  });
  
  return timings;
};
