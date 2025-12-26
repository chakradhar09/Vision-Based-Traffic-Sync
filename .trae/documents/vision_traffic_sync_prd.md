## 1. Product Overview
Vision-Based Traffic Sync is an AI-powered traffic management dashboard that analyzes live camera feeds to dynamically adjust traffic light timers based on lane density and emergency vehicle detection. The system prioritizes emergency situations by implementing a "Green Wave" protocol that clears paths for ambulances and fire trucks.

This 4-lane traffic dashboard solves real-time adaptability issues in traffic management systems, enabling life-saving speed for emergency vehicles while optimizing traffic flow for regular vehicles.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Traffic Operator | System admin setup | View all lanes, upload camera feeds, toggle emergency mode |
| Emergency Services | API integration | Automatic priority detection and green wave activation |

### 2.2 Feature Module
The traffic management system consists of the following main pages:
1. **Traffic Dashboard**: 4-lane display with traffic lights, countdown timers, camera upload buttons, and emergency mode toggle.
2. **System Status**: Real-time monitoring of AI analysis status and system health indicators.

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Traffic Dashboard | 4-Lane Display | Show 4 distinct traffic lanes with visual indicators for each lane's status |
| Traffic Dashboard | Traffic Light Controls | Toggle between Red and Green states for each lane with visual indicators |
| Traffic Dashboard | Countdown Timers | Display "Seconds Remaining" countdown for each lane's current light state |
| Traffic Dashboard | Camera Upload Interface | Include "Camera Upload" button for each lane to simulate video feed input as Base64 strings |
| Traffic Dashboard | Emergency Mode Control | Include "Global Emergency Mode" toggle for manual override of all traffic lights |
| Traffic Dashboard | Real-time Updates | Automatically refresh traffic light states and timers based on Firestore data changes |
| System Status | AI Analysis Monitor | Display current AI processing status and last analysis timestamp |
| System Status | System Health | Show connection status to n8n webhook and Gemini API |

## 3. Core Process
**Traffic Operator Flow:**
1. Operator accesses the Traffic Dashboard
2. Clicks "Camera Upload" for any of the 4 lanes
3. System sends Base64 image to n8n webhook
4. n8n processes image through Google Gemini 1.5 Flash
5. AI returns vehicle count and emergency vehicle detection
6. n8n calculates timer values using formula: time = (count × 3) + 5 (min 10s, max 60s)
7. If emergency detected: emergency lane gets 60s green, others get 0s red
8. n8n updates Firestore lane_stats collection
9. Dashboard automatically updates traffic lights and timers
10. Green Wave function updates Next_Intersection document in Firestore

**Emergency Services Flow:**
1. Emergency vehicle appears in camera feed
2. AI detects emergency vehicle via visual cues (red/blue flashes)
3. System automatically triggers emergency protocol
4. Emergency lane gets extended green light (60s)
5. All other lanes switch to red (0s)
6. Green Wave activates to clear path at next intersection

```mermaid
graph TD
    A[Dashboard] --> B[Camera Upload]
    B --> C[n8n Webhook]
    C --> D[Gemini AI Analysis]
    D --> E{Emergency Detected?}
    E -->|Yes| F[Emergency Protocol]
    E -->|No| G[Standard Protocol]
    F --> H[60s Green for Emergency Lane]
    F --> I[0s Red for Other Lanes]
    F --> J[Green Wave Activation]
    G --> K[Calculate Timer: (count×3)+5]
    K --> L[Apply Min/Max Constraints]
    H --> M[Update Firestore]
    I --> M
    J --> M
    L --> M
    M --> N[Dashboard Updates]
```

## 4. User Interface Design

### 4.1 Design Style
- **Primary Colors**: Traffic light colors (Red: #FF0000, Yellow: #FFFF00, Green: #00FF00) with dark background (#1a1a1a)
- **Secondary Colors**: Light gray (#f0f0f0) for UI elements, black (#000000) for text
- **Button Style**: Rounded corners with hover effects, traffic light-themed colors
- **Font**: Sans-serif, large sizes for visibility (24px+ for timers, 16px for labels)
- **Layout Style**: Grid-based 4-lane layout with clear visual separation
- **Icons**: Traffic light symbols, emergency vehicle indicators, camera upload icons

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Traffic Dashboard | 4-Lane Grid | 2x2 grid layout with equal spacing, dark background, clear lane boundaries |
| Traffic Dashboard | Traffic Light Display | Large circular indicators (100px diameter) with smooth color transitions, positioned above each lane |
| Traffic Dashboard | Countdown Timers | Bold digital display (48px font) showing seconds remaining, positioned below traffic lights |
| Traffic Dashboard | Camera Upload Buttons | Prominent upload buttons with camera icon, positioned at bottom of each lane |
| Traffic Dashboard | Emergency Toggle | Large red emergency button with safety cover design, positioned top-right |
| System Status | Status Indicators | Color-coded status lights (green/yellow/red) for each system component |

### 4.3 Responsiveness
Desktop-first design approach with mobile adaptability. Primary interface optimized for 1920x1080 displays used in traffic control centers. Touch interaction optimization for tablet deployment in field operations.

### 4.4 Real-time Updates
The dashboard implements real-time synchronization with Firestore, ensuring traffic light states and countdown timers update instantly when n8n processes new camera data. Visual feedback includes smooth transitions and status indicators showing data freshness.