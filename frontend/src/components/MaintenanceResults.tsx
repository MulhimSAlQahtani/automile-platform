import { AnalysisResult, VehicleType } from "@/lib/maintenance-data";
import { AlertTriangle, Clock, CheckCircle, ChevronDown, ChevronUp, ArrowLeft, MapPin, DollarSign, HelpCircle, Wrench } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import ScheduleSheet from "./ScheduleSheet";
import CostEstimatorSheet from "./CostEstimatorSheet";
import ExplainSheet from "./ExplainSheet";

interface Props {
  mileage: number;
  vehicleType: VehicleType;
  result: AnalysisResult;
  onBack: () => void;
}

function PartCard({ part, badge, badgeClass }: { part: { name: string; costMin: number; costMax: number; tip: string }; badge: string; badgeClass: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-secondary/50 overflow-hidden transition-all">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <Wrench className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{part.name}</p>
            <p className="text-xs text-muted-foreground">
              ${part.costMin}–${part.costMax}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", badgeClass)}>
            {badge}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-0">
          <div className="p-2.5 rounded-md bg-muted/50 text-xs text-muted-foreground leading-relaxed">
            💡 {part.tip}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaintenanceResults({ mileage, vehicleType, result, onBack }: Props) { 
  const vehicleLabels: Record<VehicleType, string> = {
    car: "Passenger Car",
    suv: "SUV / Truck",
    performance: "Performance Vehicle",
    ev: "Electric Vehicle",
  };

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  const totalCritical = result.critical.length;
  const totalUpcoming = result.upcoming.length;

  const allParts = [
    ...result.critical.map(({ part }) => ({ part, label: "Critical" as const })),
    ...result.upcoming.map(({ part }) => ({ part, label: "Upcoming" as const })),
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Maintenance Report</h2>
          <p className="text-xs text-muted-foreground">
            {vehicleLabels[vehicleType]} • {mileage.toLocaleString()} km
          </p>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-5 h-5 text-destructive mb-1" />
          <span className="text-lg font-bold text-destructive">{totalCritical}</span>
          <span className="text-[10px] text-destructive/70 uppercase font-medium">Critical</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg bg-warning/10 border border-warning/20">
          <Clock className="w-5 h-5 text-warning mb-1" />
          <span className="text-lg font-bold text-warning">{totalUpcoming}</span>
          <span className="text-[10px] text-warning/70 uppercase font-medium">Upcoming</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle className="w-5 h-5 text-success mb-1" />
          <span className="text-lg font-bold text-success">{result.ok.length}</span>
          <span className="text-[10px] text-success/70 uppercase font-medium">Good</span>
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
                badge={`~${(dueAt - mileage).toLocaleString()} km`}
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
        <InteractiveButton icon={MapPin} label="Find a certified shop near you" onClick={() => setScheduleOpen(true)} />
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
