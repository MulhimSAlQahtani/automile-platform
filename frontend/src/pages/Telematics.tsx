import { Map, AlertTriangle, BatteryCharging, Flag, TrendingUp, Navigation2 } from "lucide-react";
import { useState } from "react";

interface TripLog {
  id: string;
  date: string;
  distanceKm: number;
  durationMinutes: number;
  avgSpeed: number;
  efficiencyScore: number; // 0-100 indicating how smoothly they drove
  hardBrakingEvents: number;
  rapidAccelEvents: number;
}

// Mocked Trip Ledger utilizing simulated historical Telemetry
const mockTrips: TripLog[] = [
  { id: "t1", date: "Today, 8:42 AM", distanceKm: 24.5, durationMinutes: 32, avgSpeed: 45, efficiencyScore: 88, hardBrakingEvents: 1, rapidAccelEvents: 2 },
  { id: "t2", date: "Yesterday, 5:15 PM", distanceKm: 18.2, durationMinutes: 45, avgSpeed: 24, efficiencyScore: 65, hardBrakingEvents: 4, rapidAccelEvents: 6 },
  { id: "t3", date: "Mar 25, 9:00 AM", distanceKm: 65.0, durationMinutes: 55, avgSpeed: 71, efficiencyScore: 94, hardBrakingEvents: 0, rapidAccelEvents: 1 }
];

export default function Telematics() {
  const [activeTab, setActiveTab] = useState<"trips" | "efficiency">("trips");

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto animate-slide-up pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
           <Map className="w-6 h-6 text-primary" /> Telematics
        </h1>
        <p className="text-sm text-muted-foreground">GPS Location & Driving Behavior Logging.</p>
      </div>

      {/* Primary KPI Header */}
      <div className="grid grid-cols-2 gap-3 mt-2">
         <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-1">
            <span className="text-2xl font-black text-primary">82/100</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Efficiency</span>
         </div>
         <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex flex-col gap-1">
            <span className="text-2xl font-black text-destructive">14</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Hard Braking (Monthly)</span>
         </div>
      </div>

      <div className="flex bg-secondary p-1 rounded-lg gap-1 border border-border">
        <button onClick={() => setActiveTab("trips")} className={`flex-1 flex items-center justify-center h-9 text-xs font-bold rounded-md transition-all ${activeTab === 'trips' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
           Trip Ledger
        </button>
        <button onClick={() => setActiveTab("efficiency")} className={`flex-1 flex items-center justify-center h-9 text-xs font-bold rounded-md transition-all ${activeTab === 'efficiency' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
           Insights
        </button>
      </div>

      {activeTab === "trips" && (
        <div className="flex flex-col gap-3">
           {mockTrips.map(trip => (
              <div key={trip.id} className="p-4 rounded-xl border border-border bg-secondary/50 flex flex-col gap-3 relative overflow-hidden">
                 <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Navigation2 className="w-4 h-4 text-primary" /> {trip.date}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${trip.efficiencyScore > 85 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                       Score: {trip.efficiencyScore}
                    </span>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                       <span className="text-lg font-black text-foreground">{trip.distanceKm}</span>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">km</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-lg font-black text-foreground">{trip.durationMinutes}</span>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mins</span>
                    </div>
                    <div className="flex flex-col border-l border-border/50 pl-2">
                       <span className="text-lg font-black text-foreground">{trip.avgSpeed}</span>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">km/h</span>
                    </div>
                 </div>

                 {(trip.hardBrakingEvents > 0 || trip.rapidAccelEvents > 0) && (
                    <div className="flex gap-4 mt-2 border-t border-border/50 pt-3">
                       {trip.hardBrakingEvents > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-destructive font-bold">
                             <AlertTriangle className="w-3.5 h-3.5" /> {trip.hardBrakingEvents} Hard Brakes
                          </div>
                       )}
                       {trip.rapidAccelEvents > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-warning font-bold">
                             <TrendingUp className="w-3.5 h-3.5" /> {trip.rapidAccelEvents} Rapid Accel
                          </div>
                       )}
                    </div>
                 )}
              </div>
           ))}
        </div>
      )}

      {activeTab === "efficiency" && (
         <div className="flex flex-col gap-4">
             <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-4">
                 <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
                 <div>
                    <h3 className="text-sm font-bold text-destructive">Tire Wear Warning</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                       Our hardware telemetry detected 14 Hard Braking events over the last 30 days. This driving pattern significantly degrades Brake Pad lifespan and accelerates Tire Tread wear by an estimated <strong className="text-foreground">22%</strong>.
                    </p>
                 </div>
             </div>
             
             <div className="p-5 rounded-xl bg-success/10 border border-success/20 flex items-start gap-4 mt-2">
                 <BatteryCharging className="w-8 h-8 text-success shrink-0" />
                 <div>
                    <h3 className="text-sm font-bold text-success">Optimal Highway Cruising</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                       Your recent long-distance trip established a constant 71km/h average speed. This RPM stabilization drastically minimizes engine load and optimizes total long-term fuel economy!
                    </p>
                 </div>
             </div>
         </div>
      )}
    </div>
  );
}
