import { useState, useEffect } from "react";
import { MapPin, Navigation, Star, Search } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockShops = [
  { id: 1, name: "AutoFix Certified", rating: 4.8, address: "123 Main St, Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
  { id: 2, name: "City Center Mechanics", rating: 4.6, address: "800 W Olympic Blvd, Los Angeles, CA", lat: 34.0443, lng: -118.2636 },
];

export default function ScheduleSheet({ open, onOpenChange }: Props) {
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<typeof mockShops>([]);

  // Simulate Firebase Cloud Function Search
  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setShops(mockShops);
      setLoading(false);
    }, 1000);
  };

  // The Exact Cross-Platform Nav Method the USER requested
  const openInMaps = (address: string, lat: number, lng: number) => {
    const destination = encodeURIComponent(address);
    // This logic detects the platform and opens the correct native app
    const mapUrl = window.navigator.userAgent.includes("iPhone") 
      ? `maps://?q=${destination}&ll=${lat},${lng}` 
      : `geo:${lat},${lng}?q=${destination}`;
      
    window.open(mapUrl, '_system');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-card border-border max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2 text-foreground">
            <MapPin className="w-5 h-5 text-primary" />
            Find Shop Locations
          </DrawerTitle>
          <DrawerDescription>
            Locate highly-rated mechanic shops in your area.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 flex flex-col gap-4 overflow-y-auto max-h-[50vh]">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter Zip Code or City"
                className="w-full h-11 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="h-11 px-4 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {loading && <p className="text-sm text-center text-muted-foreground animate-pulse p-4">Finding shops...</p>}
            
            {!loading && shops.map((shop) => (
              <div key={shop.id} className="p-4 rounded-xl border border-border bg-secondary/50 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{shop.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{shop.address}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-1 rounded-md text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {shop.rating}
                  </div>
                </div>
                
                <button 
                  onClick={() => openInMaps(shop.address, shop.lat, shop.lng)}
                  className="w-full h-9 rounded-lg border border-primary/30 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  Navigate with Maps
                </button>
              </div>
            ))}
          </div>
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
