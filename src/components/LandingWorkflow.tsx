import { Search, Sparkles, PenTool, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Monitor & Discover",
    description: "AI continuously scans thousands of sources to surface trending topics and breaking stories relevant to your beat.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Research & Analyze",
    description: "Deep-dive into any topic with auto-generated research reports, source verification, and sentiment analysis.",
  },
  {
    number: "03",
    icon: PenTool,
    title: "Draft & Refine",
    description: "Generate AI drafts with your preferred tone and style. Edit, fact-check, and polish with intelligent suggestions.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Publish & Distribute",
    description: "Push finished stories to your CMS, social channels, and newsletters — all from one place.",
  },
];

export function LandingWorkflow() {
  return (
    <section id="workflow" className="relative py-24 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full border border-border bg-muted text-sm font-body text-muted-foreground mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            From Trend to Published in Minutes
          </h2>
          <p className="text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            A streamlined four-step workflow that takes you from discovery to distribution.
          </p>
        </div>

        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex items-start gap-6 md:gap-10">
                {/* Step number circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="h-16 w-16 rounded-full border-2 border-foreground bg-background flex items-center justify-center">
                    <span className="text-lg font-body font-bold text-foreground">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <step.icon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-xl font-body font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-base font-body text-muted-foreground leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
