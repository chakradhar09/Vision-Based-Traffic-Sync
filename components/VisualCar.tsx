import React from 'react';
import { LaneId } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';

interface VisualCarProps {
  car: {
    id: string;
    index: number;
    exiting: boolean;
    exitingAt?: number;
    isAmbulance: boolean;
  };
  laneId: LaneId;
  roadOrientation: 'vertical' | 'horizontal';
}

export const VisualCar: React.FC<VisualCarProps> = ({
  car,
  laneId,
  roadOrientation,
}) => {
  const isAmbulance = car.isAmbulance;
  const opacity = car.exiting ? 0 : 1;

  // Dimensions
  const carW =
    roadOrientation === 'vertical'
      ? isAmbulance
        ? '16px'
        : '12px'
      : isAmbulance
        ? '28px'
        : '22px';
  const carH =
    roadOrientation === 'vertical'
      ? isAmbulance
        ? '28px'
        : '22px'
      : isAmbulance
        ? '16px'
        : '12px';

  const style: React.CSSProperties = {
    width: carW,
    height: carH,
    opacity: opacity,
    transition: 'all 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    position: 'absolute',
  };

  // Positioning Logic
  const carPosition = car.exiting
    ? -TRAFFIC_CONFIG.CAR_EXIT_OFFSET
    : TRAFFIC_CONFIG.CAR_STOP_LINE_OFFSET + car.index * TRAFFIC_CONFIG.CAR_SPACING;

  if (laneId === 'lane_1') {
    // Top, facing down
    style.left = '25%';
    style.transform = 'translateX(-50%)';
    style.bottom = `${carPosition}px`;
    style.zIndex = car.exiting ? 5 : 10 + (10 - car.index);
  } else if (laneId === 'lane_3') {
    // Bottom, facing up
    style.right = '25%';
    style.transform = 'translateX(50%)';
    style.top = `${carPosition}px`;
    style.zIndex = car.exiting ? 5 : 10 + (10 - car.index);
  } else if (laneId === 'lane_4') {
    // Left, facing right
    style.bottom = '25%';
    style.transform = 'translateY(50%)';
    style.right = `${carPosition}px`;
    style.zIndex = car.exiting ? 5 : 10 + (10 - car.index);
  } else if (laneId === 'lane_2') {
    // Right, facing left
    style.top = '25%';
    style.transform = 'translateY(-50%)';
    style.left = `${carPosition}px`;
    style.zIndex = car.exiting ? 5 : 10 + (10 - car.index);
  }

  return (
    <div
      style={style}
      className={`rounded-[3px] flex items-center justify-center relative ${
        isAmbulance
          ? 'bg-slate-100 border border-slate-300 shadow-xl'
          : 'bg-slate-300 shadow-lg shadow-black/60'
      }`}
    >
      {isAmbulance && (
        <AmbulanceVisuals laneId={laneId} roadOrientation={roadOrientation} />
      )}
      {!isAmbulance && (
        <StandardCarVisuals laneId={laneId} roadOrientation={roadOrientation} />
      )}
    </div>
  );
};

const AmbulanceVisuals: React.FC<{
  laneId: LaneId;
  roadOrientation: 'vertical' | 'horizontal';
}> = ({ laneId, roadOrientation }) => {
  return (
    <>
      {/* Intense Ground Glow/Halo */}
      <div className="absolute -inset-3 rounded-full bg-red-500/20 animate-[pulse_0.4s_cubic-bezier(0.4,0,0.6,1)_infinite] z-0 pointer-events-none mix-blend-screen blur-[2px]"></div>

      {/* Roof Light Bar */}
      {roadOrientation === 'vertical' ? (
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[3px] bg-slate-800 z-30 flex rounded-full overflow-hidden ring-[0.5px] ring-black/50">
          <div className="flex-1 bg-red-600 animate-[pulse_0.15s_steps(2)_infinite] shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
          <div className="w-[1px] bg-black"></div>
          <div className="flex-1 bg-blue-600 animate-[pulse_0.15s_steps(2)_infinite_0.075s] shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
        </div>
      ) : (
        <div className="absolute left-[20%] top-1/2 -translate-y-1/2 h-[80%] w-[3px] bg-slate-800 z-30 flex flex-col rounded-full overflow-hidden ring-[0.5px] ring-black/50">
          <div className="flex-1 bg-red-600 animate-[pulse_0.15s_steps(2)_infinite] shadow-[0_0_8px_rgba(239,68,68,1)]"></div>
          <div className="h-[1px] bg-black"></div>
          <div className="flex-1 bg-blue-600 animate-[pulse_0.15s_steps(2)_infinite_0.075s] shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
        </div>
      )}

      {/* Red Cross Symbol */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 opacity-90 z-20 ${
          roadOrientation === 'vertical' ? 'w-[3px] h-[55%]' : 'h-[3px] w-[55%]'
        }`}
      ></div>
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 opacity-90 z-20 ${
          roadOrientation === 'vertical' ? 'h-[3px] w-[55%]' : 'w-[3px] h-[55%]'
        }`}
      ></div>

      {/* Wig-Wag Headlights */}
      <AmbulanceHeadlights laneId={laneId} />
    </>
  );
};

const AmbulanceHeadlights: React.FC<{ laneId: LaneId }> = ({ laneId }) => {
  const headlightSize = 'w-[2px] h-[2px] rounded-full bg-white shadow-[0_0_6px_white]';
  const anim1 = 'animate-[pulse_0.25s_steps(2)_infinite]';
  const anim2 = 'animate-[pulse_0.25s_steps(2)_infinite_0.125s]';

  if (laneId === 'lane_1') {
    // Facing Down (Front is Bottom)
    return (
      <div className="absolute bottom-[0.5px] w-full flex justify-between px-[2px] z-20">
        <div className={`${headlightSize} ${anim1}`}></div>
        <div className={`${headlightSize} ${anim2}`}></div>
      </div>
    );
  }
  if (laneId === 'lane_3') {
    // Facing Up (Front is Top)
    return (
      <div className="absolute top-[0.5px] w-full flex justify-between px-[2px] z-20">
        <div className={`${headlightSize} ${anim1}`}></div>
        <div className={`${headlightSize} ${anim2}`}></div>
      </div>
    );
  }
  if (laneId === 'lane_4') {
    // Facing Right (Front is Right)
    return (
      <div className="absolute right-[0.5px] h-full flex flex-col justify-between py-[2px] z-20">
        <div className={`${headlightSize} ${anim1}`}></div>
        <div className={`${headlightSize} ${anim2}`}></div>
      </div>
    );
  }
  if (laneId === 'lane_2') {
    // Facing Left (Front is Left)
    return (
      <div className="absolute left-[0.5px] h-full flex flex-col justify-between py-[2px] z-20">
        <div className={`${headlightSize} ${anim1}`}></div>
        <div className={`${headlightSize} ${anim2}`}></div>
      </div>
    );
  }
  return null;
};

const StandardCarVisuals: React.FC<{
  laneId: LaneId;
  roadOrientation: 'vertical' | 'horizontal';
}> = ({ laneId, roadOrientation }) => {
  return (
    <>
      {/* Car body details */}
      <div className="relative w-full h-full opacity-80 mix-blend-multiply pointer-events-none">
        {roadOrientation === 'vertical' ? (
          <>
            <div
              className={`absolute left-[1px] right-[1px] h-[3px] bg-slate-800 ${
                laneId === 'lane_1' ? 'bottom-[3px]' : 'top-[3px]'
              }`}
            ></div>
            <div
              className={`absolute left-[1px] right-[1px] h-[3px] bg-slate-800 ${
                laneId === 'lane_1' ? 'top-[3px]' : 'bottom-[3px]'
              }`}
            ></div>
          </>
        ) : (
          <>
            <div
              className={`absolute top-[1px] bottom-[1px] w-[3px] bg-slate-800 ${
                laneId === 'lane_4' ? 'left-[3px]' : 'right-[3px]'
              }`}
            ></div>
            <div
              className={`absolute top-[1px] bottom-[1px] w-[3px] bg-slate-800 ${
                laneId === 'lane_4' ? 'right-[3px]' : 'left-[3px]'
              }`}
            ></div>
          </>
        )}
      </div>

      {/* Headlights/Taillights */}
      {roadOrientation === 'vertical' && (
        <div
          className={`w-full flex justify-between px-[1px] ${
            laneId === 'lane_1' ? 'absolute bottom-0' : 'absolute top-0'
          }`}
        >
          <div
            className={`w-[2px] h-[2px] ${
              laneId === 'lane_1'
                ? 'bg-amber-200 shadow-[0_0_2px_#fde68a]'
                : 'bg-red-500 shadow-[0_0_2px_#ef4444]'
            }`}
          ></div>
          <div
            className={`w-[2px] h-[2px] ${
              laneId === 'lane_1'
                ? 'bg-amber-200 shadow-[0_0_2px_#fde68a]'
                : 'bg-red-500 shadow-[0_0_2px_#ef4444]'
            }`}
          ></div>
        </div>
      )}
      {roadOrientation === 'horizontal' && (
        <div
          className={`h-full flex flex-col justify-between py-[1px] ${
            laneId === 'lane_4' ? 'absolute right-0' : 'absolute left-0'
          }`}
        >
          <div
            className={`w-[2px] h-[2px] ${
              laneId === 'lane_4'
                ? 'bg-amber-200 shadow-[0_0_2px_#fde68a]'
                : 'bg-red-500 shadow-[0_0_2px_#ef4444]'
            }`}
          ></div>
          <div
            className={`w-[2px] h-[2px] ${
              laneId === 'lane_4'
                ? 'bg-amber-200 shadow-[0_0_2px_#fde68a]'
                : 'bg-red-500 shadow-[0_0_2px_#ef4444]'
            }`}
          ></div>
        </div>
      )}
    </>
  );
};

