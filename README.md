# 🚗 AutoMile Platform

**AutoMile** is a revolutionary predictive maintenance, service booking, and automotive commerce platform built on a modern **Capacitor + React Frontend** and **Firebase backend**. It leverages Artificial Intelligence to forecast parts wear, cross-references location data for nearby certified mechanic shops, and supports biometric authentication.

---

## 🛠 Features

- **Predictive Maintenance Engine:** Input your mileage and vehicle type to get highly accurate service forecasts (Critical, Upcoming, and Good).
- **VIN Fault Tolerance:** Automatically sanitizes 'O' to '0' and validates VIN logic dynamically.
- **Native Biometric Auth:** Log in securely via FaceID / TouchID using Capacitor's native biometric APIs.
- **Shop Match Algorithm:** Recommends and ranks the best service shops based on specialty match scores and overall ratings.
- **Cross-Platform Map Linking:** Native deep-linking natively opens iOS Apple Maps or Google Maps to direct users to nearby shops.
- **Atomic Service Transactions:** Backend cloud functions log vehicle service history securely and synchronously update predictive intervals.
- **Cost Estimation & Parts Commerce:** Direct RockAuto integration for transparent part cost ranges.
- **Full i18n Localization:** Built-in English and Arabic support explicitly for localization.

---

## 🚀 Technology Stack

### Frontend (Capacitor/React)
- **Framework:** React 18, Vite
- **UI & Styling:** Tailwind CSS, ShadCN UI
- **Native Shell:** Ionic Capacitor (iOS/Android)
- **Auth:** Firebase Auth, `@aparajita/capacitor-biometric-auth`
- **Routing:** React Router v6

### Backend (Firebase)
- **Functions:** Node.js 20, TypeScript
- **Database:** Cloud Firestore
- **Environment Management:** Project-specific deployments mapped properly via `.firebaserc`.

---

## 📦 Getting Started

### 1. Structure
- `/frontend`: The Capacitor React codebase.
- `/backend`: The Firebase Functions and Firestore security rules.

### 2. Running Locally (Frontend)
```bash
cd frontend
npm install

# Add your environment variables to a `.env` file:
# VITE_FIREBASE_API_KEY=...
# VITE_AI_API_KEY=...

npm run dev
```

### 3. Deploying the Backend
```bash
cd backend/functions
npm install
npm run build
firebase deploy --only functions
```

### 4. Compiling to Mobile
```bash
cd frontend
npm run build
npx cap sync
npx cap open ios # or android
```

---

## 🔒 Permissions & Data Architecture
AutoMile requires access to standard native device features to optimize the user experience:
- **Biometry / Face ID:** Used strictly for secure authentication.
- **Geo-Location:** Used when explicitly requesting shop availability to open the map routing correctly.

*See `PRIVACY_POLICY.md` for specific App Store declarations.*
