import { useEffect, useRef } from 'react';
import React from 'react';
import { LaneStatus } from '../types';
import { TRAFFIC_CONFIG } from '../config/trafficConfig';
import { calculateBestRoute, generateTrafficInsight } from '../utils/trafficAnalysis';
import { logger } from '../utils/logger';

/**
 * Hook to calculate best route and generate AI insights
 */
export function useRouteInsights(
  lanes: LaneStatus[],
  setBestRoute: React.Dispatch<React.SetStateAction<string>>,
  setGeminiInsight: React.Dispatch<React.SetStateAction<string>>
) {
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const updateInsights = async () => {
      // Prevent overlapping calls
      if (isProcessingRef.current) return;
      
      isProcessingRef.current = true;
      
      try {
        // Run both AI calls in parallel for better performance
        const [bestRoute, insight] = await Promise.all([
          calculateBestRoute(lanes),
          generateTrafficInsight(lanes)
        ]);
        
        setBestRoute(bestRoute);
        setGeminiInsight(insight);
      } catch (error) {
        logger.error('Error updating route insights', error, {
          component: 'useRouteInsights',
          function: 'updateInsights',
        });
        // Set fallback values on error
        const bestLane = [...lanes].sort((a, b) => a.vehicleCount - b.vehicleCount)[0];
        setBestRoute(bestLane.label);
        setGeminiInsight('Traffic monitoring active. Analyzing patterns...');
      } finally {
        isProcessingRef.current = false;
      }
    };

    // Initial call
    updateInsights();

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      updateInsights();
    }, TRAFFIC_CONFIG.ROUTE_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [lanes, setBestRoute, setGeminiInsight]);
}

