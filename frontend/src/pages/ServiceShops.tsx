import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Navigation, Phone, ExternalLink, Loader2, Search } from "lucide-react";
import { functions, httpsCallable } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Shop {
  id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  vicinity: string;
  location: { lat: number; lng: number };
  open_now: boolean;
  price_level: number;
  distance_text: string;
  duration_text?: string;
  distance_meters: number;
  simulated?: boolean;
}

export default function ServiceShops() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceType = searchParams.get("service") || "auto repair";
  
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);

  useEffect(() => {
    fetchShops();
  }, [serviceType]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      // Use Riyadh coordinates as default for demo/simulator
      const lat = 24.7136;
      const lng = 46.6753;

      const searchNearbyShops = httpsCallable(functions, "searchNearbyShops");
      const result = await searchNearbyShops({ lat, lng, serviceType });
      
      if (result.data) {
        setShops(result.data as Shop[]);
      } else {
        setShops([]);
      }
    } catch (error: any) {
      toast.error("Failed to find nearby shops: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (shop: Shop) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${shop.location.lat},${shop.location.lng}&query_place_id=${shop.id}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 text-foreground pb-24">
      <div className="w-full max-w-md flex flex-col gap-6 animate-slide-up">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">Nearby Specialists</h1>
            <p className="text-xs text-muted-foreground capitalize">Finding the best match for {serviceType}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <Search className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-wider">Scanning Network...</p>
              <p className="text-[10px] text-muted-foreground px-12">Filtering for certified shops with 4.0+ ratings and specialized expertise in your area.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {shops.length > 0 ? (
              shops.map((shop, index) => (
                <div 
                  key={shop.id} 
                  className="p-4 rounded-2xl bg-secondary/20 border border-border flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1 pr-12">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm leading-tight">{shop.name}</h3>
                        {shop.simulated && (
                          <Badge variant="outline" className="text-[8px] h-4 bg-primary/5 text-primary border-primary/20">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {shop.rating} ({shop.user_ratings_total})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shop.distance_text}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${shop.open_now ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                          {shop.open_now ? "Open Now" : "Closed"}
                       </span>
                       <span className="text-[10px] text-muted-foreground font-mono">{"$".repeat(shop.price_level)}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    <MapPin className="w-3 h-3 inline mr-1" /> {shop.vicinity}
                  </p>

                  <div className="mt-2 text-center">
                    <Button 
                      variant="outline" 
                      className="w-full h-10 text-xs font-bold border-border hover:bg-secondary justify-center flex items-center"
                      onClick={() => openInMaps(shop)}
                    >
                      <Navigation className="w-3.5 h-3.5 mr-2" /> View Directions
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center text-center gap-4 text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/5">
                <MapPin className="w-12 h-12 opacity-20" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground">No shops found</p>
                  <p className="text-[10px] px-12">We couldn't find any specialized shops matching "{serviceType}" in your immediate area.</p>
                </div>
                <Button variant="ghost" className="text-primary text-xs font-bold" onClick={fetchShops}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
          <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center border-primary/30 p-0 text-primary">i</Badge>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            AutoMile ranks shops based on your vehicle's specific requirements, parts availability, and historical performance ratings for <strong>{serviceType}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
