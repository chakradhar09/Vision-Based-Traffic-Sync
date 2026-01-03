/**
 * Backend API Proxy for Gemini API
 * 
 * This is a template for creating a backend proxy to protect your Gemini API key.
 * 
 * Implementation options:
 * 1. Vite proxy (for development)
 * 2. Express.js server (for production)
 * 3. Serverless function (Vercel, Netlify, etc.)
 * 
 * This file shows the structure - you'll need to implement the actual backend.
 */

// Example: Vite Proxy Configuration (add to vite.config.ts)
/*
export default defineConfig({
  server: {
    proxy: {
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, '/v1beta/models/gemini-1.5-flash:generateContent'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Add your Gemini API key here (from server-side env, not VITE_*)
            const apiKey = process.env.GEMINI_API_KEY; // Server-side only!
            if (apiKey) {
              proxyReq.setHeader('x-goog-api-key', apiKey);
            }
          });
        },
      },
    },
  },
});
*/

// Example: Express.js Implementation
/*
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, model = 'gemini-1.5-flash' } = req.body;
    
    // API key from server-side environment (NOT VITE_*)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }],
    });

    res.json({ text: response.text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(3001, () => {
  console.log('Backend proxy running on port 3001');
});
*/

// Example: Frontend Service Update (use this in aiTrafficService.ts)
/*
export async function generateAITrafficInsight(lanes: LaneStatus[]): Promise<string | null> {
  try {
    const trafficData = lanes.map(lane => ({
      lane: lane.label,
      vehicleCount: lane.vehicleCount,
      status: lane.status,
      isEmergency: lane.isEmergency,
      timer: lane.timer
    }));

    const prompt = `...`; // Your prompt here

    // Call backend proxy instead of direct API
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model: 'gemini-1.5-flash' }),
    });

    if (!response.ok) {
      throw new Error('Backend proxy error');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    logger.error("AI traffic insight generation failed", error);
    return null;
  }
}
*/

export {}; // Make this a module




