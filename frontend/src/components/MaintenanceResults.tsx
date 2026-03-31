import { AnalysisResult, VehicleState, VehicleType } from "@/lib/maintenance-data";
import { AlertTriangle, Clock, CheckCircle, ChevronDown, ChevronUp, ArrowLeft, MapPin, DollarSign, HelpCircle, Wrench, ShieldCheck, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ScheduleSheet from "./ScheduleSheet";
import CostEstimatorSheet from "./CostEstimatorSheet";
import ExplainSheet from "./ExplainSheet";
import HealthGauge from "./HealthGauge";
import ScheduleOptimizer from "./ScheduleOptimizer";
import { calculateFailureProbabilities, calculateHealthScore } from "@/lib/ml-engine";
import { optimizeScheduleBundles } from "@/lib/tco-calculator";

interface Props {
  vehicleState: VehicleState;
  result: AnalysisResult;
  onBack: () => void;
}

function PartCard({ part, badge, badgeClass }: { part: { name: string; costMin: number; costMax: number; tip: string }; badge: string; badgeClass: string }) {
  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const handleMarkAsDone = () => {
    setMarking(true);
    // Simulated Backend Call to logServiceAndReset logic
    setTimeout(() => {
      setMarking(false);
      alert(`Successfully marked ${part.name} as done!`);
    }, 1200);
  };

  const [isPremium, setIsPremium] = useState(false);

  const displayCostMin = isPremium ? Math.round(part.costMin * 1.5) : part.costMin;
  const displayCostMax = isPremium ? Math.round(part.costMax * 1.5) : part.costMax;

  return (
    <div className={cn("rounded-lg border border-border overflow-hidden transition-all", isPremium ? "bg-primary/5 border-primary/30 shadow-sm" : "bg-secondary/50")}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <Wrench className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{part.name}</p>
            <p className={cn("text-xs flex items-center gap-1", isPremium ? "text-primary font-bold" : "text-muted-foreground")}>
              <DollarSign className="w-3 h-3" />
              {displayCostMin.toLocaleString()}–{displayCostMax.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", badgeClass)}>
            {badge}
          </span>
          <div className="flex items-center gap-1">
            <ShieldCheck className={cn("w-3 h-3", isPremium ? "text-primary" : "text-primary/70")} />
            <span className={cn("text-[10px] uppercase font-bold", isPremium ? "text-primary" : "text-muted-foreground")}>
              {isPremium ? "Premium Performance" : "OEM Standard"}
            </span>
          </div>
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-0 flex flex-col gap-3">
          <div className="p-2.5 rounded-md bg-muted/50 text-xs text-muted-foreground leading-relaxed border border-border/50">
            💡 {part.tip}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setIsPremium(!isPremium)}
              className={cn(
                "h-8 rounded transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border",
                isPremium ? "bg-primary text-primary-foreground border-primary" : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
              )}
            >
              <Tag className="w-3 h-3" />
              {isPremium ? "Standard Quality" : "Upgrade to Premium"}
            </button>
            <button 
              disabled={marking}
              onClick={handleMarkAsDone}
              className="h-8 rounded bg-success/10 text-success hover:bg-success/20 transition-colors text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-success/20"
            >
              {marking ? (
                <span className="w-3 h-3 border-2 border-success/30 border-t-success rounded-full animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              {marking ? "Logging..." : "Mark as Done"}
            </button>
          </div>
          <button 
             onClick={() => setScheduleOpen(true)}
             className="w-full h-9 mt-1 rounded-lg bg-secondary border border-border/50 text-muted-foreground text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary/80 hover:text-foreground transition-all"
          >
             <MapPin className="w-3.5 h-3.5" /> Book Single Repair Shop
          </button>
        </div>
      )}
      <ScheduleSheet open={scheduleOpen} onOpenChange={setScheduleOpen} partName={part.name} />
    </div>
  );
}

export default function MaintenanceResults({ vehicleState, result, onBack }: Props) { 
  const vehicleLabels: Record<VehicleType, string> = {
    car: "Passenger Car",
    suv: "SUV / Truck",
    truck: "SUV / Truck",
    performance: "Performance",
    ev: "Electric Vehicle",
  };

  const navigate = useNavigate();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  const totalCritical = result.critical.length;
  const totalUpcoming = result.upcoming.length;

  // ML Processing Pipelines
  const failurePredictions = calculateFailureProbabilities(result);
  const healthContext = calculateHealthScore(result, failurePredictions);
  const bundleOptimizations = optimizeScheduleBundles(result);

  const allParts = [
    ...result.critical.map(({ part }) => ({ part, label: "Critical" as const })),
    ...result.upcoming.map(({ part }) => ({ part, label: "Upcoming" as const })),
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 pt-safe pb-safe animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {vehicleState.year} {vehicleState.make} {vehicleState.model}
          </h2>
          <p className="text-xs text-muted-foreground">
            {vehicleLabels[vehicleState.type]} • {vehicleState.currentMileage.toLocaleString()} km
          </p>
        </div>
      </div>

      {/* Primary ML Health Gauge Visualization */}
      <HealthGauge context={healthContext} />

      {/* Schedule Optimizer (Bundles overlapping parts) */}
      <ScheduleOptimizer bundles={bundleOptimizations} />

      {/* Summary Chips */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 flex flex-col items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-destructive mb-2" />
          <span className="text-3xl font-black text-destructive leading-none">{totalCritical}</span>
          <span className="text-[10px] font-bold text-destructive/80 uppercase tracking-widest mt-1">Critical</span>
        </div>
        <div className="rounded-xl border border-warning/20 bg-warning/10 p-3 flex flex-col items-center justify-center">
          <Clock className="w-6 h-6 text-warning mb-2" />
          <span className="text-3xl font-black text-warning leading-none">{totalUpcoming}</span>
          <span className="text-[10px] font-bold text-warning/80 uppercase tracking-widest mt-1">Upcoming</span>
        </div>
      </div>

      {/* Critical Section */}
      {totalCritical > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-destructive mb-3 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" /> Critical — Replace Now
          </h3>
          <div className="flex flex-col gap-2">
            {result.critical.map(({ part }) => (
              <PartCard
                key={part.name}
                part={part}
                badge="Overdue"
                badgeClass="bg-destructive/20 text-destructive"
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Section */}
      {totalUpcoming > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-sm font-bold text-warning mb-3 uppercase tracking-wider">
            <Clock className="w-4 h-4" /> Upcoming — Next 5,000 km
          </h3>
          <div className="flex flex-col gap-2">
            {result.upcoming.map(({ part, dueAt }) => (
              <PartCard
                key={part.name}
                part={part}
                badge={`Due in ${(dueAt - vehicleState.currentMileage).toLocaleString()} km`}
                badgeClass="bg-warning/20 text-warning"
              />
            ))}
          </div>
        </section>
      )}

      {/* All Good */}
      {totalCritical === 0 && totalUpcoming === 0 && (
        <div className="flex flex-col items-center py-8 gap-3">
          <CheckCircle className="w-12 h-12 text-success" />
          <p className="text-lg font-bold text-success">All systems go!</p>
          <p className="text-sm text-muted-foreground text-center">
            No immediate maintenance needed. Keep up the great work!
          </p>
        </div>
      )}

      {/* Interactive Options */}
      <section className="flex flex-col gap-2 pt-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          What would you like to do next?
        </h3>
        <InteractiveButton 
          icon={MapPin} 
          label="Find a certified shop near you" 
          onClick={() => navigate('/app/shops')} 
        />
        <InteractiveButton icon={DollarSign} label="Get detailed cost estimates" onClick={() => setCostOpen(true)} />
        <InteractiveButton icon={HelpCircle} label="Explain these recommendations" onClick={() => setExplainOpen(true)} />
      </section>

      <p className="text-[10px] text-muted-foreground/50 text-center pb-4">
        ⚠️ General guidance only. Consult your owner's manual for exact intervals.
      </p>

      <ScheduleSheet open={scheduleOpen} onOpenChange={setScheduleOpen} />
      <CostEstimatorSheet open={costOpen} onOpenChange={setCostOpen} parts={allParts} />
      <ExplainSheet open={explainOpen} onOpenChange={setExplainOpen} parts={allParts} />
    </div>
  );
}

function InteractiveButton({ icon: Icon, label, onClick }: { icon: typeof MapPin; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/30 transition-all text-left"
    >
      <Icon className="w-4 h-4 text-primary shrink-0" />
      <span className="text-sm text-foreground">{label}</span>
    </button>
  );
}
