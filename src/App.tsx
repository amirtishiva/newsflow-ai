import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Landing from "./pages/Landing";
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
    <AuthProvider>
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

            {/* Landing page (no layout) */}
            <Route path="/" element={<Landing />} />

            {/* App routes (with layout + auth) */}
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/trending" element={<ProtectedRoute><AppLayout><TrendingTopics /></AppLayout></ProtectedRoute>} />
            <Route path="/drafts" element={<ProtectedRoute><AppLayout><AIDrafts /></AppLayout></ProtectedRoute>} />
            <Route path="/published" element={<ProtectedRoute><AppLayout><Published /></AppLayout></ProtectedRoute>} />
            <Route path="/sources" element={<ProtectedRoute><AppLayout><Sources /></AppLayout></ProtectedRoute>} />
            <Route path="/research/:topicId" element={<ProtectedRoute><AppLayout><ResearchReport /></AppLayout></ProtectedRoute>} />
            <Route path="/activity-log" element={<ProtectedRoute><AppLayout><ActivityLog /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
