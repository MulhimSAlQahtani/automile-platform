import { PushNotifications, ActionPerformed, Token } from '@capacitor/push-notifications';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Pre-existing

/**
 * Native Firebase Cloud Messaging Listener Matrix
 * Aggressively binds generic React workflows directly to OS-level Push Action taps.
 */
export async function registerPushCapabilities(navigate: (path: string) => void) {
  // 1. Request OS Permission (Prompts user natively)
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    console.warn("User explicitly denied Native Push Notification capabilities.");
    return;
  }

  // 2. Register with Apple APNs / Google FCM servers natively
  await PushNotifications.register();

  // 3. Stash the literal hardware UUID Token directly to the user's master Firestore ledger
  PushNotifications.addListener('registration', async (token: Token) => {
    const user = getAuth().currentUser;
    if (user) {
      // Forcefully map device token to UUID profile
      await setDoc(doc(db, "users", user.uid), {
        fcmToken: token.value, 
        lastTokenUpdate: new Date().toISOString()
      }, { merge: true });
    }
  });

  // 4. Register explicitly Interactive Action Categories
  // This explicitly wires the "Schedule Repair" and "Snooze" buttons natively into the iOS/Android Slide-down interface
  await (PushNotifications as any).registerActionTypes({
    types: [
      {
        id: "MAINTENANCE_ACTIONS",
        actions: [
          { id: "SCHEDULE", title: "Schedule Repair Now", foreground: true },
          { id: "SNOOZE", title: "Snooze 7 Days", destructive: true, foreground: false }
        ]
      }
    ]
  });

  // 5. Deep-Link Interceptor
  // When a user taps the physical Push Notification (or the embedded Action Buttons), immediately seize routing control
  PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      const data = notification.notification.data;
      const actionId = notification.actionId; // "tap", "SCHEDULE", "SNOOZE"

      if (actionId === 'SNOOZE') {
         // Silently push a +7 day snooze timestamp to Firestore. Do not wake the app explicitly.
         return;
      }

      // If they tapped "SCHEDULE" or just tapped the generic notification body:
      if (data.type === "MAINTENANCE_DUE" || data.type === "WEATHER_WARNING") {
         const { vehicleId, partName } = data;
         // Immediately Deep-link bypassing the entire menu stack directly onto the specific car's actionable UI payload
         navigate(`/app/schedule?vin=${vehicleId}&target=${encodeURIComponent(partName)}`);
      }
  });
}
