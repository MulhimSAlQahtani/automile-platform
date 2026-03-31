import { useState, useEffect } from "react";
import MileageInput from "@/components/MileageInput";
import MaintenanceResults from "@/components/MaintenanceResults";
import { VehicleState, VehicleType, analyzeMileageAdvanced, AnalysisResult } from "@/lib/maintenance-data";
import { Car, Plus, ChevronRight, Settings, Megaphone, Shield, Lock, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "@/lib/haptics";
import { auth, db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

const Index = () => {
  const [vehicles, setVehicles] = useState<VehicleState[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVehicle, setActiveVehicle] = useState<VehicleState | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user && auth?.app?.name !== "mock-app") {
      navigate("/");
      return;
    }

    if (auth?.app?.name === "mock-app") {
      // Use mock data if in mock mode
      const mockGarage: VehicleState[] = [
        {
          id: "v1",
          make: "Toyota",
          model: "Camry",
          year: 2022,
          vin: "JTN11111000000",
          currentMileage: 54000,
          type: "car",
          lastPerformedMileage: {
            "Engine Oil & Oil Filter": 49000,
            "Air Filter": 30000,
          }
        },
        {
          id: "v2",
          make: "Ford",
          model: "F-150",
          year: 2019,
          vin: "1FT11111000000",
          currentMileage: 110000,
          type: "truck",
          lastPerformedMileage: {
            "Engine Oil & Oil Filter": 105000,
            "Transmission Fluid": 80000,
            "Spark Plugs (Copper)": 90000
          }
        }
      ];
      setVehicles(mockGarage);
      setLoading(false);
      return;
    }

    // Real Firestore Listener
    const q = query(
      collection(db, "users", user!.uid, "vehicles"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vehicleList: VehicleState[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VehicleState));
      setVehicles(vehicleList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSelectVehicle = (vehicle: VehicleState) => {
    hapticFeedback.selection();
    setActiveVehicle(vehicle);
    // Determine the baseline analysis using standard OEM tier tracking
    const analysis = analyzeMileageAdvanced(vehicle, {});
    setResult(analysis);
  };

  const handleBackToGarage = () => {
    setActiveVehicle(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md">
        {result && activeVehicle ? (
          <MaintenanceResults
            vehicleState={activeVehicle}
            result={result}
            onBack={handleBackToGarage}
          />
        ) : (
          <div className="flex flex-col gap-6 px-4 py-8 pt-safe pb-safe animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">My Garage</h1>
                <p className="text-sm text-muted-foreground">Select a vehicle to view its health.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    hapticFeedback.light();
                    navigate('/app/analytics');
                  }} 
                  className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Megaphone className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => hapticFeedback.light()}
                  className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-muted font-bold transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Security & Blockchain Nodes */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button 
                onClick={() => navigate('/app/privacy')}
                className="p-3 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/30 transition-all flex flex-col items-center gap-1 group"
              >
                <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Privacy</span>
              </button>
              <button 
                onClick={() => navigate('/app/vault')}
                className="p-3 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/30 transition-all flex flex-col items-center gap-1 group"
              >
                <Lock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Vault</span>
              </button>
              <button 
                onClick={() => navigate('/app/blockchain')}
                className="p-3 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/30 transition-all flex flex-col items-center gap-1 group"
              >
                <Database className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[8px] font-black uppercase tracking-tighter">Web3</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Plus className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm font-bold uppercase tracking-wider">Syncing Garage...</p>
                </div>
              ) : vehicles.length > 0 ? (
                vehicles.map((v) => (
                  <button 
                    key={v.id}
                    onClick={() => handleSelectVehicle(v)}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary hover:border-primary/50 transition-all text-left animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm">{v.year} {v.make} {v.model}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">VIN: ••••{v.vin.slice(-4)} | {v.currentMileage.toLocaleString()} km</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border rounded-xl bg-secondary/5 text-center px-8">
                  <Car className="w-12 h-12 text-muted-foreground/30 mb-4" />
                  <p className="text-sm font-bold text-foreground mb-1">Your Garage is Empty</p>
                  <p className="text-[10px] text-muted-foreground">Register your first vehicle to start receiving predictive maintenance alerts.</p>
                </div>
              )}

              <button 
                onClick={() => navigate('/app/add-vehicle')}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all w-full mt-2"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-semibold">Add New Vehicle</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
