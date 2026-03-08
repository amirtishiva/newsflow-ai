import { useNavigate } from "react-router-dom";
import Hero from "@/components/ui/animated-shader-hero";
import { Newspaper } from "lucide-react";
import { LandingNavbar } from "@/components/LandingNavbar";
import { LandingFeatures } from "@/components/LandingFeatures";
import { LandingWorkflow } from "@/components/LandingWorkflow";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <Hero
        trustBadge={{
          text: "AI-powered newsroom intelligence",
          icons: [
            <Newspaper key="news" className="h-4 w-4" />,
          ],
        }}
        headline={{
          line1: "News2Flow AI",
          line2: "Your Intelligent Newsroom",
        }}
        subtitle="Monitor trends, generate drafts, and publish stories — all powered by AI. Built for modern reporters and newsrooms."
        buttons={{
          primary: {
            text: "Get Started",
            onClick: () => navigate("/signup"),
          },
          secondary: {
            text: "Sign In",
            onClick: () => navigate("/login"),
          },
        }}
      />
      <LandingFeatures />
      <LandingWorkflow />
    </div>
  );
};

export default Landing;
