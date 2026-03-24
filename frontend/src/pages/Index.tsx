import { useState } from "react";
import MileageInput from "@/components/MileageInput";
import MaintenanceResults from "@/components/MaintenanceResults";
import { analyzeMileage, AnalysisResult, VehicleType } from "@/lib/maintenance-data";

const Index = () => {
  const [result, setResult] = useState<{
    mileage: number;
    vehicleType: VehicleType;
    analysis: AnalysisResult;
  } | null>(null);

  const handleAnalyze = (mileage: number, vehicleType: VehicleType) => {
    const analysis = analyzeMileage(mileage, vehicleType);
    setResult({ mileage, vehicleType, analysis });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md">
        {result ? (
          <MaintenanceResults
            mileage={result.mileage}
            vehicleType={result.vehicleType}
            result={result.analysis}
            onBack={() => setResult(null)}
          />
        ) : (
          <MileageInput onAnalyze={handleAnalyze} />
        )}
      </div>
    </div>
  );
};

export default Index;
