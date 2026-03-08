import { useNavigate } from "react-router-dom";
import { Newspaper } from "lucide-react";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#workflow" },
  { label: "Dashboard", href: "/dashboard" },
];

export function LandingNavbar() {
  const navigate = useNavigate();

  const handleClick = (href: string) => {
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(href);
    }
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="flex items-center gap-1 px-2 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
        >
          <Newspaper className="h-4 w-4 text-white" />
          <span className="text-sm font-body font-semibold text-white hidden sm:inline">News2Flow</span>
        </button>

        <div className="w-px h-4 bg-white/20 mx-1" />

        {/* Nav Items */}
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleClick(item.href)}
            className="px-3 py-1.5 rounded-full text-sm font-body text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            {item.label}
          </button>
        ))}

        <div className="w-px h-4 bg-white/20 mx-1" />

        {/* Auth Buttons */}
        <button
          onClick={() => navigate("/login")}
          className="px-3 py-1.5 rounded-full text-sm font-body text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate("/signup")}
          className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-body font-semibold hover:bg-white/90 transition-colors"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}
