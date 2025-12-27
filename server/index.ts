/**
 * Backend API Server for Secure API Key Management
 * 
 * This server keeps API keys server-side only, preventing exposure to the browser.
 * All Gemini AI API calls go through this backend proxy.
 * 
 * Run: npm run server (or npm run dev:full for both frontend and backend)
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env file (server-side only)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Support large image uploads

// Get Gemini API key from server-side environment (NOT exposed to client)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('⚠️  WARNING: GEMINI_API_KEY not found in .env file');
  console.error('   The backend will not be able to process Gemini API requests.');
  console.error('   Set GEMINI_API_KEY in your .env file (server-side only, never exposed to browser).');
  console.error('   Get your key from: https://makersuite.google.com/app/apikey');
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ 
    status: 'ok', 
    service: 'traffic-sync-backend',
    hasApiKey: !!GEMINI_API_KEY,
  });
});

/**
 * Generate AI traffic insight
 * POST /api/gemini/insight
 */
app.post('/api/gemini/insight', async (req: express.Request, res: express.Response) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured',
      message: 'GEMINI_API_KEY is missing from server environment',
    });
  }

  try {
    const { lanes } = req.body;

    if (!lanes || !Array.isArray(lanes)) {
      return res.status(400).json({ error: 'Invalid request: lanes array required' });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Prepare traffic data for AI analysis
    const trafficData = lanes.map((lane: any) => ({
      lane: lane.label,
      vehicleCount: lane.vehicleCount,
      status: lane.status,
      isEmergency: lane.isEmergency,
      timer: lane.timer,
    }));

    const totalVehicles = lanes.reduce((sum: number, lane: any) => sum + lane.vehicleCount, 0);
    const hasEmergency = lanes.some((lane: any) => lane.isEmergency);

    const prompt = `You are an intelligent traffic management AI analyzing a 4-way intersection in Hyderabad, India (Hitech City & Gachibowli IT Corridor).

Current Traffic Conditions:
${trafficData.map((d: any) => `- ${d.lane}: ${d.vehicleCount} vehicles, Signal: ${d.status}${d.isEmergency ? ' [EMERGENCY ACTIVE]' : ''}`).join('\n')}

Total vehicles across all lanes: ${totalVehicles}
Emergency situation: ${hasEmergency ? 'Yes' : 'No'}

Analyze the traffic patterns and provide:
1. A brief, actionable insight about current traffic flow
2. Recommendations for commuters (if needed)
3. Any concerns about congestion or optimization opportunities

Keep the response concise (2-3 sentences max), professional, and focused on practical guidance.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ text: prompt }],
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const text = response.text?.trim() || null;

    res.json({ insight: text });
  } catch (error: any) {
    console.error('Gemini insight error:', error);
    res.status(500).json({ 
      error: 'Failed to generate insight',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Calculate best route using AI
 * POST /api/gemini/route
 */
app.post('/api/gemini/route', async (req: express.Request, res: express.Response) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured',
      message: 'GEMINI_API_KEY is missing from server environment',
    });
  }

  try {
    const { lanes } = req.body;

    if (!lanes || !Array.isArray(lanes)) {
      return res.status(400).json({ error: 'Invalid request: lanes array required' });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const routeData = lanes.map((lane: any) => ({
      route: lane.label,
      vehicleCount: lane.vehicleCount,
      congestionLevel: lane.vehicleCount < 10 ? 'Low' : lane.vehicleCount < 30 ? 'Medium' : 'High',
      signalStatus: lane.status,
      isEmergency: lane.isEmergency,
    }));

    const prompt = `You are a route optimization AI for Hyderabad traffic management.

Available Routes:
${routeData.map((d: any) => `- ${d.route}: ${d.vehicleCount} vehicles (${d.congestionLevel} congestion), Signal: ${d.signalStatus}${d.isEmergency ? ' [EMERGENCY]' : ''}`).join('\n')}

Analyze the current traffic conditions and recommend the BEST route for commuters. 
Consider:
- Vehicle density (lower is better)
- Signal status (green is preferable)
- Emergency situations (avoid emergency corridors)
- Overall traffic flow

Respond with ONLY the route name (e.g., "Hitech City Main Rd" or "Gachibowli Flyover") - no explanation, just the route name.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ text: prompt }],
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const text = response.text?.trim() || null;

    if (!text) {
      return res.json({ route: null });
    }

    // Extract route name (clean up response)
    const routeName = text.replace(/^["']|["']$/g, '').trim();

    // Validate that it's one of the actual lane labels
    const validRoutes = lanes.map((l: any) => l.label);
    let matchedRoute = null;

    if (validRoutes.includes(routeName)) {
      matchedRoute = routeName;
    } else {
      // If AI returned something else, try to match part of it
      matchedRoute = validRoutes.find((route: string) =>
        routeName.toLowerCase().includes(route.toLowerCase()) ||
        route.toLowerCase().includes(routeName.toLowerCase())
      ) || null;
    }

    res.json({ route: matchedRoute });
  } catch (error: any) {
    console.error('Gemini route error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate route',
      message: error.message || 'Unknown error',
    });
  }
});

/**
 * Analyze lane image (for image upload feature)
 * POST /api/gemini/analyze-image
 */
app.post('/api/gemini/analyze-image', async (req: express.Request, res: express.Response) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured',
      message: 'GEMINI_API_KEY is missing from server environment',
    });
  }

  try {
    const { base64Image, laneLabel } = req.body;

    if (!base64Image || !laneLabel) {
      return res.status(400).json({ error: 'Invalid request: base64Image and laneLabel required' });
    }

    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const imageData = base64Image.includes(',') 
      ? base64Image.split(',')[1] 
      : base64Image;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const SYSTEM_INSTRUCTION = `
You are an advanced Traffic Control AI Agent monitoring a single lane feed.
Your job is to analyze the image from one specific camera at a 4-way intersection.

1.  **Count** the number of motorized vehicles waiting in the queue for this specific lane view.
2.  **Identify** if there are any active emergency vehicles (Ambulance, Fire Truck, Police) with flashing lights in this lane.

Return the data in a strict JSON format.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageData,
            },
          },
          {
            text: `Analyze this traffic camera feed for the ${laneLabel}. Count visible waiting vehicles and check for emergencies.`,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vehicleCount: { type: Type.INTEGER, description: 'Number of vehicles in the queue' },
            emergency: { type: Type.BOOLEAN, description: 'True if emergency vehicle detected' },
            emergencyType: {
              type: Type.STRING,
              enum: ['Ambulance', 'Fire Truck', 'Police', 'None'],
              description: 'Type of emergency vehicle if present',
            },
          },
          required: ['vehicleCount', 'emergency'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from AI');
    }

    const data = JSON.parse(text);

    res.json({
      vehicleCount: data.vehicleCount || 0,
      emergency: data.emergency || false,
      emergencyType: data.emergencyType === 'None' ? null : data.emergencyType,
    });
  } catch (error: any) {
    console.error('Gemini image analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      message: error.message || 'Unknown error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/gemini/insight`);
  console.log(`   - POST /api/gemini/route`);
  console.log(`   - POST /api/gemini/analyze-image`);
  console.log(`\n🔐 API Key Status: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
});

