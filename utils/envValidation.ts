/**
 * Environment Variable Validation Utilities
 * 
 * Provides validation and helpful error messages for missing environment variables
 */

/**
 * Validates that required server-side environment variables are set
 * This should be called at server startup
 */
export function validateServerEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Server-side only variables (should NOT be VITE_*)
  if (!process.env.GEMINI_API_KEY) {
    errors.push(
      'GEMINI_API_KEY is missing. This is required for AI traffic insights.\n' +
      '  Set it in your .env file (server-side only, never exposed to browser).'
    );
  }

  // Optional server configuration
  const backendPort = process.env.BACKEND_PORT || '3001';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Validates client-side environment variables (for development warnings)
 * Note: These are exposed to browser, so they should be restricted in Google Cloud Console
 */
export function validateClientEnv(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check Maps API key (client-side, but should be restricted)
  const mapsApiKey = 
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    (typeof process !== 'undefined' && process.env?.VITE_GOOGLE_MAPS_API_KEY) ||
    '';

  if (!mapsApiKey) {
    warnings.push(
      'VITE_GOOGLE_MAPS_API_KEY is missing. Google Maps will not work.\n' +
      '  ⚠️ SECURITY: Maps API key is exposed to browser, so you MUST restrict it in Google Cloud Console:\n' +
      '  1. Go to Google Cloud Console → APIs & Services → Credentials\n' +
      '  2. Click your Maps API key\n' +
      '  3. Under "Application restrictions" → "HTTP referrers"\n' +
      '  4. Add: http://localhost:3000/* and https://yourdomain.com/*\n' +
      '  5. Under "API restrictions" → Enable only "Maps JavaScript API"'
    );
  }

  // Check backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  if (!backendUrl) {
    warnings.push('VITE_BACKEND_URL is missing. Defaulting to http://localhost:3001');
  }

  // Firebase is optional (app works in demo mode without it)
  const hasFirebase = 
    (import.meta.env.VITE_FIREBASE_API_KEY || 
     (typeof process !== 'undefined' && process.env?.FIREBASE_API_KEY)) &&
    (import.meta.env.VITE_FIREBASE_PROJECT_ID ||
     (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID));

  if (!hasFirebase) {
    warnings.push(
      'Firebase configuration not found. Incident reporting will work in demo mode only.\n' +
      '  Set FIREBASE_* variables in .env to enable persistent incident reports.'
    );
  }

  return { 
    valid: warnings.filter(w => w.includes('missing')).length === 0, 
    warnings 
  };
}

/**
 * Logs environment variable status (for debugging)
 */
export function logEnvStatus(): void {
  if (typeof window === 'undefined') {
    // Server-side
    const serverValidation = validateServerEnv();
    if (!serverValidation.valid) {
      console.error('❌ Server Environment Validation Failed:');
      serverValidation.errors.forEach(err => console.error('  -', err));
    } else {
      console.log('✅ Server environment variables validated');
    }
  } else {
    // Client-side
    const clientValidation = validateClientEnv();
    if (clientValidation.warnings.length > 0) {
      console.warn('⚠️ Client Environment Warnings:');
      clientValidation.warnings.forEach(warn => console.warn('  -', warn));
    }
  }
}




