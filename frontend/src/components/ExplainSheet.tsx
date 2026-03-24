import { HelpCircle, AlertTriangle, Clock } from "lucide-react";
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

const consequences: Record<string, string> = {
  "Engine Oil & Oil Filter": "Delaying oil changes causes sludge buildup, accelerated engine wear, and can lead to complete engine failure — a repair costing $3,000–$8,000+.",
  "Air Filter": "A clogged air filter starves the engine of oxygen, reducing power by up to 10% and increasing fuel consumption. Prolonged neglect can damage the mass airflow sensor ($200–$400).",
  "Cabin Air Filter": "A dirty cabin filter reduces HVAC efficiency, causes musty odors, and can trigger allergies. It also strains the blower motor, shortening its life.",
  "Fuel Filter": "A blocked fuel filter causes hesitation, stalling, and can damage the fuel pump ($400–$800) by forcing it to work harder.",
  "Spark Plugs (Copper)": "Worn spark plugs cause misfires, rough idling, poor fuel economy, and can damage the catalytic converter ($1,000–$2,500) over time.",
  "Tire Rotation": "Uneven tire wear shortens tire life by 30–50% and can cause unsafe handling, especially in wet conditions.",
  "Transmission Fluid": "Old transmission fluid loses its lubricating properties, causing harsh shifts, overheating, and eventually transmission failure ($2,000–$5,000+).",
  "Brake Fluid": "Moisture-contaminated brake fluid lowers the boiling point, causing brake fade under heavy braking — a critical safety hazard.",
  "Coolant": "Degraded coolant can't prevent corrosion or regulate temperature, risking overheating and a blown head gasket ($1,500–$3,000).",
  "Spark Plugs (Iridium/Platinum)": "Same risks as copper plugs — misfires, catalyst damage, and poor performance — but these last longer so the window before failure is wider.",
  "Timing Belt/Chain": "A snapped timing belt can destroy valves, pistons, and the head — catastrophic engine damage often totaling $3,000–$7,000.",
  "Water Pump": "A failing water pump causes coolant leaks and overheating. If it seizes, it can snap the timing belt, causing cascading engine damage.",
  "Drive Belts": "A broken serpentine belt disables the alternator, power steering, and A/C simultaneously, leaving you stranded.",
  "Differential Fluid": "Worn differential fluid causes grinding, excessive heat, and eventual gear failure — especially dangerous in AWD/4WD vehicles.",
  "Brake Pads & Rotors": "Metal-on-metal contact destroys rotors (adding $200–$500 to the repair) and drastically increases stopping distance — a direct safety risk.",
  "Suspension Components": "Worn shocks/struts increase stopping distance by 20%, cause uneven tire wear, and reduce vehicle stability in emergencies.",
  "Battery": "An aging battery causes slow cranking, electrical issues, and can leave you stranded without warning, especially in extreme temperatures.",
  "Clutch (Manual)": "A slipping clutch wastes fuel, damages the flywheel ($300–$600 extra), and eventually leaves you unable to drive.",
  "Wheel Bearings": "Failed wheel bearings cause wheel wobble, grinding noise, and in extreme cases the wheel can lock up or detach at speed.",
  "CV Joints/Axles": "A broken CV joint causes loss of power to the wheels. If the boot is torn, dirt enters and accelerates joint destruction.",
  "Oxygen Sensors": "Faulty O2 sensors cause up to 40% worse fuel economy, increased emissions, and can damage the catalytic converter.",
  "Coolant (Battery/Motor)": "EV battery coolant is critical — degraded coolant causes battery overheating, reduced range, and accelerated cell degradation.",
  "Battery Health Check": "Without monitoring, you won't catch early signs of cell imbalance or degradation, which can lead to sudden range loss and expensive pack replacement.",
};

export default function ExplainSheet({ open, onOpenChange, parts }: Props) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-foreground">
            <HelpCircle className="w-5 h-5 text-primary" />
            AI Explanations
          </DrawerTitle>
          <DrawerDescription>
            Why each part needs attention and what happens if you delay.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto flex flex-col gap-4 max-h-[55vh]">
          {parts.map(({ part, label }) => (
            <div key={part.name} className="rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-start gap-2 mb-2">
                {label === "Critical" ? (
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">{part.name}</p>
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    label === "Critical" ? "text-destructive" : "text-warning"
                  )}>{label}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                💡 {part.tip}
              </p>
              {consequences[part.name] && (
                <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-xs text-destructive/90 leading-relaxed">
                    ⚠️ <span className="font-semibold">If you delay:</span> {consequences[part.name]}
                  </p>
                </div>
              )}
            </div>
          ))}
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
