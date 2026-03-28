import { Lock, FileText, Upload, ShieldCheck, EyeOff, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SecureVault as VaultEngine } from "@/lib/auth-mfa";

interface SecureDoc {
  id: string;
  name: string;
  type: "Insurance" | "Registration" | "Warranty";
  date: string;
  encryptedBlob: string;
}

export default function SecureVault() {
  const navigate = useNavigate();
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [docs] = useState<SecureDoc[]>([
    { id: "1", name: "Comprehensive Policy 2026", type: "Insurance", date: "2026-01-15", encryptedBlob: "U2FsdGVkX1+..." },
  ]);

  const handleUnlock = async () => {
    if (pin.length < 4) {
      toast.error("Please enter your 4-digit Vault PIN.");
      return;
    }

    try {
      // In a real app, we'd pull the real encryptedBlob from Firestore/Storage
      // and pass it to the Native Biometric decryptor.
      toast.loading("Authenticating Biometrics...", { id: "vault-auth" });
      await VaultEngine.promptBiometricDecryption(pin, docs[0].encryptedBlob);
      setLocked(false);
      toast.success("Vault Decrypted Successfully.", { id: "vault-auth" });
    } catch (e: any) {
      toast.error(e.message, { id: "vault-auth" });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto animate-slide-up pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
             <Lock className="w-5 h-5 text-primary" /> Secure Vault
          </h1>
          <p className="text-xs text-muted-foreground">End-to-end encrypted vehicle documents</p>
        </div>
      </div>

      {locked ? (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
           <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center relative">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <div className="absolute -top-1 -right-1 bg-destructive w-4 h-4 rounded-full border-2 border-background" />
           </div>
           <div className="text-center space-y-1">
              <h2 className="text-lg font-black italic uppercase">Vault Locked</h2>
              <p className="text-xs text-muted-foreground px-12">Enter your Private Key and use Biometrics to access sensitive insurance data.</p>
           </div>
           
           <div className="flex flex-col w-full gap-4">
              <input 
                type="password" 
                placeholder="Vault PIN" 
                className="w-full p-4 bg-secondary/30 border border-border rounded-xl text-center text-2xl tracking-[1em] font-black focus:ring-2 focus:ring-primary outline-none"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              <button 
                onClick={handleUnlock}
                className="w-full p-4 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Authenticate & Unlock
              </button>
           </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
           <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Document Registry</h3>
              <button className="p-2 bg-primary/10 text-primary rounded-lg">
                 <Plus className="w-4 h-4" />
              </button>
           </div>

           {docs.map(doc => (
              <div key={doc.id} className="p-4 rounded-xl border border-border bg-secondary/10 flex items-center justify-between group">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                       <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-sm font-bold">{doc.name}</span>
                       <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{doc.type} • {doc.date}</span>
                    </div>
                 </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toast.success("Opening Decrypted File...")} className="p-2 hover:bg-secondary rounded-lg">
                       <EyeOff className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 rounded-lg">
                       <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                 </div>
              </div>
           ))}

           <div className="mt-6 p-4 bg-warning/10 border border-warning/30 rounded-xl flex gap-3 italic">
              <ShieldCheck className="w-5 h-5 text-warning shrink-0" />
              <p className="text-[10px] text-warning-foreground leading-relaxed">
                 <strong>Zero-Knowledge Protocol:</strong> AutoMile Pro never stores your Vault PIN on any server. If you lose this PIN, your documents CANNOT be recovered.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
