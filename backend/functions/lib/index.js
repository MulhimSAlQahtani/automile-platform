"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMileageThresholds = exports.getRecommendedShops = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const funcs = functions;
/**
 * 1. Shop Matching Algorithm (Weighted)
 */
exports.getRecommendedShops = funcs.https.onCall(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async (data, context) => {
    if (!context.auth) {
        throw new funcs.https.HttpsError("unauthenticated", "User must be logged in.");
    }
    const { serviceType } = data;
    const shopsSnap = await admin.firestore().collection("shops").get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ranked = shopsSnap.docs.map((doc) => {
        const shop = doc.data();
        let score = 0;
        if (shop.specialties && shop.specialties.includes(serviceType)) {
            score += 50;
        }
        score += (shop.rating || 0) * 10;
        return Object.assign(Object.assign({ id: doc.id }, shop), { match_score: score });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).sort((a, b) => b.match_score - a.match_score);
    return ranked;
});
/**
 * 2. Scheduled Push Notifications
 * Runs daily to check mileage thresholds
 */
exports.checkMileageThresholds = funcs.pubsub
    .schedule("every 24 hours")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .onRun(async (context) => {
    console.log("Running mileage check at:", context.timestamp);
    const users = await admin.firestore().collection("users").get();
    return { processed: users.size };
});
//# sourceMappingURL=index.js.map