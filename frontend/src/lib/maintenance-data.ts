export type VehicleType = "car" | "suv" | "performance" | "ev";

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
  { name: "Engine Oil & Oil Filter", intervalMin: 5000, intervalMax: 8000, costMin: 80, costMax: 120, tip: "Use manufacturer-recommended oil grade. Synthetic oil lasts longer but costs more.", excludeEv: true },
  { name: "Air Filter", intervalMin: 10000, intervalMax: 15000, costMin: 40, costMax: 80, tip: "A clogged air filter reduces fuel efficiency by up to 10%. Check it every oil change.", excludeEv: true },
  { name: "Cabin Air Filter", intervalMin: 10000, intervalMax: 15000, costMin: 40, costMax: 80, tip: "Replace more frequently if you drive in dusty or polluted areas." },
  { name: "Fuel Filter", intervalMin: 20000, intervalMax: 30000, costMin: 100, costMax: 200, tip: "A dirty fuel filter can cause engine misfires and reduced power.", excludeEv: true },
  { name: "Spark Plugs (Copper)", intervalMin: 20000, intervalMax: 30000, costMin: 100, costMax: 250, tip: "Consider upgrading to iridium plugs for longer service life.", excludeEv: true },
  { name: "Tire Rotation", intervalMin: 20000, intervalMax: 30000, costMin: 30, costMax: 50, tip: "Regular rotation ensures even wear and extends tire life significantly." },
  { name: "Transmission Fluid", intervalMin: 40000, intervalMax: 50000, costMin: 150, costMax: 300, tip: "Never mix different types of transmission fluid. Check your manual.", excludeEv: true },
  { name: "Brake Fluid", intervalMin: 40000, intervalMax: 50000, costMin: 100, costMax: 150, tip: "Brake fluid absorbs moisture over time, reducing braking effectiveness." },
  { name: "Coolant", intervalMin: 40000, intervalMax: 50000, costMin: 120, costMax: 180, tip: "Never open the radiator cap when the engine is hot." },
  { name: "Spark Plugs (Iridium/Platinum)", intervalMin: 40000, intervalMax: 50000, costMin: 200, costMax: 400, tip: "Iridium plugs can last up to 100,000 km but should still be inspected.", excludeEv: true },
  { name: "Timing Belt/Chain", intervalMin: 60000, intervalMax: 80000, costMin: 500, costMax: 1000, tip: "A broken timing belt can cause catastrophic engine damage. Don't delay this.", excludeEv: true },
  { name: "Water Pump", intervalMin: 60000, intervalMax: 80000, costMin: 400, costMax: 800, tip: "Often replaced alongside the timing belt to save on labor costs.", excludeEv: true },
  { name: "Drive Belts", intervalMin: 60000, intervalMax: 80000, costMin: 150, costMax: 300, tip: "Look for cracks, fraying, or glazing on the belt surface.", excludeEv: true },
  { name: "Differential Fluid", intervalMin: 60000, intervalMax: 80000, costMin: 150, costMax: 250, tip: "Especially important for AWD/4WD vehicles.", excludeEv: true },
  { name: "Brake Pads & Rotors", intervalMin: 80000, intervalMax: 100000, costMin: 300, costMax: 800, tip: "Listen for squealing sounds—that's the wear indicator telling you it's time." },
  { name: "Suspension Components", intervalMin: 80000, intervalMax: 100000, costMin: 500, costMax: 1500, tip: "Worn shocks increase stopping distance by up to 20%." },
  { name: "Battery", intervalMin: 80000, intervalMax: 100000, costMin: 150, costMax: 300, tip: "Clean battery terminals regularly to prevent corrosion and starting issues." },
  { name: "Clutch (Manual)", intervalMin: 100000, intervalMax: 100000, costMin: 1200, costMax: 2000, tip: "Avoid riding the clutch in traffic to extend its life.", excludeEv: true },
  { name: "Wheel Bearings", intervalMin: 100000, intervalMax: 100000, costMin: 400, costMax: 800, tip: "A humming noise that changes with speed often indicates worn bearings." },
  { name: "CV Joints/Axles", intervalMin: 100000, intervalMax: 100000, costMin: 600, costMax: 1200, tip: "Check CV boot integrity regularly—torn boots lead to joint failure.", excludeEv: true },
  { name: "Oxygen Sensors", intervalMin: 100000, intervalMax: 100000, costMin: 300, costMax: 600, tip: "Faulty O2 sensors can reduce fuel economy by up to 40%.", excludeEv: true },
];

const evParts: MaintenancePart[] = [
  { name: "Tire Rotation", intervalMin: 15000, intervalMax: 15000, costMin: 30, costMax: 50, tip: "EVs are heavier, causing faster tire wear. Rotate more frequently.", evOnly: true },
  { name: "Brake Fluid", intervalMin: 40000, intervalMax: 40000, costMin: 100, costMax: 150, tip: "Regenerative braking means less wear, but fluid still degrades.", evOnly: true },
  { name: "Cabin Air Filter", intervalMin: 10000, intervalMax: 15000, costMin: 40, costMax: 80, tip: "Same interval as ICE vehicles—air quality matters regardless of powertrain.", evOnly: true },
  { name: "Coolant (Battery/Motor)", intervalMin: 80000, intervalMax: 80000, costMin: 120, costMax: 180, tip: "EV coolant systems are critical for battery longevity and performance.", evOnly: true },
  { name: "Battery Health Check", intervalMin: 40000, intervalMax: 40000, costMin: 0, costMax: 50, tip: "Monitor battery degradation. Keep charge between 20-80% for longevity.", evOnly: true },
];

export function getPartsForVehicle(type: VehicleType): MaintenancePart[] {
  if (type === "ev") return evParts;
  return baseParts.filter(p => !p.excludeEv);
}

export function getIntervalMultiplier(type: VehicleType): number {
  if (type === "suv") return 0.75;
  if (type === "performance") return 0.8;
  return 1;
}

export interface AnalysisResult {
  critical: { part: MaintenancePart; lastDue: number }[];
  upcoming: { part: MaintenancePart; dueAt: number }[];
  ok: MaintenancePart[];
}

export function analyzeMileage(mileage: number, vehicleType: VehicleType): AnalysisResult {
  const parts = getPartsForVehicle(vehicleType);
  const multiplier = getIntervalMultiplier(vehicleType);
  const critical: AnalysisResult["critical"] = [];
  const upcoming: AnalysisResult["upcoming"] = [];
  const ok: MaintenancePart[] = [];

  for (const part of parts) {
    const interval = Math.round(part.intervalMax * multiplier);
    if (interval === 0) continue;
    const cyclesPassed = Math.floor(mileage / interval);
    const lastDue = cyclesPassed * interval;
    const nextDue = (cyclesPassed + 1) * interval;
    const kmSinceLast = mileage - lastDue;

    if (cyclesPassed > 0 && kmSinceLast < 2000) {
      // Recently due or overdue
      critical.push({ part, lastDue });
    } else if (nextDue - mileage <= 5000) {
      upcoming.push({ part, dueAt: nextDue });
    } else {
      ok.push(part);
    }
  }

  // Also mark overdue items as critical
  for (const part of parts) {
    const interval = Math.round(part.intervalMax * multiplier);
    if (interval === 0) continue;
    const remainder = mileage % interval;
    if (remainder > interval * 0.9 && !critical.some(c => c.part.name === part.name) && !upcoming.some(u => u.part.name === part.name)) {
      upcoming.push({ part, dueAt: mileage + (interval - remainder) });
    }
  }

  return { critical, upcoming, ok };
}
