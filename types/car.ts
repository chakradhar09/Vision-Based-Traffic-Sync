/**
 * Types for visual car rendering
 */

export interface VisualCar {
  id: string;
  index: number;
  exiting: boolean;
  exitingAt?: number;
  isAmbulance: boolean;
  stoppedAtFront?: number; // Timestamp when ambulance stopped at front (index 0)
}

