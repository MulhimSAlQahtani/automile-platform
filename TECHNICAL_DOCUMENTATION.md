# AutoMile Technical Documentation

This document provides a comprehensive technical overview of the AutoMile platform, designed for developers and AI agents (like Antigravity) to understand and extend the system.

---

## 🏗 System Architecture

AutoMile is a cross-platform mobile application built using a **Capacitor + React** frontend and a **Firebase** serverless backend.

### 1. High-Level Overview
- **Frontend**: Single Page Application (SPA) built with React, styled with Tailwind CSS, and wrapped in Capacitor for native iOS/Android bridge.
- **Backend**: Firebase Cloud Functions handle business logic, Google Places API integration, and database operations.
- **Database**: Firestore (NoSQL) stores user profiles, vehicle data, service history, and shop metadata.
- **Auth**: Firebase Authentication supporting Email/Password, Google, and Native Biometrics (FaceID/TouchID).

---

## 💻 Frontend Deep-Dive (`/frontend`)

### core Technologies
- **Vite**: Build tool and dev server.
- **React Router v6**: Manages app navigation and deep-linking.
- **Shadcn/UI**: Core component library (Radix UI primitives).
- **Lucide React**: Icon system.

### Key Directories
- `src/pages/`: Core application views.
  - `Auth.tsx`: Multi-method authentication flow.
  - `Index.tsx`: User dashboard / Garage (Real-time Firestore sync).
  - `AddVehicle.tsx`: Vehicle onboarding and VIN validation.
  - `ServiceShops.tsx`: Shop discovery and booking interface.
- `src/lib/`: Business logic and service wrappers.
  - `firebase.ts`: Initialization and Cloud Function wrappers (`httpsCallable`).
  - `ml-engine.ts`: Logic for predicting parts wear based on mileage/time.
  - `maintenance-data.ts`: Static data for service intervals across vehicle types.
- `src/components/`: Reusable UI components.
  - `MaintenanceResults.tsx`: Visualizes the health status of a vehicle.
  - `ScheduleSheet.tsx`: Bottom drawer for quick shop discovery and booking.

---

## ☁️ Backend Deep-Dive (`/backend`)

### Firebase Cloud Functions
Located in `backend/functions/src/index.ts`. All functions are exported as regional (e.g., `us-central1`).

- **`searchNearbyShops`**:
  - **Inputs**: `lat`, `lng`, `serviceType`.
  - **Logic**: Calls Google Places API to find automotive shops. Ranks them using an internal `match_score` based on user ratings and proximity.
  - **Fallback**: Returns simulated "AutoMile Verified" shops if API keys are missing or results are low.

- **`logServiceAndReset`**:
  - **Inputs**: `vehicleId`, `taskName`, `currentMileage`, `cost`.
  - **Logic**: Adds a record to the `service_history` sub-collection and resets the predictive interval in the main `vehicles` document.

### Firestore Data Model
- `users/{uid}/`: User profile data.
- `users/{uid}/vehicles/{vehicleId}/`:
  - `make`, `model`, `year`, `vin`, `currentMileage`, `lastServiceDate`.
- `users/{uid}/vehicles/{vehicleId}/service_history/{serviceId}/`:
  - `taskName`, `mileage`, `timestamp`, `cost`.

---

## 🔐 Security & Permissions

### Authentication
- **Biometric**: Uses `@aparajita/capacitor-biometric-auth` for secure Keychain/Keystore access.
- **Firebase Auth**: Tokens are handled automatically by the SDK.

### Firestore Rules
Security rules ensure users only have access to their own data:
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  
  match /vehicles/{vehicleId} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

---

## 🛠 Development Workflows

### AI-Driven Development (Antigravity)
When requesting new features:
1.  **Context**: Always provide the path to `src/lib/firebase.ts` for backend connectivity.
2.  **Mocking**: Use the `mock-app` check in `firebase.ts` to build UI before backend deployment.
3.  **UI Consistency**: Reference `src/components/ui` for existing Shadcn components.

### Build & Deploy
1.  **Frontend Build**: `npm run build` inside `frontend`.
2.  **Capacitor Sync**: `npx cap sync` to propagate web changes to native iOS/Android.
3.  **Functions Deploy**: `firebase deploy --only functions` from the project root.

---

## 📈 Future Roadmap
- **RockAuto Integration**: Live parts ordering via the commerce engine.
- **OBD-II Real-time data**: Direct integration with Bluetooth scanners for live diagnostic codes.
- **Blockchain Ledger**: Immutable service history stored on the `AutoMileLedger` contract.

---
**Documentation Version**: 1.1.0
**Last Updated**: 2026-03-28
