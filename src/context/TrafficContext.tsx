import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, doc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { LaneStatus, NextIntersection } from '../types';
import { logger } from '../utils/logger';

interface TrafficContextType {
  lanes: Record<string, LaneStatus>;
  nextIntersection: NextIntersection | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  toggleEmergency: (isActive: boolean) => Promise<void>;
  updateLaneStatus: (laneId: string, status: Partial<LaneStatus>) => Promise<void>;
}

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export const TrafficProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lanes, setLanes] = useState<Record<string, LaneStatus>>({});
  const [nextIntersection, setNextIntersection] = useState<NextIntersection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const initializingRef = useRef(false);

  useEffect(() => {
    if (!db) {
      // Mock data for demo mode
      const mockLanes: Record<string, LaneStatus> = {
        'lane_1': { 
          lane_id: 'lane_1', 
          current_timer: 45, 
          vehicle_count: 12, 
          emergency_detected: false, 
          traffic_light_state: 'green', 
          last_updated: Timestamp.now(), 
          next_intersection_cleared: false 
        },
        'lane_2': { 
          lane_id: 'lane_2', 
          current_timer: 0, 
          vehicle_count: 8, 
          emergency_detected: false, 
          traffic_light_state: 'red', 
          last_updated: Timestamp.now(), 
          next_intersection_cleared: false 
        },
        'lane_3': { 
          lane_id: 'lane_3', 
          current_timer: 0, 
          vehicle_count: 15, 
          emergency_detected: false, 
          traffic_light_state: 'red', 
          last_updated: Timestamp.now(), 
          next_intersection_cleared: false 
        },
        'lane_4': { 
          lane_id: 'lane_4', 
          current_timer: 0, 
          vehicle_count: 5, 
          emergency_detected: false, 
          traffic_light_state: 'red', 
          last_updated: Timestamp.now(), 
          next_intersection_cleared: false 
        },
      };
      setLanes(mockLanes);
      setConnectionStatus('connected'); // Pretend connected for demo
      return;
    }

    // Subscribe to lane_stats
    const unsubscribeLanes = onSnapshot(collection(db, 'lane_stats'), (snapshot) => {
      const newLanes: Record<string, LaneStatus> = {};
      snapshot.forEach((doc) => {
        newLanes[doc.id] = doc.data() as LaneStatus;
      });
      
      // Initialize lanes if empty and not already initializing
      if (snapshot.empty && !initializingRef.current) {
        initializingRef.current = true;
        const laneIds = ['lane_1', 'lane_2', 'lane_3', 'lane_4'];
        const initPromises = laneIds.map(async (laneId) => {
          const initialLane: LaneStatus = {
            lane_id: laneId,
            current_timer: 60,
            vehicle_count: 0,
            emergency_detected: false,
            traffic_light_state: 'red',
            last_updated: Timestamp.now(),
            next_intersection_cleared: false
          };
          await setDoc(doc(db, 'lane_stats', laneId), initialLane);
        });
        // Fire and forget - errors handled by Firestore listener
        Promise.all(initPromises)
          .then(() => { initializingRef.current = false; })
          .catch((error) => {
            logger.error("Error initializing lanes", error);
            initializingRef.current = false;
          });
      }
      
      setLanes(newLanes);
      setConnectionStatus('connected');
    }, (error) => {
      logger.error("Error fetching lanes", error);
      setConnectionStatus('disconnected');
    });

    // Subscribe to next_intersection
    const unsubscribeNext = onSnapshot(doc(db, 'next_intersection', 'intersection_1'), (docSnap) => {
      if (docSnap.exists()) {
        setNextIntersection(docSnap.data() as NextIntersection);
      }
    }, (error) => {
      logger.error("Error fetching next_intersection", error);
    });

    return () => {
      unsubscribeLanes();
      unsubscribeNext();
    };
  }, []);

  const toggleEmergency = async (isActive: boolean) => {
    if (!db) {
      logger.info("Demo mode: Toggling emergency", { isActive });
      const newLanes = { ...lanes };
      Object.keys(newLanes).forEach(key => {
        newLanes[key] = { 
          ...newLanes[key], 
          emergency_detected: isActive, 
          traffic_light_state: isActive ? 'red' : newLanes[key].traffic_light_state 
        };
      });
      setLanes(newLanes);
      return;
    }
    
    // In real implementation, this would likely trigger a cloud function or update a config doc
    // For now, we update local lanes to simulate immediate feedback
    try {
      const laneIds = Object.keys(lanes);
      if (laneIds.length === 0) {
        throw new Error("No lanes available to update");
      }
      
      const updates = laneIds.map(laneId => 
        updateDoc(doc(db, 'lane_stats', laneId), {
          emergency_detected: isActive,
          traffic_light_state: isActive ? 'red' : lanes[laneId]?.traffic_light_state || 'red',
          last_updated: Timestamp.now()
        })
      );
      await Promise.all(updates);
      logger.info("Emergency mode toggled", { isActive, laneCount: laneIds.length });
    } catch (error) {
      logger.error("Error toggling emergency", error, { isActive });
      throw error; // Re-throw to allow caller to handle
    }
  };

  const updateLaneStatus = async (laneId: string, status: Partial<LaneStatus>) => {
    if (!db) {
      throw new Error("Database not initialized");
    }
    if (!laneId || typeof laneId !== 'string') {
      throw new Error("Invalid lane ID");
    }
    
    try {
      await updateDoc(doc(db, 'lane_stats', laneId), {
        ...status,
        last_updated: Timestamp.now()
      });
      logger.debug("Lane status updated", { laneId, status });
    } catch (error) {
      logger.error("Error updating lane", error, { laneId });
      throw error; // Re-throw to allow caller to handle
    }
  };

  return (
    <TrafficContext.Provider value={{ lanes, nextIntersection, connectionStatus, toggleEmergency, updateLaneStatus }}>
      {children}
    </TrafficContext.Provider>
  );
};

export const useTraffic = () => {
  const context = useContext(TrafficContext);
  if (context === undefined) {
    throw new Error('useTraffic must be used within a TrafficProvider');
  }
  return context;
};
