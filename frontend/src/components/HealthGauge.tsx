import { Activity, AlertTriangle, ShieldCheck, TrendingDown } from "lucide-react";
import { HealthContext } from "@/lib/ml-engine";
import { cn } from "@/lib/utils";

interface Props {
  context: HealthContext;
}

export default function HealthGauge({ context }: Props) {
  const { healthScore, riskLevel, predictions } = context;

  // Dynamic Color Mapping based on the algorithmic score
  let strokeColor = "text-success";
  let bgGradient = "from-success/20 to-transparent";
  if (healthScore < 40) {
    strokeColor = "text-destructive";
    bgGradient = "from-destructive/20 to-transparent";
  } else if (healthScore < 65) {
    strokeColor = "text-warning";
    bgGradient = "from-warning/20 to-transparent";
  } else if (healthScore < 85) {
    strokeColor = "text-primary";
    bgGradient = "from-primary/20 to-transparent";
  }

  // Calculate SVG Circle offsets for the Gauge
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      
      {/* 1. Core Health Score Gauge */}
      <div className={cn("rounded-2xl border border-border bg-gradient-to-b p-6 flex flex-col items-center justify-center relative overflow-hidden", bgGradient)}>
        <div className="absolute top-3 right-3 opacity-20">
          <Activity className="w-24 h-24" />
        </div>
        
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 z-10 text-center">
          Vehicle Health Score
        </h3>

        <div className="relative flex items-center justify-center z-10">
          {/* Background Track */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-secondary"
            />
            {/* Dynamic Progress Indicator */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn("transition-all duration-1000 ease-out", strokeColor)}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-black tracking-tighter animate-in zoom-in-50 duration-700", strokeColor)}>
              {healthScore}
            </span>
          </div>
        </div>

        <div className={cn(
          "mt-4 flex items-center justify-center gap-2 z-10 bg-background/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-border transition-all duration-500",
          healthScore < 40 && "animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.2)]"
        )}>
          {healthScore >= 85 ? (
            <ShieldCheck className={cn("w-4 h-4", strokeColor)} />
          ) : (
             <AlertTriangle className={cn("w-4 h-4", strokeColor)} />
          )}
           <span className="text-xs font-bold text-foreground">Risk Level: <span className={strokeColor}>{riskLevel}</span></span>
        </div>
      </div>

      {/* 2. ML Failure Predictions Array */}
      {predictions.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
             <TrendingDown className="w-4 h-4 text-warning" />
             AI Failure Probabilities
          </h4>
          
          <div className="grid grid-cols-1 gap-2">
            {predictions.slice(0, 3).map((pred) => (
              <div key={pred.partName} className="p-3 rounded-lg border border-warning/20 bg-warning/5 flex flex-col gap-2 relative overflow-hidden">
                {/* Visual Danger Bar indicating Severity Weight */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 bg-warning/50" 
                  style={{ opacity: pred.severityWeight / 10 }} 
                />
                
                <div className="flex justify-between items-center pl-2">
                  <p className="text-sm font-bold text-foreground">{pred.partName}</p>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-0.5 bg-secondary rounded-full">
                    Severity: {pred.severityWeight}/10
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-1 pl-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">30-Day</span>
                    <span className={cn("text-xs font-bold", pred.prob30Days > 75 ? "text-destructive" : "text-foreground")}>
                      {pred.prob30Days}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">60-Day</span>
                    <span className={cn("text-xs font-bold", pred.prob60Days > 75 ? "text-destructive" : "text-warning")}>
                      {pred.prob60Days}%
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground">90-Day</span>
                    <span className="text-xs font-bold text-destructive">
                      {pred.prob90Days}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {predictions.length > 3 && (
             <p className="text-xs text-muted-foreground text-center">+ {predictions.length - 3} more minor risks identified.</p>
          )}
        </div>
      )}
    </div>
  );
}
