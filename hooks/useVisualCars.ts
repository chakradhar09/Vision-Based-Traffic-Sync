import { useState, useEffect, useRef } from 'react';
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

        // 3. Update Ambulance Status
        newLaneCars = updateAmbulanceStatus(newLaneCars, activeCars, lane.isEmergency);

        // 4. Add or Remove Cars to match targetCount
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

  if (isEmergency && !existingAmbulance && activeCars.length > 0) {
    // Pick a random car to be the ambulance
    const randomIndex = Math.floor(Math.random() * activeCars.length);
    const targetCar = activeCars[randomIndex];

    return cars.map(c => (c.id === targetCar.id ? { ...c, isAmbulance: true } : c));
  }

  if (!isEmergency) {
    // Revert active cars to normal if emergency is cancelled
    return cars.map(c => {
      if (!c.exiting && c.isAmbulance) {
        return { ...c, isAmbulance: false };
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
  idCounter: React.MutableRefObject<number>
): VisualCar[] {
  const newCars = [...currentCars];
  const hasAmbulanceNow = newCars.some(c => !c.exiting && c.isAmbulance);

  // Determine if we need to spawn an ambulance in this batch
  let ambulanceSpawnIndex = -1;
  if (isEmergency && !hasAmbulanceNow) {
    ambulanceSpawnIndex = Math.floor(Math.random() * toAdd);
  }

  for (let i = 0; i < toAdd; i++) {
    const newIndex = activeCount + i;
    const isNewAmbulance = i === ambulanceSpawnIndex;

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
  return cars.map(c => {
    if (!c.exiting) {
      if (c.index < toRemove) {
        return { ...c, exiting: true, exitingAt: now };
      } else {
        return { ...c, index: c.index - toRemove };
      }
    }
    return c;
  });
}

