import { useState, useEffect, useRef, MutableRefObject } from 'react';
import { LaneId, LaneStatus } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';
import { VisualCar } from '../types/car';

/**
 * Hook to manage visual car state for intersection display
 */
export function useVisualCars(lanes: LaneStatus[]) {
  const [visualCars, setVisualCars] = useState<Record<LaneId, VisualCar[]>>({
    lane_1: [],
    lane_2: [],
    lane_3: [],
    lane_4: [],
  });

  const carIdCounter = useRef(0);

  // Main reconciliation logic
  useEffect(() => {
    setVisualCars(prev => {
      const nextState = { ...prev };
      const now = Date.now();

      lanes.forEach(lane => {
        const laneId = lane.id;
        const currentCars = prev[laneId];

        // 1. Cleanup old exiting cars
        let newLaneCars = currentCars.filter(
          c => !c.exiting || (now - (c.exitingAt || 0) < TRAFFIC_CONFIG.CAR_EXIT_ANIMATION_DURATION)
        );

        // 2. Identify active (queueing) cars
        const activeCars = newLaneCars.filter(c => !c.exiting);
        const activeCount = activeCars.length;
        const targetCount = lane.vehicleCount;

        // 3. Add or Remove Cars to match targetCount
        if (targetCount > activeCount) {
          newLaneCars = addCarsToLane(
            newLaneCars,
            activeCount,
            targetCount - activeCount,
            laneId,
            lane.isEmergency,
            carIdCounter
          );
        } else if (targetCount < activeCount) {
          newLaneCars = removeCarsFromLane(newLaneCars, activeCount - targetCount, now);
        }

        // 4. Update Ambulance Status (after add/remove to catch when it reaches front)
        const updatedActiveCars = newLaneCars.filter(c => !c.exiting);
        newLaneCars = updateAmbulanceStatus(newLaneCars, updatedActiveCars, lane.isEmergency);

        nextState[laneId] = newLaneCars;
      });

      return nextState;
    });
  }, [lanes]);

  // Cleanup loop to remove finished exiting cars
  useEffect(() => {
    const interval = setInterval(() => {
      setVisualCars(prev => {
        let hasChanges = false;
        const next = { ...prev };
        const now = Date.now();

        (Object.keys(next) as LaneId[]).forEach(key => {
          const initialLen = next[key].length;
          next[key] = next[key].filter(
            c => !c.exiting || (now - (c.exitingAt || 0) < TRAFFIC_CONFIG.CAR_EXIT_ANIMATION_DURATION)
          );
          if (next[key].length !== initialLen) hasChanges = true;
        });

        return hasChanges ? next : prev;
      });
    }, TRAFFIC_CONFIG.CAR_CLEANUP_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return visualCars;
}

/**
 * Update ambulance status for cars in a lane
 */
function updateAmbulanceStatus(
  cars: VisualCar[],
  activeCars: VisualCar[],
  isEmergency: boolean
): VisualCar[] {
  const existingAmbulance = activeCars.find(c => c.isAmbulance);
  const now = Date.now();
  const AMBULANCE_STOP_DURATION = 10000; // 10 seconds

  if (isEmergency && !existingAmbulance && activeCars.length > 0) {
    // Place ambulance at the END of the lane (highest index)
    const lastCar = activeCars[activeCars.length - 1];
    return cars.map(c => (c.id === lastCar.id ? { ...c, isAmbulance: true } : c));
  }

  // Handle ambulance stop logic when it reaches front (index 0)
  if (isEmergency && existingAmbulance) {
    return cars.map(c => {
      if (c.id === existingAmbulance.id && !c.exiting) {
        // If ambulance is at front (index 0) and not already stopped
        if (c.index === 0 && !c.stoppedAtFront) {
          return { ...c, stoppedAtFront: now };
        }
        // If ambulance has been stopped for 10+ seconds, allow it to proceed
        if (c.stoppedAtFront && (now - c.stoppedAtFront >= AMBULANCE_STOP_DURATION)) {
          return { ...c, stoppedAtFront: undefined };
        }
      }
      return c;
    });
  }

  if (!isEmergency) {
    // Revert active cars to normal if emergency is cancelled
    return cars.map(c => {
      if (!c.exiting && c.isAmbulance) {
        return { ...c, isAmbulance: false, stoppedAtFront: undefined };
      }
      return c;
    });
  }

  return cars;
}

/**
 * Add cars to a lane
 */
function addCarsToLane(
  currentCars: VisualCar[],
  activeCount: number,
  toAdd: number,
  laneId: LaneId,
  isEmergency: boolean,
  idCounter: MutableRefObject<number>
): VisualCar[] {
  const newCars = [...currentCars];
  const hasAmbulanceNow = newCars.some(c => !c.exiting && c.isAmbulance);

  // If emergency and no ambulance, spawn ambulance at the END (last position)
  // Otherwise, add normal cars
  for (let i = 0; i < toAdd; i++) {
    const newIndex = activeCount + i;
    // Only spawn ambulance if emergency is active, no ambulance exists, and this is the last car being added
    const isNewAmbulance = isEmergency && !hasAmbulanceNow && i === toAdd - 1;

    newCars.push({
      id: `car-${laneId}-${idCounter.current++}`,
      index: newIndex,
      exiting: false,
      isAmbulance: isNewAmbulance,
    });
  }

  return newCars;
}

/**
 * Remove cars from a lane (mark them as exiting)
 */
function removeCarsFromLane(
  cars: VisualCar[],
  toRemove: number,
  now: number
): VisualCar[] {
  const AMBULANCE_STOP_DURATION = 10000; // 10 seconds
  
  return cars.map(c => {
    if (!c.exiting) {
      // If ambulance is stopped at front, don't remove it yet
      if (c.isAmbulance && c.index === 0 && c.stoppedAtFront) {
        // If still within stop duration, keep it at front
        if (now - c.stoppedAtFront < AMBULANCE_STOP_DURATION) {
          return c; // Don't move or remove ambulance yet
        }
        // Stop duration passed, allow it to proceed
        return { ...c, stoppedAtFront: undefined, exiting: true, exitingAt: now };
      }
      
      // Normal car removal logic
      if (c.index < toRemove) {
        return { ...c, exiting: true, exitingAt: now };
      } else {
        return { ...c, index: c.index - toRemove };
      }
    }
    return c;
  });
}

