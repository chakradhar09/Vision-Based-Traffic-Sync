import { Timestamp } from 'firebase/firestore';

export interface LaneStatus {
  lane_id: string;
  current_timer: number;
  vehicle_count: number;
  emergency_detected: boolean;
  traffic_light_state: 'red' | 'green' | 'yellow';
  last_updated: Timestamp;
  next_intersection_cleared: boolean;
}

export interface NextIntersection {
  intersection_id: string;
  green_wave_active: boolean;
  affected_lanes: string[];
  activated_at: Timestamp;
  expires_at: Timestamp;
}

export interface SystemHealth {
  n8n_connected: boolean;
  gemini_connected: boolean;
  last_check: Timestamp;
}
