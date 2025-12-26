import { Timestamp } from 'firebase/firestore';

export interface LaneStatus {
  laneId: string;
  status: 'red' | 'green' | 'yellow';
  secondsRemaining: number;
  lastUpdated: Timestamp;
  emergencyOverride: boolean;
}

export interface CameraFeed {
  laneId: string;
  filePath: string;
  uploadTime: Timestamp;
  fileType: string;
}

export interface EmergencyMode {
  isActive: boolean;
  activatedBy: string;
  activatedAt: Timestamp;
  reason: string;
}
