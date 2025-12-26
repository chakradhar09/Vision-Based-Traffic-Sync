import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { LaneStatus, EmergencyMode } from '../types';

interface TrafficContextType {
  lanes: Record<string, LaneStatus>;
  emergencyMode: EmergencyMode | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  toggleEmergency: (isActive: boolean) => Promise<void>;
  updateLaneStatus: (laneId: string, status: Partial<LaneStatus>) => Promise<void>;
}

const TrafficContext = createContext<TrafficContextType | undefined>(undefined);

export const TrafficProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lanes, setLanes] = useState<Record<string, LaneStatus>>({});
  const [emergencyMode, setEmergencyMode] = useState<EmergencyMode | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    if (!db) {
      // Mock data for demo mode
      const mockLanes: Record<string, LaneStatus> = {
        'lane1': { laneId: 'lane1', status: 'green', secondsRemaining: 45, lastUpdated: Timestamp.now(), emergencyOverride: false },
        'lane2': { laneId: 'lane2', status: 'red', secondsRemaining: 15, lastUpdated: Timestamp.now(), emergencyOverride: false },
        'lane3': { laneId: 'lane3', status: 'red', secondsRemaining: 75, lastUpdated: Timestamp.now(), emergencyOverride: false },
        'lane4': { laneId: 'lane4', status: 'green', secondsRemaining: 30, lastUpdated: Timestamp.now(), emergencyOverride: false },
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
      
      // Initialize lanes if empty (for demo purposes)
      if (snapshot.empty) {
        ['lane1', 'lane2', 'lane3', 'lane4'].forEach(async (laneId) => {
          const initialLane: LaneStatus = {
            laneId,
            status: 'red',
            secondsRemaining: 60,
            lastUpdated: Timestamp.now(),
            emergencyOverride: false
          };
          await setDoc(doc(db, 'lane_stats', laneId), initialLane);
        });
      }
      
      setLanes(newLanes);
      setConnectionStatus('connected');
    }, (error) => {
      console.error("Error fetching lanes:", error);
      setConnectionStatus('disconnected');
    });

    // Subscribe to emergency_mode
    const unsubscribeEmergency = onSnapshot(doc(db, 'emergency_mode', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setEmergencyMode(docSnap.data() as EmergencyMode);
      } else {
        // Initialize if not exists
        const initialEmergency: EmergencyMode = {
          isActive: false,
          activatedBy: 'system',
          activatedAt: Timestamp.now(),
          reason: ''
        };
        setDoc(doc(db, 'emergency_mode', 'global'), initialEmergency);
      }
    });

    return () => {
      unsubscribeLanes();
      unsubscribeEmergency();
    };
  }, []);

  const toggleEmergency = async (isActive: boolean) => {
    if (!db) {
      console.log("Demo mode: Toggling emergency to", isActive);
      setEmergencyMode({ isActive, activatedBy: 'demo', activatedAt: Timestamp.now(), reason: 'demo' });
      const newLanes = { ...lanes };
      Object.keys(newLanes).forEach(key => {
        newLanes[key] = { ...newLanes[key], emergencyOverride: isActive, status: isActive ? 'red' : 'red' };
      });
      setLanes(newLanes);
      return;
    }
    try {
      await updateDoc(doc(db, 'emergency_mode', 'global'), {
        isActive,
        activatedAt: Timestamp.now(),
        activatedBy: 'operator', // In real app, get from auth
        reason: isActive ? 'Manual Override' : ''
      });
      
      // Also update all lanes
      const updates = Object.keys(lanes).map(laneId => 
        updateDoc(doc(db, 'lane_stats', laneId), {
          emergencyOverride: isActive,
          status: isActive ? 'red' : 'red', // Default to red on emergency, or logic to hold
          lastUpdated: Timestamp.now()
        })
      );
      await Promise.all(updates);
    } catch (error) {
      console.error("Error toggling emergency:", error);
    }
  };

  const updateLaneStatus = async (laneId: string, status: Partial<LaneStatus>) => {
    try {
      await updateDoc(doc(db, 'lane_stats', laneId), {
        ...status,
        lastUpdated: Timestamp.now()
      });
    } catch (error) {
      console.error("Error updating lane:", error);
    }
  };

  return (
    <TrafficContext.Provider value={{ lanes, emergencyMode, connectionStatus, toggleEmergency, updateLaneStatus }}>
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
