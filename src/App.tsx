import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import TrendingTopics from "./pages/TrendingTopics";
import AIDrafts from "./pages/AIDrafts";
import Published from "./pages/Published";
import Sources from "./pages/Sources";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import ResearchReport from "./pages/ResearchReport";
import ActivityLog from "./pages/ActivityLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trending" element={<TrendingTopics />} />
            <Route path="/drafts" element={<AIDrafts />} />
            <Route path="/published" element={<Published />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
