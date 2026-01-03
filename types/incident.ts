/**
 * Types for incident reporting
 */

export type IncidentType = 'Accident' | 'Pothole / Road Work';

export interface IncidentReport {
  id: string;
  type: IncidentType;
  laneId: string;
  laneLabel: string;
  timestamp: number;
  reportedBy: 'citizen' | 'system';
}




