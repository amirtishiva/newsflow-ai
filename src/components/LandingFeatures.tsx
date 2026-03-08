import { TrendingUp, FileEdit, Send, Database, Bell, Shield } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Trending Topics",
    description: "Real-time monitoring of breaking stories and emerging trends across thousands of sources.",
  },
  {
    icon: FileEdit,
    title: "AI Draft Generation",
    description: "Generate publish-ready articles from research data with tone, style, and length controls.",
  },
  {
    icon: Send,
    title: "One-Click Publish",
    description: "Push stories to your CMS, social channels, or newsletter with a single click.",
  },
  {
    icon: Database,
    title: "Source Management",
    description: "Curate and manage trusted sources with credibility scoring and bias detection.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified instantly when stories match your beat or break a threshold.",
  },
  {
    icon: Shield,
    title: "Audit Trail",
    description: "Full activity log for editorial accountability and compliance tracking.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 px-6 bg-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-sm font-body text-white/70 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Everything Your Newsroom Needs
          </h2>
          <p className="text-lg text-white/60 font-body max-w-2xl mx-auto">
            A complete AI-powered toolkit designed for modern journalists and editorial teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                <feature.icon className="h-5 w-5 text-white/80" />
              </div>
              <h3 className="text-lg font-body font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm font-body text-white/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
