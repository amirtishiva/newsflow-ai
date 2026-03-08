import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Twitter,
  Database,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  Link,
  Upload,
  Rss,
  Youtube,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const steps = [
  { id: "profile", label: "Profile", icon: User },
  { id: "twitter", label: "Twitter", icon: Twitter },
  { id: "sources", label: "Sources", icon: Database },
  { id: "training", label: "Training", icon: FileText },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  // Twitter state
  const [twitterConnected, setTwitterConnected] = useState(false);

  // Sources state
  const [addedSources, setAddedSources] = useState<string[]>([]);
  const [sourceInput, setSourceInput] = useState("");

  // Training state
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const progress = ((Object.keys(completed).length) / steps.length) * 100;

  const markComplete = (stepId: string) => {
    setCompleted((prev) => ({ ...prev, [stepId]: true }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success("Onboarding complete! Welcome to News2Flow AI.");
      navigate("/dashboard");
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleAddSource = () => {
    if (sourceInput.trim()) {
      setAddedSources((prev) => [...prev, sourceInput.trim()]);
      setSourceInput("");
    }
  };

  const handleUploadFile = () => {
    const fileName = `sample_script_${uploadedFiles.length + 1}.txt`;
    setUploadedFiles((prev) => [...prev, fileName]);
    toast.success("Script uploaded!");
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "profile":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">
              Set up your reporter profile. This helps personalize your experience.
            </p>
            <div className="space-y-2">
              <Label className="font-body">Display Name</Label>
              <Input
                placeholder="Jane Reporter"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Bio / Beat</Label>
              <Input
                placeholder="Senior Correspondent, Tech & Policy"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            {displayName && (
              <Button
                size="sm"
                variant="outline"
                className="font-body"
                onClick={() => {
                  markComplete("profile");
                  toast.success("Profile saved!");
                }}
              >
                <CheckCircle className="mr-1 h-3 w-3" /> Save Profile
              </Button>
            )}
          </div>
        );

      case "twitter":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">
              Connect your Twitter/X account to publish approved content directly.
            </p>
            {twitterConnected ? (
              <div className="flex items-center gap-3 p-4 rounded bg-muted">
                <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center">
                  <Twitter className="h-5 w-5 text-background" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-body">@YourHandle</p>
                  <p className="text-xs text-muted-foreground font-body">Connected via OAuth 2.0</p>
                </div>
                <Badge variant="outline" className="ml-auto text-[10px] bg-success/10 text-success border-success/30">
                  <CheckCircle className="mr-1 h-3 w-3" /> Connected
                </Badge>
              </div>
            ) : (
              <Button
                className="w-full font-body"
                onClick={() => {
                  setTwitterConnected(true);
                  markComplete("twitter");
                  toast.success("Twitter connected!");
                }}
              >
                <Link className="mr-2 h-4 w-4" /> Connect Twitter Account
              </Button>
            )}
          </div>
        );

      case "sources":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">
              Add content sources to monitor. You can add Twitter handles, RSS feeds, or YouTube channels.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="@handle, RSS URL, or YouTube channel"
                value={sourceInput}
                onChange={(e) => setSourceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSource()}
              />
              <Button onClick={handleAddSource} disabled={!sourceInput.trim()}>
                Add
              </Button>
            </div>
            {addedSources.length > 0 && (
              <div className="space-y-1">
                {addedSources.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted">
                    {s.startsWith("@") ? (
                      <Twitter className="h-3 w-3 text-muted-foreground" />
                    ) : s.startsWith("http") ? (
                      <Rss className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Youtube className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-sm font-mono">{s}</span>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="font-body mt-2"
                  onClick={() => {
                    markComplete("sources");
                    toast.success("Sources saved!");
                  }}
                >
                  <CheckCircle className="mr-1 h-3 w-3" /> Confirm Sources
                </Button>
              </div>
            )}
          </div>
        );

      case "training":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-body">
              Upload your writing samples (.txt, .docx, .pdf) so the AI can learn your voice.
              Upload at least 5 scripts for best results.
            </p>
            <Button variant="outline" className="w-full font-body" onClick={handleUploadFile}>
              <Upload className="mr-2 h-4 w-4" /> Upload Script
            </Button>
            {uploadedFiles.length > 0 && (
              <div className="space-y-1">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-body">{f}</span>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="font-body mt-2"
                  onClick={() => {
                    markComplete("training");
                    toast.success("Training scripts saved!");
                  }}
                >
                  <CheckCircle className="mr-1 h-3 w-3" /> Start Training
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl font-serif">Get Started</CardTitle>
            <span className="text-xs font-mono text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex items-center gap-2 mt-3">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              const isDone = completed[step.id];
              const isCurrent = i === currentStep;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-body transition-colors ${
                    isCurrent
                      ? "bg-foreground text-background"
                      : isDone
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <CheckCircle className="h-3 w-3" /> : <StepIcon className="h-3 w-3" />}
                  {step.label}
                </button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="min-h-[250px]">
          {renderStep()}
        </CardContent>
        <div className="flex items-center justify-between px-6 pb-6">
          <Button
            variant="ghost"
            size="sm"
            className="font-body"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground font-body" onClick={handleSkip}>
              <SkipForward className="mr-1 h-3 w-3" /> Skip
            </Button>
            <Button size="sm" className="font-body" onClick={handleNext}>
              {currentStep === steps.length - 1 ? "Finish" : "Next"}{" "}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
