# How to Verify Firebase Setup

## Quick Verification Steps

### 1. Check Environment Variables

Make sure your `.env.local` file exists and contains all required variables with `VITE_` prefix:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Important:**

- Variables MUST start with `VITE_` prefix
- No quotes around values
- No spaces around `=`
- Restart dev server after changing `.env.local`

### 2. Check System Logs on App Start

1. Start the app: `npm run dev`
2. Look at the "GHMC Grid Log" panel in the Control Panel
3. You should see one of these messages:

   ✅ **Success:** `✅ Firebase connected. Incident reports will be saved to database.`

   ⚠️ **Demo Mode:** `⚠️ Firebase not configured. Running in demo mode (reports logged locally only).`

### 3. Test Incident Reporting

1. Click on a lane in the Control Panel
2. Click either "Accident" or "Road Work" button in the "Citizen Reporting" section
3. Check the system logs - you should see:
   ```
   USER REPORT: Citizen reported [type] on [lane]. Alerting TSRTC.
   ```
4. Open browser console (F12) and check for:
   - ✅ `Incident report saved to Firebase` (if Firebase is working)
   - ⚠️ `Incident report saved locally only` (if Firebase not configured)

### 4. Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Look for `incident_reports` collection
5. You should see new documents when you report incidents

### 5. Browser Console Test (Advanced)

Open browser console (F12) and run:

```javascript
// If the test utility is loaded
window.testFirebase();
```

This will attempt to create a test document and report the result.

## Troubleshooting

### Issue: "Firebase not configured" message

**Possible causes:**

- `.env.local` file doesn't exist or is in wrong location (should be in project root)
- Environment variables don't have `VITE_` prefix
- Dev server wasn't restarted after adding env variables
- Typo in variable names

**Solution:**

1. Verify `.env.local` is in project root (same folder as `package.json`)
2. Check all variables start with `VITE_`
3. Stop dev server (Ctrl+C) and restart: `npm run dev`
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: "Permission denied" error

**Cause:** Firestore security rules don't allow writes

**Solution:**

1. Go to Firebase Console → Firestore Database → Rules
2. Add rule to allow writes:
   ```javascript
   match /incident_reports/{reportId} {
     allow create: if true;
   }
   ```
3. Click "Publish"

### Issue: Environment variables not loading

**Solution:**

1. Make sure file is named exactly `.env.local` (not `.env` or `.env.local.txt`)
2. Restart dev server
3. Check if variables are accessed correctly: `import.meta.env.VITE_FIREBASE_API_KEY`
4. Try adding to `vite.config.ts` if needed (not recommended, but works for debugging)

### Issue: Build works but runtime fails

**Possible causes:**

- Environment variables work in build but not in dev
- CORS issues with Firebase
- Network/firewall blocking Firebase

**Solution:**

1. Check browser console for specific error messages
2. Verify Firebase API key has correct permissions
3. Check network tab for failed requests to Firebase

## Expected Behavior

### When Firebase is Working:

- ✅ System log shows "Firebase connected"
- ✅ Incident reports appear in Firestore console
- ✅ No errors in browser console
- ✅ Reports persist after page refresh

### When Firebase is NOT Configured (Demo Mode):

- ⚠️ System log shows "Firebase not configured"
- ⚠️ Incident reports only logged to console/system logs
- ⚠️ Reports don't persist (lost on refresh)
- ✅ App still works normally, just no persistence

## Next Steps

Once Firebase is verified:

1. Test reporting multiple incidents
2. Check Firestore console to see all reports
3. Verify reports have correct structure (type, laneId, timestamp, etc.)
4. Consider implementing report viewing feature
5. Set up proper security rules for production
