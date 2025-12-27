import { LaneStatus } from "../types";
import { logger } from "../utils/logger";

/**
 * Backend API URL - points to secure backend server
 * API keys are kept server-side only, never exposed to browser
 */
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Generate AI-powered traffic insights using backend proxy
 * API key is kept server-side, never exposed to browser
 */
export async function generateAITrafficInsight(lanes: LaneStatus[]): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/gemini/insight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lanes }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    return data.insight || null;
  } catch (error) {
    logger.error("AI traffic insight generation failed", error, {
      component: 'aiTrafficService',
      function: 'generateAITrafficInsight',
    });
    return null;
  }
}

/**
 * Calculate best route using AI analysis via backend proxy
 * API key is kept server-side, never exposed to browser
 */
export async function calculateAIBestRoute(lanes: LaneStatus[]): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/gemini/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lanes }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    return data.route || null;
  } catch (error) {
    logger.error("AI route calculation failed", error, {
      component: 'aiTrafficService',
      function: 'calculateAIBestRoute',
    });
    return null;
  }
}

