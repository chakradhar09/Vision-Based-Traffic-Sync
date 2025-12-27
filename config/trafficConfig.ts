import { LaneStatus } from '../types';

/**
 * Traffic simulation configuration constants
 */
export const TRAFFIC_CONFIG = {
  // Traffic flow simulation
  MIN_SIMULATION_DELAY: 500,
  MAX_SIMULATION_DELAY: 1500,
  INITIAL_SIMULATION_DELAY: 1000,
  
  // Vehicle count limits
  MAX_VEHICLE_COUNT: 50,
  MIN_VEHICLE_COUNT: 0,
  
  // Traffic flow rates
  OUTFLOW_MIN: 1,
  OUTFLOW_MAX: 4,
  INFLOW_PROBABILITY: 0.4,
  BURST_PROBABILITY: 0.9,
  ADDITIONAL_VEHICLE_PROBABILITY: 0.8,
  
  // Signal timing
  MIN_GREEN_TIME: 10,
  MAX_GREEN_TIME: 60,
  EMERGENCY_GREEN_TIME: 30, // Increased to 30 seconds for better visibility
  EMERGENCY_CLEARANCE_TIMER: 5,
  DEFAULT_EMPTY_TIMER: 10,
  TIMER_REDUCTION_RATE: 1, // seconds per tick
  MIN_TIMER_BEFORE_SWITCH: 3,
  DEFAULT_EXTEND_TIMER: 15,
  
  // Route calculation
  ROUTE_UPDATE_INTERVAL: 3000,
  HIGH_CONGESTION_THRESHOLD: 60,
  
  // Visual car animation
  CAR_EXIT_ANIMATION_DURATION: 1000, // ms
  CAR_CLEANUP_INTERVAL: 500, // ms
  CAR_SPACING: 30, // px
  CAR_STOP_LINE_OFFSET: 24, // px
  CAR_EXIT_OFFSET: -60, // px
  
  // Lane order for cycling
  LANE_ORDER: ['lane_1', 'lane_2', 'lane_3', 'lane_4'] as const,
} as const;

/**
 * Initial lane configuration
 */
export const INITIAL_LANES: LaneStatus[] = [
  { id: 'lane_1', label: 'Hitech City Main Rd', vehicleCount: 0, status: 'green', timer: 10, isEmergency: false },
  { id: 'lane_2', label: 'Gachibowli Flyover', vehicleCount: 0, status: 'red', timer: 0, isEmergency: false },
  { id: 'lane_3', label: 'Jubilee Hills Checkpost', vehicleCount: 0, status: 'red', timer: 0, isEmergency: false },
  { id: 'lane_4', label: 'Raheja Mindspace', vehicleCount: 0, status: 'red', timer: 0, isEmergency: false },
];

/**
 * Lane configuration for UI
 */
export const LANE_CONFIG = [
  { id: 'lane_1' as const, label: 'Hitech City', direction: 'N' },
  { id: 'lane_2' as const, label: 'Gachibowli', direction: 'E' },
  { id: 'lane_3' as const, label: 'Jubilee Hills', direction: 'S' },
  { id: 'lane_4' as const, label: 'Mindspace', direction: 'W' },
] as const;

/**
 * Calculate green time based on vehicle count
 */
export function calculateGreenTime(vehicleCount: number): number {
  const time = (vehicleCount * 3) + 5;
  return Math.max(
    TRAFFIC_CONFIG.MIN_GREEN_TIME,
    Math.min(TRAFFIC_CONFIG.MAX_GREEN_TIME, time)
  );
}

