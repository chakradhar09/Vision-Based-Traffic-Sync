import React, { useState, useEffect, useRef } from 'react';
import { LaneStatus, LaneId } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';
import LaneCard from './LaneCard';
import { VisualCar } from './VisualCar';

interface IntersectionProps {
  lanes: LaneStatus[];
}

interface VisualCar {
  id: string;
  index: number;
  exiting: boolean;
  exitingAt?: number;
  isAmbulance: boolean;
}

const Intersection: React.FC<IntersectionProps> = ({ lanes }) => {
  const [visualCars, setVisualCars] = useState<Record<LaneId, VisualCar[]>>({
    lane_1: [], lane_2: [], lane_3: [], lane_4: []
  });
  
  const carIdCounter = useRef(0);

  // --- RECONCILIATION LOGIC ---
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
        // Check if we already have an ambulance in the active queue
        const existingAmbulance = activeCars.find(c => c.isAmbulance);

        if (lane.isEmergency && !existingAmbulance) {
           if (activeCount > 0) {
              // Scenario: Emergency turned on, cars exist, but no ambulance designated yet.
              // Pick a random car to be the ambulance.
              const randomIndex = Math.floor(Math.random() * activeCount);
              const targetCar = activeCars[randomIndex];
              
              newLaneCars = newLaneCars.map(c => 
                c.id === targetCar.id ? { ...c, isAmbulance: true } : c
              );
           }
        } else if (!lane.isEmergency) {
             // Revert active cars to normal if emergency is cancelled
             newLaneCars = newLaneCars.map(c => {
                if (!c.exiting && c.isAmbulance) return { ...c, isAmbulance: false };
                return c;
             });
        }

        // 4. Add or Remove Cars to match targetCount
        if (targetCount > activeCount) {
          // ADD CARS
          const toAdd = targetCount - activeCount;
          
          // Check if we need to spawn an ambulance in this new batch
          // We need one if isEmergency is true AND we don't have one in the current list (activeCars + newly marked ones from step 3)
          const hasAmbulanceNow = newLaneCars.some(c => !c.exiting && c.isAmbulance);
          
          let ambulanceSpawnIndex = -1;
          if (lane.isEmergency && !hasAmbulanceNow) {
              // Pick a random position among the new cars
              ambulanceSpawnIndex = Math.floor(Math.random() * toAdd);
          }

          for (let i = 0; i < toAdd; i++) {
             const newIndex = activeCount + i;
             const isNewAmbulance = (i === ambulanceSpawnIndex);
             
             newLaneCars.push({
               id: `car-${laneId}-${carIdCounter.current++}`,
               index: newIndex,
               exiting: false,
               isAmbulance: isNewAmbulance
             });
          }
        } else if (targetCount < activeCount) {
          // REMOVE CARS (Traffic Flow)
          const toRemove = activeCount - targetCount;
          
          // Identify the 'toRemove' cars with lowest indices to exit
          newLaneCars = newLaneCars.map(c => {
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

        nextState[laneId] = newLaneCars;
      });

      return nextState;
    });
  }, [lanes]);

  // --- CLEANUP LOOP ---
  // Periodically force re-render to remove finished exiting cars from DOM
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


  // --- RENDERING HELPER ---
  const renderLaneCars = (laneId: LaneId, roadOrientation: 'vertical' | 'horizontal') => {
    const cars = visualCars[laneId];
    
    return cars.map(car => (
      <VisualCar
        key={car.id}
        car={car}
        laneId={laneId}
        roadOrientation={roadOrientation}
      />
    ));
  };

  const getLane = (id: string) => lanes.find(l => l.id === id);

  return (
    <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center p-4 sm:p-20">
      
      {/* Roads Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        
        {/* Vertical Road */}
        <div className="w-36 h-full bg-[#1e293b] rounded-md relative overflow-hidden shadow-2xl border-x-4 border-slate-800">
           {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 border-l-2 border-dashed border-amber-500/30"></div>
          {/* Shoulder Lines */}
          <div className="absolute left-1 top-0 bottom-0 w-[1px] bg-white/10"></div>
          <div className="absolute right-1 top-0 bottom-0 w-[1px] bg-white/10"></div>
          
          {/* Stop Lines */}
          <div className="absolute top-[35%] left-0 w-full h-3 bg-slate-400/80 z-0"></div>
          <div className="absolute bottom-[35%] left-0 w-full h-3 bg-slate-400/80 z-0"></div>

          {/* Cars Containers */}
          <div className="absolute top-0 left-0 w-full h-[35%]">{renderLaneCars('lane_1', 'vertical')}</div>
          <div className="absolute bottom-0 left-0 w-full h-[35%]">{renderLaneCars('lane_3', 'vertical')}</div>
        </div>

        {/* Horizontal Road */}
        <div className="absolute w-full h-36 bg-[#1e293b] rounded-md overflow-hidden shadow-2xl border-y-4 border-slate-800">
           {/* Center Line */}
           <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 border-t-2 border-dashed border-amber-500/30"></div>
           {/* Shoulder Lines */}
           <div className="absolute top-1 left-0 right-0 h-[1px] bg-white/10"></div>
           <div className="absolute bottom-1 left-0 right-0 h-[1px] bg-white/10"></div>
           
           {/* Stop Lines */}
           <div className="absolute left-[35%] top-0 h-full w-3 bg-slate-400/80 z-0"></div>
           <div className="absolute right-[35%] top-0 h-full w-3 bg-slate-400/80 z-0"></div>

           {/* Cars Containers */}
           <div className="absolute top-0 left-0 h-full w-[35%]">{renderLaneCars('lane_4', 'horizontal')}</div>
           <div className="absolute top-0 right-0 h-full w-[35%]">{renderLaneCars('lane_2', 'horizontal')}</div>
        </div>
        
        {/* Intersection Junction Box */}
        <div className="absolute w-36 h-36 bg-[#1e293b] z-10 flex items-center justify-center">
             {/* Subtle crosshatch pattern */}
            <div className="w-28 h-28 border border-slate-700/50 relative opacity-30">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,#fff_49%,#fff_51%,transparent_52%)] bg-[size:10px_10px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_48%,#fff_49%,#fff_51%,transparent_52%)] bg-[size:10px_10px]"></div>
            </div>
        </div>
      </div>

      {/* Lane Indicators Overlay */}
      <div className="relative w-40 h-40 z-20 pointer-events-none">
         {getLane('lane_1') && <LaneCard lane={getLane('lane_1')!} position="top" />}
         {getLane('lane_2') && <LaneCard lane={getLane('lane_2')!} position="right" />}
         {getLane('lane_3') && <LaneCard lane={getLane('lane_3')!} position="bottom" />}
         {getLane('lane_4') && <LaneCard lane={getLane('lane_4')!} position="left" />}
      </div>
    </div>
  );
};

export default Intersection;