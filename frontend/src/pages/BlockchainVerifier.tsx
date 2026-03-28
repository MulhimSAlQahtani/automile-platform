import { Database, Link as LinkIcon, CheckCircle2, AlertTriangle, FileCheck, Hash, ShieldCheck, ArrowLeft, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Web3Record {
  timestamp: string;
  mileage: number;
  part: string;
  mechanic: string;
  txHash: string;
}

export default function BlockchainVerifier() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(false);
  const [records, setRecords] = useState<Web3Record[] | null>(null);

  const handleVerify = () => {
    setVerifying(true);
    // Simulate Smart Contract call to AutoMileLedger.sol
    setTimeout(() => {
      setRecords([
        { 
          timestamp: "2026-02-10 14:32", 
          mileage: 45200, 
          part: "Oil Filter & Synthetic Oil", 
          mechanic: "Shop_UUID_8812", 
          txHash: "0x7a2...f89" 
        },
        { 
          timestamp: "2025-11-04 09:15", 
          mileage: 38500, 
          part: "Brake Pads (OEM)", 
          mechanic: "Shop_UUID_1102", 
          txHash: "0x3b1...e45" 
        }
      ]);
      setVerifying(false);
      toast.success("Web3 Ledger Verified: 100% Integrity Match.");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto animate-slide-up pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/app')} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
             <Database className="w-5 h-5 text-primary" /> Web3 Ledger
          </h1>
          <p className="text-xs text-muted-foreground">Immutable Blockchain Service Verification</p>
        </div>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-primary">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[10px] font-bold uppercase tracking-widest">VIN Verification Active</span>
        </div>
        <div className="p-3 bg-background rounded-lg border border-border flex flex-col gap-1">
           <span className="text-[9px] text-muted-foreground uppercase">Hashed Identity</span>
           <span className="text-xs font-mono font-bold break-all">f7e8...c9a2 (SH256 Generated)</span>
        </div>
        <button 
          onClick={handleVerify}
          disabled={verifying}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-black flex items-center justify-center gap-2 text-sm disabled:opacity-50 transition-all hover:scale-[0.98]"
        >
          {verifying ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          {verifying ? "Auditing Network..." : "Verify Service Integrity"}
        </button>
      </div>

      {!records && !verifying && (
         <div className="py-12 flex flex-col items-center text-center opacity-40">
            <LinkIcon className="w-12 h-12 mb-2" />
            <p className="text-xs font-bold leading-relaxed px-12">Connect to the AutoMile Ledger to pull irrefutable service proofs from the Ethereum network.</p>
         </div>
      )}

      {records && (
         <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">
               <span>Verified Entries</span>
               <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Blockchain Certified</span>
            </div>

            {records.map((r, i) => (
               <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border border-success/30 bg-success/5 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                     <div className="flex flex-col">
                        <span className="text-sm font-black">{r.part}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{r.timestamp}</span>
                     </div>
                     <div className="text-right flex flex-col items-end">
                        <span className="text-xs font-black text-foreground">{r.mileage.toLocaleString()} KM</span>
                        <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded font-bold uppercase">Hash Match</span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-success/20">
                     <Hash className="w-3 h-3 text-muted-foreground" />
                     <span className="text-[8px] font-mono text-muted-foreground truncate flex-1">{r.txHash}</span>
                     <FileCheck className="w-3 h-3 text-success cursor-pointer hover:scale-110 transition-transform" />
                  </div>
                  
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                     <ShieldCheck className="w-12 h-12 text-success" />
                  </div>
               </div>
            ))}

            <div className="p-4 bg-secondary/20 rounded-xl border border-border flex gap-3">
               <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
               <p className="text-[10px] text-muted-foreground leading-relaxed">
                  These records are stored on the <strong>AutoMile Ledger</strong> smart contract. Since metadata is hashed before minting, only you (the owner) can prove the connection to the physical vehicle via your Private Key.
               </p>
            </div>
         </div>
      )}

    </div>
  );
}
