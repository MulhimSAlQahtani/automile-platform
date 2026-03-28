import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Save, AlertCircle } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { VehicleType } from "@/lib/maintenance-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AddVehicle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    currentMileage: 0,
    type: "car" as VehicleType,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateVin = (vin: string) => {
    // Basic VIN sanitization (O -> 0)
    const sanitized = vin.toUpperCase().replace(/O/g, "0");
    return sanitized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.make || !formData.model || !formData.vin) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const sanitizedVin = validateVin(formData.vin);
    if (sanitizedVin.length !== 17) {
      toast.error("VIN must be exactly 17 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      
      if (auth?.app?.name === "mock-app") {
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success("Mock UI Mode: Vehicle Registered Locally!");
        navigate("/app");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to register a vehicle.");
        navigate("/");
        return;
      }

      const vehicleData = {
        ...formData,
        vin: sanitizedVin,
        currentMileage: Number(formData.currentMileage),
        year: Number(formData.year),
        userId: user.uid,
        createdAt: serverTimestamp(),
        lastPerformed: {}, // For maintenance tracking
      };

      await addDoc(collection(db, "users", user.uid, "vehicles"), vehicleData);
      
      toast.success("Vehicle registered successfully!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Failed to register vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 text-foreground pb-24">
      <div className="w-full max-w-md flex flex-col gap-6 animate-slide-up">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">Add New Vehicle</h1>
            <p className="text-xs text-muted-foreground">Register your car for predictive maintenance.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleChange("year", e.target.value)}
                placeholder="2022"
                className="bg-secondary/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Vehicle Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger className="bg-secondary/30">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="ev">Electric Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              value={formData.make}
              onChange={(e) => handleChange("make", e.target.value)}
              placeholder="e.g. Toyota"
              className="bg-secondary/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => handleChange("model", e.target.value)}
              placeholder="e.g. Camry"
              className="bg-secondary/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
            <Input
              id="vin"
              value={formData.vin}
              onChange={(e) => handleChange("vin", e.target.value)}
              placeholder="17 character VIN"
              maxLength={17}
              className="bg-secondary/30 font-mono uppercase"
              required
            />
            <p className="text-[10px] text-muted-foreground flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              VIN helps identify specific engine types and part requirements.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Current Mileage (km)</Label>
            <Input
              id="mileage"
              type="number"
              value={formData.currentMileage}
              onChange={(e) => handleChange("currentMileage", e.target.value)}
              placeholder="54000"
              className="bg-secondary/30"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 font-black uppercase tracking-wider mt-4 shadow-lg shadow-primary/20"
          >
            {loading ? "Registering..." : (
              <>
                <Save className="w-4 h-4 mr-2" /> Register Vehicle
              </>
            )}
          </Button>
        </form>

        <div className="p-4 rounded-xl border border-border bg-secondary/10 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase">Privacy Note</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Your vehicle data is encrypted and used only to power the predictive maintenance engine. 
              We never share your VIN or location without explicit permission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
