import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import NotificationAnalytics from "./pages/NotificationAnalytics";
import PrivacyCenter from "./pages/PrivacyCenter";
import SecureVault from "./components/SecureVault";
import BlockchainVerifier from "./pages/BlockchainVerifier";
import AddVehicle from "./pages/AddVehicle";
import ServiceShops from "./pages/ServiceShops";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/app" element={<Index />} />
          <Route path="/app/analytics" element={<NotificationAnalytics />} />
          <Route path="/app/privacy" element={<PrivacyCenter />} />
          <Route path="/app/vault" element={<SecureVault />} />
          <Route path="/app/blockchain" element={<BlockchainVerifier />} />
          <Route path="/app/add-vehicle" element={<AddVehicle />} />
          <Route path="/app/shops" element={<ServiceShops />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
