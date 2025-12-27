import { GoogleGenAI } from "@google/genai";
import { LaneStatus } from "../types";
import { logger } from "../utils/logger";

/**
 * Get Gemini AI instance
 */
function getGeminiAI(): GoogleGenAI | null {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn("Gemini API key not found. Falling back to rule-based logic.", {
        component: 'aiTrafficService',
        function: 'getGeminiAI',
      });
      return null;
    }
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    logger.error("Failed to initialize Gemini AI", error, {
      component: 'aiTrafficService',
      function: 'getGeminiAI',
    });
    return null;
  }
}

/**
 * Generate AI-powered traffic insights using Gemini
 */
export async function generateAITrafficInsight(lanes: LaneStatus[]): Promise<string | null> {
  const ai = getGeminiAI();
  if (!ai) return null;

  try {
    // Prepare traffic data for AI analysis
    const trafficData = lanes.map(lane => ({
      lane: lane.label,
      vehicleCount: lane.vehicleCount,
      status: lane.status,
      isEmergency: lane.isEmergency,
      timer: lane.timer
    }));

    const totalVehicles = lanes.reduce((sum, lane) => sum + lane.vehicleCount, 0);
    const hasEmergency = lanes.some(lane => lane.isEmergency);

    const prompt = `You are an intelligent traffic management AI analyzing a 4-way intersection in Hyderabad, India (Hitech City & Gachibowli IT Corridor).

Current Traffic Conditions:
${trafficData.map(d => `- ${d.lane}: ${d.vehicleCount} vehicles, Signal: ${d.status}${d.isEmergency ? ' [EMERGENCY ACTIVE]' : ''}`).join('\n')}

Total vehicles across all lanes: ${totalVehicles}
Emergency situation: ${hasEmergency ? 'Yes' : 'No'}

Analyze the traffic patterns and provide:
1. A brief, actionable insight about current traffic flow
2. Recommendations for commuters (if needed)
3. Any concerns about congestion or optimization opportunities

Keep the response concise (2-3 sentences max), professional, and focused on practical guidance.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ text: prompt }],
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const text = response.text;
    if (!text) return null;

    return text.trim();
  } catch (error) {
    logger.error("AI traffic insight generation failed", error, {
      component: 'aiTrafficService',
      function: 'generateAITrafficInsight',
    });
    return null;
  }
}

/**
 * Calculate best route using AI analysis
 */
export async function calculateAIBestRoute(lanes: LaneStatus[]): Promise<string | null> {
  const ai = getGeminiAI();
  if (!ai) return null;

  try {
    // Prepare route data
    const routeData = lanes.map(lane => ({
      route: lane.label,
      vehicleCount: lane.vehicleCount,
      congestionLevel: lane.vehicleCount < 10 ? 'Low' : lane.vehicleCount < 30 ? 'Medium' : 'High',
      signalStatus: lane.status,
      isEmergency: lane.isEmergency
    }));

    const prompt = `You are a route optimization AI for Hyderabad traffic management.

Available Routes:
${routeData.map(d => `- ${d.route}: ${d.vehicleCount} vehicles (${d.congestionLevel} congestion), Signal: ${d.signalStatus}${d.isEmergency ? ' [EMERGENCY]' : ''}`).join('\n')}

Analyze the current traffic conditions and recommend the BEST route for commuters. 
Consider:
- Vehicle density (lower is better)
- Signal status (green is preferable)
- Emergency situations (avoid emergency corridors)
- Overall traffic flow

Respond with ONLY the route name (e.g., "Hitech City Main Rd" or "Gachibowli Flyover") - no explanation, just the route name.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ text: prompt }],
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const text = response.text;
    if (!text) return null;

    // Extract route name (clean up response)
    const routeName = text.trim().replace(/^["']|["']$/g, '').trim();
    
    // Validate that it's one of the actual lane labels
    const validRoutes = lanes.map(l => l.label);
    if (validRoutes.includes(routeName)) {
      return routeName;
    }
    
    // If AI returned something else, try to match part of it
    const matchedRoute = validRoutes.find(route => 
      routeName.toLowerCase().includes(route.toLowerCase()) || 
      route.toLowerCase().includes(routeName.toLowerCase())
    );
    
    return matchedRoute || null;
  } catch (error) {
    logger.error("AI route calculation failed", error, {
      component: 'aiTrafficService',
      function: 'calculateAIBestRoute',
    });
    return null;
  }
}

