import { useState } from "react";
import { Gauge, Car, Truck, Zap, Trophy } from "lucide-react";
import { VehicleType } from "@/lib/maintenance-data";
import { cn } from "@/lib/utils";

interface MileageInputProps {
  onAnalyze: (mileage: number, vehicleType: VehicleType) => void;
}

const vehicleTypes: { type: VehicleType; label: string; icon: typeof Car; desc: string }[] = [
  { type: "car", label: "Passenger Car", icon: Car, desc: "Standard sedan/hatchback" },
  { type: "suv", label: "SUV / Truck", icon: Truck, desc: "Heavier vehicles, shorter intervals" },
  { type: "performance", label: "Performance", icon: Trophy, desc: "Sports & high-performance" },
  { type: "ev", label: "Electric Vehicle", icon: Zap, desc: "EV-specific maintenance" },
];

export default function MileageInput({ onAnalyze }: MileageInputProps) {
  const [mileage, setMileage] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");

  const handleSubmit = () => {
    const km = parseInt(mileage.replace(/,/g, ""), 10);
    if (km > 0) onAnalyze(km, vehicleType);
  };

  const formattedMileage = mileage
    ? parseInt(mileage.replace(/,/g, ""), 10).toLocaleString()
    : "";

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-12 animate-slide-up">
      {/* Logo & Title */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 glow-primary">
          <Gauge className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gradient-primary">
          AutoMile Pro
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Enter your vehicle's mileage to get personalized maintenance recommendations
        </p>
      </div>

      {/* Mileage Input */}
      <div className="w-full max-w-sm">
        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          Current Mileage
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={formattedMileage}
            onChange={(e) => setMileage(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="e.g. 45,000"
            className="w-full h-14 px-4 pr-14 rounded-lg bg-secondary border border-border text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            km
          </span>
        </div>
      </div>

      {/* Vehicle Type */}
      <div className="w-full max-w-sm">
        <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Vehicle Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {vehicleTypes.map(({ type, label, icon: Icon, desc }) => (
            <button
              key={type}
              onClick={() => setVehicleType(type)}
              className={cn(
                "flex flex-col items-start gap-1 p-3 rounded-lg border transition-all text-left",
                vehicleType === type
                  ? "border-primary bg-primary/10 glow-primary"
                  : "border-border bg-secondary hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("w-4 h-4", vehicleType === type ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-sm font-semibold", vehicleType === type ? "text-primary" : "text-foreground")}>
                  {label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleSubmit}
        disabled={!mileage || parseInt(mileage, 10) <= 0}
        className="w-full max-w-sm h-12 rounded-lg bg-primary text-primary-foreground font-bold text-base tracking-wide hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all glow-primary"
      >
        Analyze My Vehicle
      </button>

      <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
        ⚠️ These are general recommendations. Always consult your owner's manual for specific intervals.
      </p>
    </div>
  );
}
