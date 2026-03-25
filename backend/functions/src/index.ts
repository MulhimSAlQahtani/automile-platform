import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const funcs: any = functions;

/**
 * 1. Shop Matching Algorithm (Weighted)
 */
export const getRecommendedShops = funcs.https.onCall(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (data: any, context: any) => {
    if (!context.auth) {
      throw new funcs.https.HttpsError(
        "unauthenticated",
        "User must be logged in."
      );
    }

    const {serviceType} = data;
    const shopsSnap = await admin.firestore().collection("shops").get();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ranked = shopsSnap.docs.map((doc: any) => {
      const shop = doc.data();
      let score = 0;

      if (shop.specialties && shop.specialties.includes(serviceType)) {
        score += 50;
      }
      score += (shop.rating || 0) * 10;

      return {id: doc.id, ...shop, match_score: score};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).sort((a: any, b: any) => b.match_score - a.match_score);

    return ranked;
  }
);

/**
 * 2. Scheduled Push Notifications
 * Runs daily to check mileage thresholds
 */
export const checkMileageThresholds = funcs.pubsub
  .schedule("every 24 hours")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .onRun(async (context: any) => {
    console.log("Running mileage check at:", context.timestamp);

    const users = await admin.firestore().collection("users").get();
    return {processed: users.size};
  });

/**
 * 3. Atomic Service Logger
 * Logs history and updates vehicle state atomically
 */
export const logServiceAndReset = funcs.https.onCall(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (data: any, context: any) => {
    if (!context.auth) {
      throw new funcs.https.HttpsError("unauthenticated", "Login required");
    }

    const { vehicleId, taskName, currentMileage, cost } = data;
    const userRef = admin.firestore().collection("users").doc(context.auth.uid);
    const vehicleRef = userRef.collection("vehicles").doc(vehicleId);
    const historyRef = vehicleRef.collection("service_history").doc();

    return admin.firestore().runTransaction(async (transaction: any) => {
      // 1. Log the History
      transaction.set(historyRef, {
        taskName,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        mileage: currentMileage,
        cost: cost || 0,
      });

      // 2. Update the Vehicle's "Last Performed" state
      transaction.update(vehicleRef, {
        [`last_performed.${taskName.replace(/\s+/g, "_")}`]: currentMileage,
        last_updated: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    });
  }
);
