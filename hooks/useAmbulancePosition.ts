import { useEffect } from 'react';
import React from 'react';
import { LaneStatus, LaneId } from '../types';
import { useVisualCars } from './useVisualCars';

/**
 * Hook to sync ambulance position from visual cars to lane state
 * Updates lanes with ambulanceAtFront flag when ambulance is stopped at front
 * Runs frequently to catch when ambulance reaches front position
 */
export function useAmbulancePosition(
  lanes: LaneStatus[],
  setLanes: React.Dispatch<React.SetStateAction<LaneStatus[]>>
) {
  const visualCars = useVisualCars(lanes);

  // Run on every visualCars change AND on a timer to catch ambulance reaching front
  useEffect(() => {
    const updateAmbulancePosition = () => {
      setLanes(prevLanes => {
        const updatedLanes = prevLanes.map(lane => {
          const cars = visualCars[lane.id];
          const activeCars = cars.filter(c => !c.exiting);
          const ambulance = activeCars.find(c => c.isAmbulance);
          const now = Date.now();
          const AMBULANCE_STOP_DURATION = 10000; // 10 seconds
          
          // Check if ambulance is at front (index 0)
          // Ambulance is at front if:
          // 1. Emergency is active
          // 2. Ambulance exists
          // 3. Ambulance is at index 0 (front of queue)
          // 4. If stoppedAtFront is set, check if still within 10-second stop duration
          //    If not set yet, still consider it at front (will be set by useVisualCars)
          const ambulanceAtFront = lane.isEmergency && // Only check if emergency is active
                                   ambulance !== undefined && 
                                   ambulance.index === 0 &&
                                   (ambulance.stoppedAtFront !== undefined && ambulance.stoppedAtFront > 0
                                     ? (now - ambulance.stoppedAtFront < AMBULANCE_STOP_DURATION)
                                     : true); // If not stopped yet, still consider it at front

          // Only update if the value changed
          if (lane.ambulanceAtFront !== ambulanceAtFront) {
            return { ...lane, ambulanceAtFront };
          }
          return lane;
        });

        // Check if any lane changed
        const hasChanges = updatedLanes.some((lane, index) => 
          lane.ambulanceAtFront !== prevLanes[index].ambulanceAtFront
        );

        return hasChanges ? updatedLanes : prevLanes;
      });
    };

    // Run immediately
    updateAmbulancePosition();

    // Also run on an interval to catch changes that might be missed
    const interval = setInterval(updateAmbulancePosition, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [visualCars, setLanes, lanes]);
}

