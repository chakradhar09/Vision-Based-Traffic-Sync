# Quick Start: Firebase Verification

Since you've added environment variables to `.env.local`, here's how to verify everything is working:

## ✅ Quick Verification Steps

### 1. Restart Dev Server (IMPORTANT!)

**After adding environment variables, you MUST restart the dev server:**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Check System Logs

When the app loads, look at the **"GHMC Grid Log"** panel in the Control Panel (right side). You should see one of these messages:

**✅ Success:**
```
✅ Firebase connected. Incident reports will be saved to database.
```

**⚠️ Demo Mode (if Firebase not configured):**
```
⚠️ Firebase not configured. Running in demo mode (reports logged locally only).
```

### 3. Test Incident Reporting

1. Click on any lane (e.g., "Hitech City Main Rd")
2. In the "Citizen Reporting" section, click **"Accident"** or **"Road Work"**
3. Check the system logs - you should see:
   ```
   USER REPORT: Citizen reported [type] on [lane]. Alerting TSRTC.
   ```
4. Open browser console (F12) and check for:
   - ✅ `Incident report saved to Firebase` (if working)
   - ⚠️ `Incident report saved locally only` (if not configured)

### 4. Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Look for `incident_reports` collection
5. You should see new documents appear when you report incidents

## 🔍 Troubleshooting

### Still seeing "Firebase not configured"?

1. **Check file location:** `.env.local` must be in the project root (same folder as `package.json`)
2. **Check variable names:** All must start with `VITE_` prefix:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   ```
3. **Restart dev server:** Changes to `.env.local` require a server restart
4. **No quotes:** Don't put quotes around values in `.env.local`
5. **No spaces:** No spaces around `=` sign

### Getting "Permission denied" errors?

Your Firestore security rules need to allow writes. Go to Firebase Console → Firestore Database → Rules and add:

```javascript
match /incident_reports/{reportId} {
  allow create: if true;
  allow read: if true;
}
```

Then click "Publish".

## 📝 Example `.env.local` Format

```env
GEMINI_API_KEY=your_gemini_key_here
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## ✨ Success Indicators

When everything is working correctly:

- ✅ System log shows "Firebase connected" message
- ✅ Incident reports appear in Firestore console
- ✅ No errors in browser console
- ✅ Reports persist after page refresh
- ✅ Browser console shows "Incident report saved to Firebase"

---

**Need more help?** Check `doc/VERIFY_FIREBASE.md` for detailed troubleshooting.

