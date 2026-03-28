import { useState, useEffect } from "react";
import { Sparkles, Bot } from "lucide-react";
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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parts: { part: MaintenancePart; label: string }[];
}

export default function ExplainSheet({ open, onOpenChange, parts }: Props) {
  const [aiResponse, setAiResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && parts.length > 0) {
      generateExplanation();
    }
  }, [open, parts]);

  const generateExplanation = async () => {
    setLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_AI_API_KEY;
      
      if (!apiKey || apiKey.includes("your-gemini")) {
        // Fallback simulated response matching the exact structure requested
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAiResponse(`Hello! Based on your vehicle's current mileage, here is your maintenance breakdown:\n\n**Critical Replacements Needed Now**\n• ${parts.filter(p => p.label === "Critical").map(p => `${p.part.name} ($${p.part.costMin}-$${p.part.costMax}): Due immediately to prevent compounding mechanical failure.`).join("\n• ")}\n\n**Upcoming Maintenance (Next 5,000 km)**\n• ${parts.filter(p => p.label === "Upcoming").map(p => `${p.part.name} ($${p.part.costMin}-$${p.part.costMax}): Plan for this soon.`).join("\n• ")}\n\n**Maintenance Tip**\nStaying ahead of these intervals maximizes your vehicle's resale value and prevents roadside emergencies.\n\n1. Schedule a service appointment at a certified shop near you?\n2. Get detailed cost estimates for specific repairs?\n3. Would you like me to explain any of these recommendations in more detail?`);
        setLoading(false);
        return;
      }

      // Exact prompt structure required by the user
      const criticalParts = parts.filter(p => p.label === "Critical").map(p => p.part.name).join(", ");
      const upcomingParts = parts.filter(p => p.label === "Upcoming").map(p => p.part.name).join(", ");

      const prompt = `You are an AI assistant for a mobile automotive maintenance app called "AutoMile Pro." 
Your task is to analyze vehicle mileage and recommend which spare parts are due for replacement based on standard manufacturer guidelines.
There are Critical Parts: [${criticalParts}]
There are Upcoming Parts (Next 5,000km): [${upcomingParts}].

Follow this exact response structure:
- Start with a friendly greeting and mileage confirmation
- List "Critical Replacements Needed Now" with bullet points (include part name, reason, and estimated cost range)
- List "Upcoming Maintenance (Next 5,000 km)" with bullet points (include part name, reason, and estimated cost range)
- Include a brief maintenance tip section
- End EXACTLY with these three interactive options:
  1. "Schedule a service appointment at a certified shop near you?"
  2. "Get detailed cost estimates for specific repairs?"
  3. "Would you like me to explain any of these recommendations in more detail?"
  
Be conversational and helpful.`;
      
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      setAiResponse(data.candidates[0].content.parts[0].text);
    } catch (error) {
      console.error("AI Fetch Failed:", error);
      setAiResponse("I'm sorry, I couldn't connect to the AI analysis engine at the moment. Please verify the API connection.");
    }

    setLoading(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            Ella AI Companion
          </DrawerTitle>
          <DrawerDescription>
            Your emotionally intelligent guide to vehicle maintenance.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 overflow-y-auto flex flex-col gap-4 max-h-[55vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 gap-3 animate-pulse">
              <Sparkles className="w-8 h-8 text-primary/50 animate-bounce" />
              <p className="text-sm text-muted-foreground">Ella is analyzing your vehicle's profile...</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="text-sm text-foreground space-y-3 whitespace-pre-wrap leading-relaxed">
                  {aiResponse}
                </div>
              </div>
            </div>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <button className="w-full h-10 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary transition-all">
              Close Companion
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
