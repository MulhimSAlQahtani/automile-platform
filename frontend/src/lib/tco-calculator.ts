import { VehicleState, AnalysisResult, TierMultipliers, QualityTier } from "./maintenance-data";

export interface TCOProjection {
  currentSpend: number;
  projected5YearOEM: number;
  projected5YearPremium: number;
  projected5YearEconomy: number;
  regionalAverage: number;
  savingsVsOEM: number;
  tierUsed: QualityTier;
}

export interface BundleOptimization {
  bundleName: string;
  partsIncluded: string[];
  totalCostMin: number;
  totalCostMax: number;
  laborSavings: number; // The financial amount saved by bundling
  urgency: "Immediate" | "Upcoming";
}

// Calculates the Total Cost of Ownership projections based on current vehicle state
export function calculateTCO(state: VehicleState, baselineRegionalAverage: number = 3200): TCOProjection {
  // Mock historical spend based on typical odometer math for demonstration
  // In production, this sums the exact `cost` integers from the Firestore `service_history` subcollection
  const estimatedHistoricalSpend = (state.currentMileage / 10000) * 250; 
  
  // Future projections
  const base5YearProjection = 4500; // Standard nominal 5-year spend for typical ICE vehicle overhead
  
  return {
    currentSpend: Math.round(estimatedHistoricalSpend),
    projected5YearOEM: base5YearProjection * TierMultipliers.OEM.price,
    projected5YearPremium: base5YearProjection * TierMultipliers.Premium.price,
    projected5YearEconomy: base5YearProjection * TierMultipliers.Economy.price,
    regionalAverage: baselineRegionalAverage,
    tierUsed: "Premium", // Simulated user active setting
    savingsVsOEM: (base5YearProjection * TierMultipliers.OEM.price) - (base5YearProjection * TierMultipliers.Premium.price)
  };
}

// Logic to identify parts that are due close together and bundle them into a single shop visit
export function optimizeScheduleBundles(analysis: AnalysisResult): BundleOptimization[] {
  const bundles: BundleOptimization[] = [];
  
  // 1. Critical Engine Bay Bundle (Oil, Belts, Filters)
  const engineParts = ["Engine Oil & Oil Filter", "Air Filter", "Drive Belts", "Timing Belt/Chain"];
  const criticalEngine = analysis.critical.filter(c => engineParts.includes(c.part.name));
  const upcomingEngine = analysis.upcoming.filter(u => engineParts.includes(u.part.name) && u.remainingKm < 3000);
  
  if (criticalEngine.length > 0 || upcomingEngine.length > 1) {
    const all = [...criticalEngine, ...upcomingEngine];
    if (all.length > 1) { // Only a bundle if there's multiple items
      const costsMin = all.reduce((sum, item) => sum + item.part.costMin, 0);
      const costsMax = all.reduce((sum, item) => sum + item.part.costMax, 0);
      
      bundles.push({
        bundleName: "Major Engine Bay Service Bundle",
        partsIncluded: all.map(i => i.part.name),
        totalCostMin: costsMin,
        totalCostMax: costsMax,
        laborSavings: Math.round((costsMax * 0.15)), // Assumes a massive 15% labor reduction by bundling
        urgency: criticalEngine.length > 0 ? "Immediate" : "Upcoming"
      });
    }
  }

  // 2. Wheel Hub / Braking Bundle
  const wheelParts = ["Brake Pads & Rotors", "Brake Fluid", "Tire Rotation", "Suspension Components", "Wheel Bearings"];
  const criticalWheel = analysis.critical.filter(c => wheelParts.includes(c.part.name));
  const upcomingWheel = analysis.upcoming.filter(u => wheelParts.includes(u.part.name) && u.remainingKm < 3000);
  
  if (criticalWheel.length > 0 || upcomingWheel.length > 1) {
    const all = [...criticalWheel, ...upcomingWheel];
    if (all.length > 1) {
      const costsMin = all.reduce((sum, item) => sum + item.part.costMin, 0);
      const costsMax = all.reduce((sum, item) => sum + item.part.costMax, 0);
      
      bundles.push({
        bundleName: "Wheel Hub & Braking Bundle",
        partsIncluded: all.map(i => i.part.name),
        totalCostMin: costsMin,
        totalCostMax: costsMax,
        laborSavings: Math.round((costsMax * 0.20)), // 20% savings since wheels are already off
        urgency: criticalWheel.length > 0 ? "Immediate" : "Upcoming"
      });
    }
  }

  return bundles;
}
