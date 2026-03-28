import { Wrench, PiggyBank, PackageSearch } from "lucide-react";
import { BundleOptimization } from "@/lib/tco-calculator";

interface Props {
  bundles: BundleOptimization[];
}

export default function ScheduleOptimizer({ bundles }: Props) {
  if (bundles.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-1 uppercase tracking-wider">
          <PackageSearch className="w-4 h-4 text-primary" /> Schedule Optimizer
        </h3>
        <p className="text-xs text-muted-foreground">Combine overlapping services to heavily reduce repeat shop labor fees.</p>
      </div>

      <div className="flex flex-col gap-3">
        {bundles.map((bundle, idx) => (
          <div key={idx} className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3 relative overflow-hidden">
            {/* Ribbon */}
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-bl-lg text-white ${bundle.urgency === 'Immediate' ? 'bg-destructive' : 'bg-primary'}`}>
              {bundle.urgency}
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0 pr-16 border-b border-border/50 pb-3">
                <h4 className="text-sm font-bold text-foreground">{bundle.bundleName}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Includes: <span className="text-foreground font-medium">{bundle.partsIncluded.join(" + ")}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Est. Costs</span>
                 <span className="text-sm font-bold text-foreground">${bundle.totalCostMin} - ${bundle.totalCostMax}</span>
              </div>
              <div className="flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-lg border border-success/20">
                <PiggyBank className="w-4 h-4 text-success" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-success/80 uppercase font-bold tracking-wider leading-none">Labor Saved</span>
                  <span className="text-sm font-black text-success leading-none">~${bundle.laborSavings}</span>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-2 h-9 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95">
               Select Bundle & Find Shop
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
