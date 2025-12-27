# Environment Variables Configuration

⚠️ **SECURITY WARNING:** `VITE_*` environment variables are exposed to the browser! See [SECURITY.md](./SECURITY.md) for best practices.

This document describes the environment variables required for the Vision-Based Traffic Sync application.

## 🔐 Security Overview

**Server-Side Only (Never exposed to browser):**

- `GEMINI_API_KEY` - Used for AI traffic insights (via backend proxy)

**Client-Side (Exposed to browser, but MUST be restricted):**

- `VITE_GOOGLE_MAPS_API_KEY` - Required for Google Maps (Maps API needs client-side key)

**Public by Design (Secured with Firestore Rules):**

- `FIREBASE_*` - Firebase configuration (public by design, security via Firestore Rules)

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

### Server-Side Only (Never exposed to browser)

```env
# Gemini AI API Key (Server-side only - used for AI traffic insights)
# Get your key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Server Configuration
BACKEND_PORT=3001
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANT:** `GEMINI_API_KEY` is **NEVER** sent to the browser. All Gemini API calls go through the backend proxy (`server/index.ts`).

### Client-Side (Exposed to browser - MUST be restricted)

```env
# Google Maps API Key (Client-side required - Maps API needs it in browser)
# ⚠️ SECURITY: This key is exposed to browser, so you MUST restrict it:
# 1. Go to Google Cloud Console → APIs & Services → Credentials
# 2. Click your Maps API key
# 3. Under "Application restrictions" → "HTTP referrers"
# 4. Add: http://localhost:3000/* and https://yourdomain.com/*
# 5. Under "API restrictions" → Enable only "Maps JavaScript API"
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key_here

# OR use a separate key (recommended):
GOOGLE_MAPS_API_KEY=your_maps_api_key_here

# Backend API URL (for frontend to connect to backend proxy)
VITE_BACKEND_URL=http://localhost:3001
```

**Note:** You can use the same key as `GEMINI_API_KEY` for backward compatibility, but it's better to create a separate restricted key for Maps API only.

### Firebase Configuration (Required for incident reporting)

```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

**Note:** These variables use the same format as `GEMINI_API_KEY` (without VITE\_ prefix). Legacy `VITE_FIREBASE_*` variables are still supported for backward compatibility.

## Example .env File

```env
# API Key (Required - Used for both Gemini AI and Google Maps)
GEMINI_API_KEY=AIzaSy...

# Firebase Configuration (Required for incident reporting)
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Important Notes

1. **🔐 Security Architecture**:

   - **GEMINI_API_KEY**: Server-side only (via backend proxy). Never exposed to browser.
   - **VITE_GOOGLE_MAPS_API_KEY**: Client-side required (Maps API limitation), but MUST be restricted in Google Cloud Console.
   - **Firebase Config**: Public by design, but secured with Firestore Rules.

2. **Environment Variable Format**:

   - Server-side variables: `GEMINI_API_KEY`, `BACKEND_PORT`, `FRONTEND_URL` (no VITE\_ prefix)
   - Client-side variables: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_BACKEND_URL` (VITE\_ prefix required)
   - Firebase variables: `FIREBASE_*` (without VITE\_ prefix, but legacy `VITE_FIREBASE_*` supported)

3. **Restart Required**: After changing environment variables, you must restart both frontend and backend servers for changes to take effect.

4. **No Quotes**: Don't put quotes around values in the `.env` file.

5. **No Spaces**: No spaces around the `=` sign.

6. **API Key Restrictions**:
   - Gemini API key is server-side only (secure by design)
   - Maps API key MUST be restricted in Google Cloud Console (see security instructions above)

## Variable Priority

### Gemini API Key (Server-Side Only)

1. `GEMINI_API_KEY` (primary - server-side only, used via backend proxy)

### Google Maps API Key (Client-Side)

1. `VITE_GOOGLE_MAPS_API_KEY` (primary - client-side)
2. `GOOGLE_MAPS_API_KEY` (fallback)
3. `GEMINI_API_KEY` (backward compatibility - not recommended)
4. `VITE_API_KEY` (legacy)

## Troubleshooting

### API Key Not Working

- Verify the API key is correct and has the required permissions enabled
- **Enable both APIs in Google Cloud Console:**
  - "Generative Language API" (for Gemini)
  - "Maps JavaScript API" (for Google Maps)
- Check billing account status
- Restart the dev server after adding/changing variables
- Verify the key is set as `GEMINI_API_KEY` in your `.env` file (not `VITE_GEMINI_API_KEY`)

### Firebase Not Connecting

- Verify all Firebase variables use `FIREBASE_*` format (without VITE\_ prefix) in your `.env` file
- Legacy `VITE_FIREBASE_*` variables are also supported
- Check that variables are in the project root `.env` file
- Ensure Firestore is enabled in Firebase Console
- Verify security rules allow read/write operations
- Restart the dev server after changing Firebase variables
