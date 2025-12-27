export type LaneId = 'lane_1' | 'lane_2' | 'lane_3' | 'lane_4';

export type SignalStatus = 'red' | 'green';

export interface LaneStatus {
  id: LaneId;
  label: string;
  vehicleCount: number;
  status: SignalStatus;
  timer: number;
  isEmergency: boolean;
  ambulanceAtFront?: boolean; // True when ambulance is stopped at front (index 0)
}

export interface SingleLaneAnalysisResult {
  vehicleCount: number;
  emergency: boolean;
  emergencyType: string | null;
}

// Re-export types from sub-modules
export type { VisualCar } from './types/car';
export type { IncidentType, IncidentReport } from './types/incident';
