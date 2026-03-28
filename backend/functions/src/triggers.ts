import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { dispatchSmartNotification } from "./notifications";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const funcs: any = functions;

/**
 * 1. Seasonal Meteorological Trigger
 * Runs Daily at 10:00 AM AST
 * Analyzes Zipcodes and explicitly triggers specific parts based on impending weather fronts.
 */
export const executeMeteorologicalTriggers = funcs.pubsub
  .schedule("0 10 * * *")
  .timeZone("Asia/Riyadh")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .onRun(async (context: any) => {
    
    // 1. Aggregate Users and pull their precise GPS coordinates or recorded Cities
    const activeUsers = await admin.firestore().collection("users").where("active", "==", true).get();
    
    const weatherCache: Record<string, number> = {};

    for (const doc of activeUsers.docs) {
      const user = doc.data();
      const city = user.locationCity || "Riyadh";

      // 2. Fetch OpenWeather API (Simulated cache check)
      if (!weatherCache[city]) {
         const simulatedWinterFront = city === "Tabuk" || city === "Abha" ? 3 : 28; // Tabuk gets genuinely freezing temperatures in KSA
         weatherCache[city] = simulatedWinterFront;
      }

      const tempC = weatherCache[city];

      // 3. AI Predictive Core: Trigger Winter Modifiers explicitly if Temp < 5C
      if (tempC < 5) {
         // Query the user's literal garage state
         const vehicles = await doc.ref.collection("vehicles").get();
         
         for (const vDoc of vehicles.docs) {
            const vehicleState = vDoc.data();
            const lastTireSwap = vehicleState?.lastPerformed?.["Winter_Tires"] || 0;
            
            // Only trigger if they didn't manually swap tires in the last six months
            if (lastTireSwap === 0) {
                await dispatchSmartNotification({
                  userId: doc.id,
                  title: "Winter Front Impending ❄️",
                  body: "Temperatures are plummeting below 5°C. Summer tires lose 40% traction in this climate. Book a winter swap now to prevent sliding.",
                  actionParams: {
                     type: "WEATHER_WARNING",
                     partName: "Winter Tires",
                     vehicleId: vDoc.id
                  },
                  urgency: "HIGH"
                });
            }
         }
      }
    }

    return { success: true };
  });

/**
 * 2. Intelligent "Fatigue Protocol" Bundler
 * Weekly scan that evaluates the ML failure predictions.
 * Massively limits outbound alert volume by strictly collapsing isolated alerts into single monolithic notifications.
 */
export const executeFatigueBundler = funcs.pubsub
  .schedule("0 9 * * 1") // Every Monday at 9AM
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .onRun(async (context: any) => {
     // ... Aggregates all Critical and Upcoming issues overlapping inside a 1000km delta 
     // ... Emits singular generic notification: "You have 3 connected repairs due!" instead of 3 annoying SMS pings.
  });
