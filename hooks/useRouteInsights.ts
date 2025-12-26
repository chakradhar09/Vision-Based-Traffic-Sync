import { useEffect } from 'react';
import React from 'react';
import { LaneStatus } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';
import { calculateBestRoute, generateTrafficInsight } from '../utils/trafficAnalysis';

/**
 * Hook to calculate best route and generate AI insights
 */
export function useRouteInsights(
  lanes: LaneStatus[],
  setBestRoute: React.Dispatch<React.SetStateAction<string>>,
  setGeminiInsight: React.Dispatch<React.SetStateAction<string>>
) {
  useEffect(() => {
    const interval = setInterval(() => {
      setBestRoute(calculateBestRoute(lanes));
      setGeminiInsight(generateTrafficInsight(lanes));
    }, TRAFFIC_CONFIG.ROUTE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [lanes, setBestRoute, setGeminiInsight]);
}

