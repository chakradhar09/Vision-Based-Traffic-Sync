import { GoogleGenAI, Type } from "@google/genai";
import { SingleLaneAnalysisResult, LaneStatus, LaneId } from "../types";
import { TRAFFIC_CONFIG, calculateGreenTime } from "../config/trafficConfig";

const SYSTEM_INSTRUCTION = `
You are an advanced Traffic Control AI Agent monitoring a single lane feed.
Your job is to analyze the image from one specific camera at a 4-way intersection.

1.  **Count** the number of motorized vehicles waiting in the queue for this specific lane view.
2.  **Identify** if there are any active emergency vehicles (Ambulance, Fire Truck, Police) with flashing lights in this lane.

Return the data in a strict JSON format.
`;

export const analyzeLaneImage = async (base64Image: string, laneLabel: string): Promise<SingleLaneAnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this traffic camera feed for the ${laneLabel}. Count visible waiting vehicles and check for emergencies.`,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vehicleCount: { type: Type.INTEGER, description: "Number of vehicles in the queue" },
            emergency: { type: Type.BOOLEAN, description: "True if emergency vehicle detected" },
            emergencyType: { 
              type: Type.STRING, 
              enum: ["Ambulance", "Fire Truck", "Police", "None"],
              description: "Type of emergency vehicle if present" 
            },
          },
          required: ["vehicleCount", "emergency"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    return {
      vehicleCount: data.vehicleCount || 0,
      emergency: data.emergency || false,
      emergencyType: data.emergencyType === "None" ? null : data.emergencyType,
    };

  } catch (error) {
    console.error("Lane analysis failed:", error);
    throw error;
  }
};

export const calculateTrafficTimings = (currentLanes: LaneStatus[]): Record<LaneId, { status: 'red' | 'green', timer: number }> => {
  const timings: Record<LaneId, { status: 'red' | 'green', timer: number }> = {
    lane_1: { status: 'red', timer: 0 },
    lane_2: { status: 'red', timer: 0 },
    lane_3: { status: 'red', timer: 0 },
    lane_4: { status: 'red', timer: 0 },
  };

  // 1. Check for Emergency Priority
  const emergencyLane = currentLanes.find(l => l.isEmergency);

  if (emergencyLane) {
    // Grant Green to emergency lane immediately
    currentLanes.forEach(lane => {
      if (lane.id === emergencyLane.id) {
        timings[lane.id] = { status: 'green', timer: TRAFFIC_CONFIG.EMERGENCY_GREEN_TIME };
      } else {
        timings[lane.id] = { status: 'red', timer: 0 };
      }
    });
    return timings;
  }

  // 2. Standard Density-Based Priority (Green Wave)
  // Find the lane with the highest vehicle count
  const sortedLanes = [...currentLanes].sort((a, b) => b.vehicleCount - a.vehicleCount);
  const priorityLane = sortedLanes[0];

  // If even the busiest lane has 0 cars, default to Lane 1
  if (priorityLane.vehicleCount === 0) {
    timings['lane_1'] = { status: 'green', timer: TRAFFIC_CONFIG.DEFAULT_EMPTY_TIMER };
    return timings;
  }

  currentLanes.forEach(lane => {
    if (lane.id === priorityLane.id) {
      timings[lane.id] = { status: 'green', timer: calculateGreenTime(lane.vehicleCount) };
    } else {
      timings[lane.id] = { status: 'red', timer: 0 };
    }
  });
  
  return timings;
};
