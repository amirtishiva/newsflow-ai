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
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* App routes (with layout) */}
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/trending" element={<AppLayout><TrendingTopics /></AppLayout>} />
          <Route path="/drafts" element={<AppLayout><AIDrafts /></AppLayout>} />
          <Route path="/published" element={<AppLayout><Published /></AppLayout>} />
          <Route path="/sources" element={<AppLayout><Sources /></AppLayout>} />
          <Route path="/research/:topicId" element={<AppLayout><ResearchReport /></AppLayout>} />
          <Route path="/activity-log" element={<AppLayout><ActivityLog /></AppLayout>} />
          <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
