import { useState, useEffect } from "react";
import { HelpCircle, AlertTriangle, Clock, Sparkles } from "lucide-react";
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

// Fallback logic if no API key is set
const fallbackConsequences: Record<string, string> = {
  "Engine Oil & Oil Filter": "Delaying oil changes causes sludge buildup, accelerated engine wear, and can lead to complete engine failure.",
  "Air Filter": "A clogged air filter starves the engine of oxygen, reducing power and increasing fuel consumption.",
  // Add fallback for generic items
};

export default function ExplainSheet({ open, onOpenChange, parts }: Props) {
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && parts.length > 0) {
      generateExplanations();
    }
  }, [open, parts]);

  const generateExplanations = async () => {
    setLoading(true);
    const newExplanations: Record<string, string> = {};
    
    try {
      // Simulate an AI fetch (or use real OpenAI/Gemini fetch if VITE_AI_API_KEY is present)
      const apiKey = import.meta.env.VITE_AI_API_KEY;
      
      if (!apiKey) {
        // Fallback to simulated AI delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        parts.forEach(({ part }) => {
          newExplanations[part.name] = fallbackConsequences[part.name] || `AI analysis indicates that delaying ${part.name} maintenance could lead to severe degradation of related components and increase overall repair costs.`;
        });
      } else {
        // Example Gemini/OpenAI Implementation
        const prompt = `You are a master mechanic. Explain briefly why neglecting these car parts is dangerous or costly: ${parts.map(p => p.part.name).join(", ")}`;
        
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        // Naive split for demo purposes (In real prod, ask for JSON response)
        parts.forEach(({ part }) => {
          newExplanations[part.name] = aiText; 
        });
      }
    } catch (error) {
      console.error("AI Fetch Failed:", error);
      parts.forEach(({ part }) => {
        newExplanations[part.name] = "Ensure this part is serviced to avoid mechanical failure.";
      });
    }

    setExplanations(newExplanations);
    setLoading(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Service Explanations
          </DrawerTitle>
          <DrawerDescription>
            Our AI mechanic explains exactly why you shouldn't ignore these services.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto flex flex-col gap-4 max-h-[55vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-3 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary/50 animate-bounce" />
              <p className="text-sm text-muted-foreground">AI is inspecting your service needs...</p>
            </div>
          ) : (
            parts.map(({ part, label }) => (
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
                {explanations[part.name] && (
                  <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary/90 leading-relaxed font-medium">
                      🤖 <span className="font-bold">AI Diagnosis:</span> {explanations[part.name]}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
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
