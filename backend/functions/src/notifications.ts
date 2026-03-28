import * as admin from "firebase-admin";

interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  actionParams: {
    type: "MAINTENANCE_DUE" | "WEATHER_WARNING" | "DTC_ALERT";
    partName?: string;
    vehicleId?: string;
  };
  urgency: "HIGH" | "MEDIUM" | "LOW";
  channelPreferences?: { push?: boolean; sms?: boolean; email?: boolean };
}

// Intercepts general requests and formats explicit A/B tested native messaging objects
export async function dispatchSmartNotification(payload: NotificationPayload) {
  const db = admin.firestore();
  
  // 1. Enforce Explicit User Opt-Outs aggressively
  const userDoc = await db.collection("users").doc(payload.userId).get();
  const preferences = userDoc.data()?.notification_preferences || { push: true, sms: false, email: true };

  // 2. A/B Testing Matrix: We divide users into "Urgent" vs "Friendly" explicitly based on UUID hashes.
  const isGroupA = payload.userId.charCodeAt(0) % 2 === 0;
  
  let finalTitle = payload.title;
  let finalBody = payload.body;

  if (payload.urgency === "HIGH" && payload.actionParams.type === "MAINTENANCE_DUE") {
    if (isGroupA) {
      finalTitle = `⚠️ CRITICAL: ${payload.actionParams.partName} OVERDUE`;
      finalBody = `Your ${payload.actionParams.partName} is actively degrading. Tap to book a certified repair immediately.`;
    } else {
      finalTitle = `Hi! Let's swap your ${payload.actionParams.partName} 🛠️`;
      finalBody = `It's time for a vital repair. We found 3 exact matches nearby! Tap to review.`;
    }
  }

  // 3. Construct APNs (Apple) & FCM (Android) Payloads with Action Buttons integrated natively
  const pushMessage = {
    notification: {
      title: finalTitle,
      body: finalBody,
    },
    data: {
      type: payload.actionParams.type,
      partName: payload.actionParams.partName || "",
      vehicleId: payload.actionParams.vehicleId || "",
      abGroup: isGroupA ? "A_URGENT" : "B_FRIENDLY"
    },
    apns: {
      payload: {
        aps: {
          category: "MAINTENANCE_ACTIONS", // Maps to iOS Frontend Action Categories
          mutableContent: true, // Boolean required by admin-sdk
        }
      }
    },
    android: {
      notification: {
        clickAction: "FLUTTER_NOTIFICATION_CLICK" // Generic deep-link hook
      }
    },
    token: userDoc.data()?.fcmToken
  };

  // 4. Multi-Channel Execution Queue
  const promises = [];

  // PUSH
  if (preferences.push && userDoc.data()?.fcmToken) {
    if (payload.urgency !== "LOW" || !userDoc.data()?.fatigueTimeout) {
      promises.push(
        admin.messaging().send(pushMessage)
          .then(() => logAnalytics(payload.userId, isGroupA ? "A" : "B", "DELIVERED", "PUSH"))
          .catch(err => console.error("FCM Delivery Failure:", err))
      );
    }
  }

  // SMS (Twilio Sandbox)
  if (preferences.sms && payload.urgency === "HIGH") {
    console.log(`[Twilio Proxy] Emitting SMS: ${finalBody}`);
    // Await twilioClient.messages.create(...)
  }

  await Promise.all(promises);
}

async function logAnalytics(userId: string, abGroup: string, status: "DELIVERED" | "OPENED" | "ACTIONED", channel: string) {
  await admin.firestore().collection("notification_analytics").add({
     userId,
     abGroup,
     status,
     channel,
     timestamp: admin.firestore.FieldValue.serverTimestamp(),
     hourOfDay: new Date().getHours() // Specific optimization hook tracking user engagement clusters
  });
}
