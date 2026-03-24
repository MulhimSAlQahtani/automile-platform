import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// 1. Shop Matching Algorithm (Weighted)
export const getRecommendedShops = functions.https.onCall(async (data, context) => {
  const { userLat, userLng, serviceType } = data;
  const shopsSnap = await admin.firestore().collection('shops').get();
  
  const ranked = shopsSnap.docs.map(doc => {
    const shop = doc.data();
    let score = 0;
    
    // Weighting Logic
    if (shop.specialties.includes(serviceType)) score += 50;
    score += (shop.rating || 0) * 10;
    
    return { id: doc.id, ...shop, match_score: score };
  }).sort((a, b) => b.match_score - a.match_score);

  return ranked;
});

// 2. Scheduled Push Notifications
export const checkMileageThresholds = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const users = await admin.firestore().collection('users').get();
  // Logic to calculate predicted mileage vs threshold
  // admin.messaging().sendToDevice(token, payload);
});
