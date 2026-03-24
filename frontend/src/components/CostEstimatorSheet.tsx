import { DollarSign, Wrench, User } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { MaintenancePart } from "@/lib/maintenance-data";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parts: { part: MaintenancePart; label: string }[];
}

export default function CostEstimatorSheet({ open, onOpenChange, parts }: Props) {
  const totalMin = parts.reduce((s, { part }) => s + part.costMin, 0);
  const totalMax = parts.reduce((s, { part }) => s + part.costMax, 0);
  const avgCost = (totalMin + totalMax) / 2;
  const partsEstimate = Math.round(avgCost * 0.4);
  const laborEstimate = Math.round(avgCost * 0.6);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-foreground">
            <DollarSign className="w-5 h-5 text-primary" />
            Cost Estimator
          </DrawerTitle>
          <DrawerDescription>
            Estimated breakdown for all maintenance items needing attention.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto flex flex-col gap-3 max-h-[50vh]">
          {parts.map(({ part, label }) => {
            const avg = (part.costMin + part.costMax) / 2;
            return (
              <div key={part.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{part.name}</p>
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    label === "Critical" ? "text-destructive" : "text-warning"
                  )}>{label}</span>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-foreground">${part.costMin}–${part.costMax}</p>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span>Parts ~${Math.round(avg * 0.4)}</span>
                    <span>Labor ~${Math.round(avg * 0.6)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mx-4 mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-foreground">Estimated Total</span>
            <span className="text-lg font-bold text-primary">${totalMin}–${totalMax}</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Parts ~${partsEstimate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Labor ~${laborEstimate}</span>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <button className="w-full h-10 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary transition-all">
              Close
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
