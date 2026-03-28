import { VehicleState, AnalysisResult, MaintenancePart } from "./maintenance-data";

export interface MLFailurePrediction {
  partName: string;
  prob30Days: number; // 0-100%
  prob60Days: number; // 0-100%
  prob90Days: number; // 0-100%
  severityWeight: number; // 1-10
}

export interface HealthContext {
  healthScore: number; // 0-100
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  predictions: MLFailurePrediction[];
  criticalCount: number;
}

// Determines how catastrophic a failure is (1 = Annoying, 10 = Engine Death)
const severityMap: Record<string, number> = {
  "Timing Belt/Chain": 10,
  "Water Pump": 9,
  "Engine Oil & Oil Filter": 8,
  "Transmission Fluid": 8,
  "Brake Pads & Rotors": 9,
  "Brake Fluid": 7,
  "Suspension Components": 6,
  "Battery": 5,
  "Spark Plugs (Copper)": 4,
  "Spark Plugs (Iridium/Platinum)": 4,
  "Fuel Filter": 5,
  "Drive Belts": 6,
  "Coolant": 7,
  "Wheel Bearings": 8,
  "CV Joints/Axles": 7,
  "Tire Rotation": 3,
  "Air Filter": 2,
  "Cabin Air Filter": 1,
};

// Predicts failure probability based on how far past due the part is
export function calculateFailureProbabilities(
  analysis: AnalysisResult,
  averageDailyKm: number = 40 // Default assumption: user drives 40km a day
): MLFailurePrediction[] {
  const predictions: MLFailurePrediction[] = [];

  const processCategory = (items: { part: MaintenancePart; remainingKm: number }[], isCritical: boolean) => {
    items.forEach(({ part, remainingKm }) => {
      const severity = severityMap[part.name] || 5;
      
      // Calculate km driven over the next 30, 60, 90 days
      const km30 = averageDailyKm * 30;
      const km60 = averageDailyKm * 60;
      const km90 = averageDailyKm * 90;

      // Probability curve (logistic growth simulating mechanical wear)
      const getProb = (futureKm: number) => {
        const netKm = futureKm - remainingKm;
        if (netKm < 0) return Math.min(5, severity); // Not due yet, base baseline wear
        
        // As netKm goes past 0 (overdue), probability scales aggressively
        // A timing belt 5,000km overdue has a massively different curve than a cabin filter
        const baseProb = Math.min(95, (netKm / part.intervalMax) * 100 * (severity / 5));
        
        // If it's already critical, start floor at 50%
        return Math.min(99, Math.max(isCritical ? 50 : 0, Math.round(baseProb)));
      };

      predictions.push({
        partName: part.name,
        severityWeight: severity,
        prob30Days: getProb(km30),
        prob60Days: getProb(km60),
        prob90Days: getProb(km90),
      });
    });
  };

  processCategory(analysis.critical, true);
  processCategory(analysis.upcoming, false);

  return predictions.sort((a, b) => b.prob30Days - a.prob30Days); // Sort highest immediate risk first
}

// Computes the overarching 0-100 Vehicle Health Score
export function calculateHealthScore(analysis: AnalysisResult, predictions: MLFailurePrediction[]): HealthContext {
  let score = 100;
  
  // 1. Penalize for Critical Overdue Items (Weighted heavily by severity)
  analysis.critical.forEach(({ part }) => {
    const severity = severityMap[part.name] || 5;
    score -= (severity * 2.5); // A timing belt (10) drops score by 25 points instantly!
  });

  // 2. Penalize for Upcoming Items
  analysis.upcoming.forEach(({ part }) => {
    const severity = severityMap[part.name] || 5;
    score -= (severity * 0.8);
  });

  // 3. Evaluate High 30-Day Probabilities
  predictions.forEach(p => {
    if (p.prob30Days > 75) {
      score -= (p.severityWeight * 0.5);
    }
  });

  // Floor at 0
  score = Math.max(0, Math.round(score));

  // Determine Risk Level Narrative
  let riskLevel: HealthContext["riskLevel"] = "Low";
  if (score < 40) riskLevel = "Critical";
  else if (score < 65) riskLevel = "High";
  else if (score < 85) riskLevel = "Medium";

  return {
    healthScore: score,
    riskLevel,
    criticalCount: analysis.critical.length,
    predictions
  };
}
