export type VehicleType = "car" | "suv" | "truck" | "performance" | "ev";

export type QualityTier = "OEM" | "Premium" | "Economy" | "Refurbished";

export const TierMultipliers: Record<QualityTier, { price: number; lifespan: number; title: string; desc: string }> = {
  OEM: { price: 1.0, lifespan: 1.0, title: "Tier 1: OEM/Dealer", desc: "Exact factory specs, full warranty." },
  Premium: { price: 0.8, lifespan: 0.95, title: "Tier 2: Premium Aftermarket", desc: "Quality brands, meets/exceeds specs." },
  Economy: { price: 0.5, lifespan: 0.7, title: "Tier 3: Economy/Value", desc: "Functional replacement, lower cost." },
  Refurbished: { price: 0.4, lifespan: 0.6, title: "Tier 4: Refurbished", desc: "Cost savings, environmental choice." },
};

export interface MaintenancePart {
  name: string;
  intervalMin: number;
  intervalMax: number;
  costMin: number;
  costMax: number;
  tip: string;
  evOnly?: boolean;
  excludeEv?: boolean;
}

const baseParts: MaintenancePart[] = [
  { name: "Engine Oil & Oil Filter", intervalMin: 5000, intervalMax: 8000, costMin: 80, costMax: 120, tip: "Regular oil changes prevent sludge buildup and engine wear.", excludeEv: true },
  { name: "Air Filter", intervalMin: 10000, intervalMax: 15000, costMin: 40, costMax: 80, tip: "A clean filter improves fuel efficiency and engine performance.", excludeEv: true },
  { name: "Cabin Air Filter", intervalMin: 10000, intervalMax: 15000, costMin: 40, costMax: 80, tip: "Keeps HVAC efficient and air quality fresh inside." },
  { name: "Fuel Filter", intervalMin: 20000, intervalMax: 30000, costMin: 100, costMax: 200, tip: "Prevents hesitation and protects the fuel pump.", excludeEv: true },
  { name: "Spark Plugs (Copper)", intervalMin: 20000, intervalMax: 30000, costMin: 100, costMax: 250, tip: "Replace to avoid misfires and reduced MPG.", excludeEv: true },
  { name: "Tire Rotation", intervalMin: 20000, intervalMax: 30000, costMin: 30, costMax: 50, tip: "Extends tire life and improves wet traction." },
  { name: "Transmission Fluid", intervalMin: 40000, intervalMax: 50000, costMin: 150, costMax: 300, tip: "Old fluid causes harsh shifts and can ruin the gearbox.", excludeEv: true },
  { name: "Brake Fluid", intervalMin: 40000, intervalMax: 50000, costMin: 100, costMax: 150, tip: "Absorbs moisture over time. Flush to maintain stopping power." },
  { name: "Coolant", intervalMin: 40000, intervalMax: 50000, costMin: 120, costMax: 180, tip: "Regulates temp and prevents internal corrosion." },
  { name: "Spark Plugs (Iridium/Platinum)", intervalMin: 40000, intervalMax: 50000, costMin: 200, costMax: 400, tip: "Longer life plugs, highly reliable.", excludeEv: true },
  { name: "Timing Belt/Chain", intervalMin: 60000, intervalMax: 80000, costMin: 500, costMax: 1000, tip: "Catastrophic engine damage occurs if this snaps.", excludeEv: true },
  { name: "Water Pump", intervalMin: 60000, intervalMax: 80000, costMin: 400, costMax: 800, tip: "Prevents overheating; often done with the timing belt.", excludeEv: true },
  { name: "Drive Belts", intervalMin: 60000, intervalMax: 80000, costMin: 150, costMax: 300, tip: "Powers alternator and A/C. Inspect for cracks.", excludeEv: true },
  { name: "Differential Fluid", intervalMin: 60000, intervalMax: 80000, costMin: 150, costMax: 250, tip: "Crucial for AWD/4WD to prevent gear grinding.", excludeEv: true },
  { name: "Brake Pads & Rotors", intervalMin: 80000, intervalMax: 100000, costMin: 300, costMax: 800, tip: "Critical safety component. Don't wait for metal-on-metal." },
  { name: "Suspension Components", intervalMin: 80000, intervalMax: 100000, costMin: 500, costMax: 1500, tip: "Maintains stability and prevents hazardous body roll." },
  { name: "Battery", intervalMin: 80000, intervalMax: 100000, costMin: 150, costMax: 300, tip: "Have it load-tested. Extreme temps shorten life." },
  { name: "Clutch (Manual)", intervalMin: 100000, intervalMax: 120000, costMin: 1200, costMax: 2000, tip: "Slipping wastes fuel and destroys the flywheel.", excludeEv: true },
  { name: "Wheel Bearings", intervalMin: 100000, intervalMax: 120000, costMin: 400, costMax: 800, tip: "A grinding or humming noise means immediate replacement." },
  { name: "CV Joints/Axles", intervalMin: 100000, intervalMax: 120000, costMin: 600, costMax: 1200, tip: "Clicking on turns indicates joint failure.", excludeEv: true },
  { name: "Oxygen Sensors", intervalMin: 100000, intervalMax: 120000, costMin: 300, costMax: 600, tip: "Failing O2 sensors ruin fuel economy and catalytic converters.", excludeEv: true },
];

const evParts: MaintenancePart[] = [
  { name: "Tire Rotation", intervalMin: 15000, intervalMax: 15000, costMin: 30, costMax: 50, tip: "EVs are heavier with instant torque, causing faster tire wear.", evOnly: true },
  { name: "Brake Fluid", intervalMin: 40000, intervalMax: 40000, costMin: 100, costMax: 150, tip: "Even with regenerative braking, fluid absorbs moisture.", evOnly: true },
  { name: "Cabin Air Filter", intervalMin: 10000, intervalMax: 15000, costMin: 40, costMax: 80, tip: "Air quality matters regardless of powertrain.", evOnly: true },
  { name: "Coolant (Battery/Motor)", intervalMin: 80000, intervalMax: 80000, costMin: 120, costMax: 180, tip: "EV coolant systems are critical for preventing thermal runaway.", evOnly: true },
  { name: "Battery Health Check", intervalMin: 40000, intervalMax: 40000, costMin: 0, costMax: 50, tip: "Monitor degradation early to prevent massive replacement costs.", evOnly: true },
];

export function getPartsForVehicle(type: VehicleType): MaintenancePart[] {
  if (type === "ev") return [...evParts, ...baseParts.filter(p => !p.excludeEv && !evParts.some(e => e.name === p.name))];
  return baseParts.filter(p => !p.evOnly);
}

export function getIntervalMultiplier(type: VehicleType): number {
  if (type === "suv" || type === "truck") return 0.75; // 25% shorter intervals for heavy duty
  if (type === "performance") return 0.8; // 20% shorter
  return 1;
}

export interface AnalysisResult {
  critical: { part: MaintenancePart; dueAt: number; remainingKm: number }[];
  upcoming: { part: MaintenancePart; dueAt: number; remainingKm: number }[];
  ok: MaintenancePart[];
}

// User-provided vehicle state for dynamic calculations
export interface VehicleState {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  currentMileage: number;
  type: VehicleType;
  lastPerformedMileage: Record<string, number>; // Maps Part Name -> Mileage it was last changed
}

export function analyzeMileageAdvanced(state: VehicleState, tierSettings: Record<string, QualityTier> = {}): AnalysisResult {
  const parts = getPartsForVehicle(state.type);
  const multiplier = getIntervalMultiplier(state.type);
  
  const critical: AnalysisResult["critical"] = [];
  const upcoming: AnalysisResult["upcoming"] = [];
  const ok: MaintenancePart[] = [];

  for (const part of parts) {
    // 1. Calculate the exact interval for THIS vehicle type and requested Parts Tier
    const tierMultiplier = TierMultipliers[tierSettings[part.name] || "OEM"].lifespan;
    const effectiveInterval = Math.round(part.intervalMax * multiplier * tierMultiplier);
    
    // 2. Determine when it was last changed (Fallback to naive cycle calculation if no history exists)
    const historyMileage = state.lastPerformedMileage[part.name];
    let nextDue = 0;
    
    if (historyMileage !== undefined) {
      // Dynamic Calculation: Exact Due Date Based on Last Change!
      nextDue = historyMileage + effectiveInterval;
    } else {
      // Naive Calculation: Predict based on total odometer (Standard logic)
      const cyclesPassed = Math.floor(state.currentMileage / effectiveInterval);
      nextDue = (cyclesPassed + 1) * effectiveInterval;
      
      // If they are exactly on cycle or past it by a bit, they missed it
      if (cyclesPassed > 0 && (state.currentMileage - (cyclesPassed * effectiveInterval)) < 2000) {
        nextDue = cyclesPassed * effectiveInterval; 
      }
    }

    const remainingKm = nextDue - state.currentMileage;

    // 3. Categorize into urgency buckets
    if (remainingKm <= 0) {
      critical.push({ part, dueAt: nextDue, remainingKm });
    } else if (remainingKm <= 5000) {
      upcoming.push({ part, dueAt: nextDue, remainingKm });
    } else {
      ok.push(part);
    }
  }

  return { 
    critical: critical.sort((a,b) => a.remainingKm - b.remainingKm), 
    upcoming: upcoming.sort((a,b) => a.remainingKm - b.remainingKm), 
    ok 
  };
}
