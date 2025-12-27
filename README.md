<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Vision-Based Traffic Sync

A smart traffic management system for Hyderabad's IT Corridor, featuring real-time traffic monitoring, AI-powered route optimization, adaptive signal control, and citizen incident reporting.

## Features

- 🗺️ **Real-time Traffic Map** - Google Maps integration with live traffic layer for Hyderabad areas (Hitech City, Gachibowli, Jubilee Hills, Mindspace)
- 🤖 **AI-Powered Insights** - Gemini AI generates traffic insights and recommends optimal routes
- 🚦 **Adaptive Traffic Signals** - Dynamic signal timing based on vehicle density and emergency situations
- 🚨 **Citizen Reporting** - Crowd-sourced incident reporting (Accidents, Road Work) with Firebase Firestore integration
- ⚡ **Real-time Simulation** - Live traffic flow simulation for 4-way intersections
- 🚑 **Emergency Management** - Priority handling for emergency vehicles with signal pre-emption

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** TailwindCSS
- **Maps:** Google Maps JavaScript API
- **AI:** Google Gemini 1.5 Flash
- **Database:** Firebase Firestore
- **Icons:** Lucide React

## Prerequisites

- Node.js (v18 or higher recommended)
- Firebase project (for incident reporting feature)
- Google Maps API key (optional, for map features)
- Gemini API key (for AI-powered insights)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the project root:
   ```env
   # Gemini AI API Key (Required for AI insights)
   GEMINI_API_KEY=your_gemini_api_key
   
   # Google Maps API Key (Optional, for map features)
   # API_KEY=your_google_maps_api_key
   
   # Firebase Configuration (Required for incident reporting)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000` (or the port shown in terminal)

## Project Structure

```
Project/
├── components/          # React components
│   ├── AppHeader.tsx   # Application header
│   ├── ControlPanel.tsx # Traffic controls and citizen reporting
│   ├── Intersection.tsx # Traffic intersection visualization
│   ├── MainView.tsx    # Main display area
│   └── TrafficMap.tsx  # Google Maps integration
├── config/             # Configuration files
│   └── trafficConfig.ts # Traffic simulation constants
├── hooks/              # Custom React hooks
│   ├── useTrafficSimulation.ts
│   ├── useTrafficCycle.ts
│   ├── useRouteInsights.ts
│   └── useVisualCars.ts
├── services/           # External service integrations
│   ├── firebaseConfig.ts    # Firebase initialization
│   ├── reportService.ts     # Incident report service
│   ├── aiTrafficService.ts  # Gemini AI integration
│   └── trafficService.ts    # Traffic analysis service
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── logger.ts       # Centralized logging
│   ├── trafficAnalysis.ts
│   └── trafficHandlers.ts
└── doc/                # Documentation
    ├── FIREBASE_SETUP.md
    ├── VERIFY_FIREBASE.md
    └── PHASE2_COMPLETE.md
```

## Usage

### Viewing Traffic Status

- The main view shows a 4-way intersection with real-time traffic simulation
- Toggle between "Junction" and "Map" view using the view switcher
- Each lane displays vehicle count, signal status, and timer

### Reporting Incidents

1. Select a lane in the Control Panel
2. Click "Accident" or "Road Work" in the Citizen Reporting section
3. The incident is logged and saved to Firebase Firestore
4. Reports appear in the system logs

### AI Route Suggestions

- The header displays the recommended fastest route
- AI insights are shown in the "Gemini AI Insights" panel
- Routes update every 3 seconds based on current traffic conditions

### Emergency Mode

- Click "Simulate 108 Ambulance" to activate emergency mode for a lane
- Emergency lanes get priority green signals
- Visual indicators show emergency status

## Demo Mode

If Firebase is not configured, the app runs in **demo mode**:
- All features work normally
- Incident reports are logged locally (not persisted)
- No database connection required
- Perfect for testing and development

## Firebase Setup

For full functionality with incident reporting, set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Add your Firebase config to `.env.local` (see Installation step 3)
4. Configure Firestore security rules (see `doc/FIREBASE_SETUP.md`)

For detailed setup instructions, see `doc/FIREBASE_SETUP.md`

## Documentation

- `doc/FIREBASE_SETUP.md` - Firebase configuration guide
- `doc/VERIFY_FIREBASE.md` - Firebase verification steps
- `doc/PHASE2_COMPLETE.md` - Phase 2 implementation summary
- `doc/HACKATHON_FEASIBILITY.md` - Hackathon requirements analysis
- `doc/ARCHITECTURE_AND_IMPACT.md` - Architecture documentation

## Hackathon Requirements Status

✅ **All requirements met:**

1. ✅ Google Maps API with real-time traffic display
2. ✅ Firebase integration for incident reporting
3. ✅ AI-powered route suggestions (Gemini)
4. ✅ Demo with simulated Hyderabad traffic data

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Contributing

This project was developed for the Hack Ananta hackathon. Contributions and improvements are welcome!

## License

[Add your license here]

---

**Note:** This application is designed for demonstration purposes. For production deployment, implement proper authentication, security rules, and error handling as outlined in the documentation.
