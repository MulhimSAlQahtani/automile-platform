import { useState, useEffect } from "react";
import { Activity, Bluetooth, Power, RefreshCw, AlertCircle, Trash2, Gauge } from "lucide-react";
import { obdCore, ObdData } from "@/lib/obd-scanner";
import { analyzeDiagnosticTroubleCodes, DTCExplanation } from "@/lib/diagnostic-ai";

export default function Diagnostics() {
  const [connectionState, setConnectionState] = useState(obdCore["state"] || 'DISCONNECTED');
  const [liveData, setLiveData] = useState<Partial<ObdData>>({
    rpm: 0, speed: 0, coolantTemp: 0, throttlePosition: 0, engineLoad: 0
  });
  
  const [errorCodes, setErrorCodes] = useState<DTCExplanation[]>([]);
  const [readingCodes, setReadingCodes] = useState(false);

  // Hook into the OBD BLE Bridge Streams
  useEffect(() => {
    obdCore.onStateChange = (state) => setConnectionState(state);
    obdCore.onDataUpdate = (data) => setLiveData(prev => ({ ...prev, ...data }));
    
    return () => {
      obdCore.onStateChange = null;
      obdCore.onDataUpdate = null;
    };
  }, []);

  const handleConnectSimulator = () => {
    obdCore.startSimulator();
  };

  const handleDisconnect = () => {
    obdCore.disconnect();
    setLiveData({ rpm: 0, speed: 0, coolantTemp: 0, throttlePosition: 0, engineLoad: 0 });
    setErrorCodes([]);
  };

  const handleScanDTC = async () => {
    setReadingCodes(true);
    const rawCodes = await obdCore.readDiagnosticTroubleCodes();
    
    setTimeout(() => {
      // Pipe explicit Hex Strings into the Matrix Parser
      const humanReadable = analyzeDiagnosticTroubleCodes(rawCodes);
      setErrorCodes(humanReadable);
      setReadingCodes(false);
    }, 1500); // Simulate explicit CAN-BUS response latency
  };

  const handleClearCodes = async () => {
    await obdCore.clearCheckEngineLight();
    setErrorCodes([]);
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-md mx-auto animate-slide-up pb-24">
      {/* Heavy Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
           <Gauge className="w-6 h-6 text-primary" /> OBD-II Diagnostics
        </h1>
        <p className="text-sm text-muted-foreground">Real-time ELM327 ECM telemetry interface.</p>
      </div>

      {/* Hardware Connection Card */}
      <div className={`p-4 rounded-xl border transition-all ${connectionState === 'CONNECTED' ? 'bg-primary/10 border-primary/30' : 'bg-secondary/50 border-border'}`}>
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${connectionState === 'CONNECTED' ? 'bg-primary/20' : 'bg-secondary'}`}>
                 <Bluetooth className={`w-5 h-5 ${connectionState === 'CONNECTED' ? 'text-primary' : 'text-muted-foreground'}`} />
               </div>
               <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Bluetooth Scanner</span>
                  <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{connectionState}</span>
               </div>
            </div>
            
            {connectionState === 'DISCONNECTED' ? (
              <button onClick={handleConnectSimulator} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all outline-none">
                Connect
              </button>
            ) : (
               <button onClick={handleDisconnect} className="h-9 w-9 flex justify-center items-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all">
                <Power className="w-4 h-4" />
              </button>
            )}
         </div>
      </div>

      {/* Real-time Telemetry Dashboard */}
      <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest pl-1 mt-2">Live ECM Data Stream</h3>
      <div className="grid grid-cols-2 gap-3">
          {/* RPM Gauge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 border border-border gap-1 relative overflow-hidden">
             <span className="text-4xl font-black tabular-nums transition-all duration-75 text-foreground">{liveData.rpm}</span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Engine RPM</span>
             
             {/* Progress Bar mapped out of 7000rpm redline */}
             <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-background">
               <div className="h-full bg-primary transition-all duration-100 ease-out" style={{ width: `${Math.min(100, ((liveData.rpm || 0) / 7000) * 100)}%`}} />
             </div>
          </div>
          
          {/* Coolant Gauge */}
           <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors gap-1 ${
               (liveData.coolantTemp || 0) > 100 ? 'bg-destructive/10 border-destructive/30' : 'bg-secondary/30 border-border'
           }`}>
             <span className={`text-3xl font-black tabular-nums transition-all duration-300 ${(liveData.coolantTemp || 0) > 100 ? 'text-destructive' : 'text-foreground'}`}>
                 {liveData.coolantTemp}°C
             </span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Coolant</span>
           </div>
           
           {/* Load Gauge */}
           <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 border border-border gap-1">
             <span className="text-3xl font-black tabular-nums transition-all duration-300 text-foreground">{liveData.engineLoad}%</span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Calc. Load</span>
           </div>
           
           {/* Throttle Gauge */}
           <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/30 border border-border gap-1">
             <span className="text-3xl font-black tabular-nums transition-all duration-300 text-foreground">{liveData.throttlePosition}%</span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Throttle Pos</span>
           </div>
      </div>

      {/* Check Engine / DTC Matrix */}
      <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-widest pl-1 mt-4">Diagnostic Trouble Codes</h3>

      <div className="flex flex-col gap-3">
        <button 
           disabled={connectionState !== 'CONNECTED' || readingCodes}
           onClick={handleScanDTC}
           className="w-full h-12 rounded-xl border-2 border-dashed border-primary/30 text-primary font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
           {readingCodes ? (
             <RefreshCw className="w-5 h-5 animate-spin" />
           ) : (
             <Activity className="w-5 h-5" /> 
           )}
           {readingCodes ? "Interrogating ECU Protocol..." : "Refresh Active ECU Error Codes"}
        </button>

        {errorCodes.map((dtc) => (
           <div key={dtc.code} className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex flex-col gap-3 animate-in zoom-in duration-300 slide-in-from-bottom-2">
             <div className="flex justify-between items-start">
               <div className="flex items-center gap-2">
                 <AlertCircle className="w-5 h-5 text-destructive" />
                 <h4 className="font-black text-lg text-foreground uppercase">{dtc.code}</h4>
               </div>
               <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-destructive/20 text-destructive">{dtc.severity}</span>
             </div>
             
             <div>
                <p className="font-bold text-sm text-foreground">{dtc.definition}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Implied System: {dtc.system}</p>
             </div>
             
             <div className="flex gap-2 p-2 rounded bg-background border border-border/50">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Linked Part:</span>
                <span className="text-[10px] font-bold text-primary truncate">{dtc.affectedParts.join(", ") || "Unknown"}</span>
             </div>
             
             {dtc.estimatedRepairCostMax > 0 && (
                <div className="flex justify-between items-center mt-1 border-t border-destructive/20 pt-2">
                   <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Est. Damage Repair</span>
                   <span className="font-black text-sm text-foreground">${dtc.estimatedRepairCostMin} - ${dtc.estimatedRepairCostMax}</span>
                </div>
             )}
           </div>
        ))}
        
        {errorCodes.length > 0 && (
          <button onClick={handleClearCodes} className="w-full mt-2 h-10 rounded-lg bg-secondary text-destructive font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-destructive hover:text-white transition-all">
             <Trash2 className="w-4 h-4" /> Clear Dashboard Light
          </button>
        )}
      </div>
    </div>
  );
}
