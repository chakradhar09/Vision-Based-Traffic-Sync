export type LaneId = 'lane_1' | 'lane_2' | 'lane_3' | 'lane_4';

export interface LaneStatus {
  id: LaneId;
  label: string;
  vehicleCount: number;
  status: 'red' | 'green';
  timer: number;
  isEmergency: boolean;
}

export interface SingleLaneAnalysisResult {
  vehicleCount: number;
  emergency: boolean;
  emergencyType: string | null;
}
