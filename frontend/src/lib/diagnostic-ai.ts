export interface DTCExplanation {
  code: string;
  system: "Powertrain" | "Chassis" | "Body" | "Network";
  definition: string;
  severity: "Critical" | "Moderate" | "Minor";
  symptoms: string[];
  affectedParts: string[];   // Correlates directly with ML Engine parts list
  estimatedRepairCostMin: number;
  estimatedRepairCostMax: number;
}

// Comprehensive mapping of standard OBD-II Diagnostic Trouble Codes
const dtcDatabase: Record<string, DTCExplanation> = {
  "P0300": {
    code: "P0300",
    system: "Powertrain",
    definition: "Random/Multiple Cylinder Misfire Detected",
    severity: "Critical",
    symptoms: ["Rough idle", "Check Engine Light flashing", "Loss of power"],
    affectedParts: ["Spark Plugs (Copper)", "Spark Plugs (Iridium/Platinum)"],
    estimatedRepairCostMin: 150,
    estimatedRepairCostMax: 400
  },
  "P0420": {
    code: "P0420",
    system: "Powertrain",
    definition: "Catalyst System Efficiency Below Threshold",
    severity: "Moderate",
    symptoms: ["Reduced fuel economy", "Failed emissions test"],
    affectedParts: ["Oxygen Sensors"], // The AI actively maps this to O2 sensors before jumping straight to a Cat replacement
    estimatedRepairCostMin: 300,
    estimatedRepairCostMax: 1500
  },
  "P0171": {
    code: "P0171",
    system: "Powertrain",
    definition: "System Too Lean (Bank 1)",
    severity: "Moderate",
    symptoms: ["Hesitation on acceleration", "Poor gas mileage"],
    affectedParts: ["Fuel Filter", "Air Filter"], 
    estimatedRepairCostMin: 100,
    estimatedRepairCostMax: 300
  },
  "P0500": {
    code: "P0500",
    system: "Powertrain",
    definition: "Vehicle Speed Sensor Malfunction",
    severity: "Minor",
    symptoms: ["Speedometer not working", "ABS light illuminates"],
    affectedParts: ["Wheel Bearings"],
    estimatedRepairCostMin: 150,
    estimatedRepairCostMax: 250
  }
};

/**
 * Core Intelligence Matrix
 * Translates an array of Hex error codes intercepted from the OBD scanner and outputs human-readable diagnostic packets.
 */
export function analyzeDiagnosticTroubleCodes(codes: string[]): DTCExplanation[] {
  const parsedExplanations: DTCExplanation[] = [];
  
  for (const code of codes) {
    // Force standard format (e.g. p0300 -> P0300)
    const upperCode = code.toUpperCase().trim();
    
    if (dtcDatabase[upperCode]) {
      parsedExplanations.push(dtcDatabase[upperCode]);
    } else {
      // Fallback generator for generic non-mapped OBD codes
      parsedExplanations.push({
        code: upperCode,
        system: upperCode.startsWith("C") ? "Chassis" : upperCode.startsWith("B") ? "Body" : "Powertrain",
        definition: "Unknown Hardware Manufacturer Specification Fault",
        severity: "Moderate",
        symptoms: ["Review vehicle diagnostic manual"],
        affectedParts: [],
        estimatedRepairCostMin: 100,
        estimatedRepairCostMax: 500
      });
    }
  }

  // Sort by severity (Critical floats to top)
  return parsedExplanations.sort((a, b) => {
    const severities = { "Critical": 3, "Moderate": 2, "Minor": 1 };
    return severities[b.severity] - severities[a.severity];
  });
}
