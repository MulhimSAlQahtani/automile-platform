import { Shield, Eye, Lock, MapPin, Download, Trash2, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function PrivacyCenter() {
  const navigate = useNavigate();
  const [fuzzing, setFuzzing] = useState(false);
  const [shareData, setShareData] = useState(true);

  const handleExport = () => {
    toast.success("Preparing your Data Export (.json). Check your email in 5 minutes.");
  };

  const handleDelete = () => {
    const confirm = window.confirm("IRREVERSIBLE ACTION: This will purge all maintenance records, vehicle data, and encrypted documents. Proceed?");
    if (confirm) toast.error("Account deletion protocol initiated.");
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto animate-slide-up pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
             <Shield className="w-5 h-5 text-primary" /> Privacy Control
          </h1>
          <p className="text-xs text-muted-foreground">Manage your digital footprint & data sharing</p>
        </div>
      </div>

      {/* Identity & MFA */}
      <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Access Security</h3>
        
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-sm font-bold">Multi-Factor Auth</span>
              <span className="text-[10px] text-muted-foreground">Require SMS code for every login</span>
           </div>
           <button onClick={() => toast.info("MFA Enrollment active.")} className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg">Enroll</button>
        </div>
      </div>

      {/* Location Privacy */}
      <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Location Spatials</h3>
        
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-sm font-bold flex items-center gap-2">
                 <MapPin className="w-3 h-3" /> GPS Fuzzing (5km Grid)
              </span>
              <span className="text-[10px] text-muted-foreground">Snap location to nearest 5km for shop discovery</span>
           </div>
           <button onClick={() => setFuzzing(!fuzzing)}>
              {fuzzing ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
           </button>
        </div>
      </div>

      {/* Data Sharing */}
      <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Third-Party Permissions</h3>
        
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-sm font-bold">Anonymous Shop Search</span>
              <span className="text-[10px] text-muted-foreground">Hide profile data during marketplace discovery</span>
           </div>
           <button onClick={() => setShareData(!shareData)}>
              {!shareData ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
           </button>
        </div>
      </div>

      {/* Rights & Deletion */}
      <div className="p-4 rounded-xl border border-border bg-secondary/10 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account & Compliance</h3>
        
        <button onClick={handleExport} className="flex items-center justify-between w-full hover:bg-secondary/20 p-2 rounded-lg transition-colors">
           <div className="flex items-center gap-3">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold">Export My Data (.json)</span>
           </div>
        </button>

        <button onClick={handleDelete} className="flex items-center justify-between w-full hover:bg-destructive/10 p-2 rounded-lg transition-colors text-destructive">
           <div className="flex items-center gap-3">
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-bold">Permanent Account Purge</span>
           </div>
        </button>
      </div>

      <div className="text-center px-6">
         <p className="text-[10px] text-muted-foreground leading-relaxed">
            AutoMile Pro adheres strictly to GDPR and local Saudi PDPL regulations. We do not sell your telematics data to insurance companies without explicit biometric authorization.
         </p>
      </div>

    </div>
  );
}
