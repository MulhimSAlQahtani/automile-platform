# AutoMile Privacy Policy

**Effective Date:** March 24, 2026

## 1. Introduction
Welcome to **AutoMile**. Your privacy is critically important to us. This Privacy Policy outlines the types of data we collect, why we collect it, and how your data is handled securely to provide you with the best predictive maintenance and automotive service experience possible.

This policy applies specifically to the AutoMile iOS and Android applications, as well as our web platform.

## 2. Information We Collect

### A. Vehicle Identification Number (VIN)
- **Why we collect it:** We collect your vehicle's VIN to accurately determine your vehicle's exact make, model, year, and trim level. 
- **How it is used:** Your VIN is processed through our predictive maintenance engine to generate highly specific service intervals and compatibility charts for replacement parts (e.g., RockAuto integration). 
- **Storage:** VINs are explicitly stored securely via Firebase Cloud Firestore associated directly with your encrypted user profile.

### B. Location Data 
- **Why we collect it:** AutoMile requires temporary location access to connect you with nearby certified automotive shops.
- **How it is used:** When you click "Find Shop" or request schedule availability, your location (approximate or precise) is queried against our Shop Match Algorithm to rank mechanics by distance, rating, and expertise.
- **Storage:** AutoMile **does not** track or log your location in the background or store historical location data on our servers. Location data is strictly used at the time of the request to deep-link to your device’s native map application (e.g., Apple Maps or Google Maps).

### C. Authentication Data (Emails & Biometrics)
- We collect your email for account creation utilizing Google Sign-In or standard email providers.
- **Biometric Data (FaceID / TouchID):** Biometric verification is handled strictly on-device using native OS secure enclaves. AutoMile receives a success/fail token and **never** has access to your actual biometric fingerprints or facial scans.

---

## 3. Third-Party Services
We may securely share limited data to provide core functionality:
- **Firebase/Google Cloud:** Acts as the primary backend and authentication provider.
- **Generative AI Providers (OpenAI/Google Gemini):** Diagnostic strings and generic vehicle parts may be forwarded to AI models to return plain-text service explanations. *No personally identifiable information is sent to third-party AI interfaces.*

## 4. App Store & Google Play Declarations
If requested by Apple (App Store Connect) or Google Play Console regarding Data Privacy labels:
- **Data Linked to You:** Yes (Contact Info, User Content, Identifiers).
- **Data Used to Track You:** No. We do not sell your personal data or provide it to third-party ad brokers.

## 5. Account Deletion & Rights
You maintain complete control over your data. Inside the application, you may request the deletion of your account and vehicles at any time. Automatically, our backend Firestore routines will trigger an immediate atomic cascade deletion of all your log history and data.

## 6. Contact Us
For any privacy-related inquiries, please contact our support team at privacy@automile.app.
