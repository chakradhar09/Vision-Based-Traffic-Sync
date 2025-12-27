# Firebase Setup Guide

## Overview

This project uses Firebase Firestore to store incident reports from the citizen reporting feature. The app will work in demo mode (local-only logging) if Firebase is not configured.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable **Firestore Database**:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Start in **test mode** for development (or production mode with proper security rules)
   - Choose a location (closest to your users)

### 2. Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register your app with a nickname (e.g., "Vision Traffic Sync")
6. Copy the Firebase configuration object

### 3. Set Environment Variables

Create a `.env.local` file in the project root (if it doesn't exist) and add your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Set Firestore Security Rules (Important!)

In Firebase Console → Firestore Database → Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to incident_reports collection
    match /incident_reports/{reportId} {
      allow read: if true;  // Anyone can read (adjust as needed)
      allow create: if true; // Anyone can create reports (adjust as needed)
      allow update, delete: if false; // Only admins can update/delete (implement admin check if needed)
    }
  }
}
```

**For Production:**
- Implement proper authentication
- Add user-based access control
- Validate data structure
- Set up indexes for queries

### 5. Verify Setup

1. Start the app: `npm run dev`
2. Check the console logs for "Firebase connected" message
3. Report an incident using the "Accident" or "Road Work" buttons
4. Check Firebase Console → Firestore Database to see the `incident_reports` collection with your test report

## Data Structure

Reports are stored in the `incident_reports` collection with the following structure:

```typescript
{
  type: "Accident" | "Pothole / Road Work",
  laneId: "lane_1" | "lane_2" | "lane_3" | "lane_4",
  laneLabel: string,  // e.g., "Hitech City Main Rd"
  timestamp: Timestamp,  // Firebase server timestamp
  reportedBy: "citizen",
  status: "pending"
}
```

## Demo Mode

If Firebase is not configured, the app runs in **demo mode**:
- Incident reports are logged to the console and system logs
- No data persistence
- All features work normally except report storage

## Troubleshooting

### "Firebase configuration not found"
- Check that `.env.local` exists and contains all required variables
- Ensure variables start with `VITE_` prefix
- Restart the dev server after changing `.env.local`

### "Firestore instance not available"
- Verify Firebase project has Firestore enabled
- Check that security rules allow create operations
- Verify network connectivity

### Reports not appearing in Firestore
- Check browser console for errors
- Verify Firestore security rules allow writes
- Check Firebase project quota/limits

## Next Steps

For production deployment:
1. Implement user authentication
2. Add proper security rules
3. Create Firestore indexes for queries
4. Set up data validation
5. Add incident report viewing/history feature
6. Implement admin dashboard for managing reports

