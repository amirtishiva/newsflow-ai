import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  Twitter,
  Clock,
  Mail,
  Trash2,
  Link,
  Ruler,
  GraduationCap,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { mockTrainingScripts, type TrainingScript } from "@/lib/mock-data";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 10;
const MIN_WORD_COUNT = 100;
const MAX_SCRIPTS = 20;

const Settings = () => {
  const [scripts, setScripts] = useState<TrainingScript[]>(mockTrainingScripts);
  const [deliveryTime, setDeliveryTime] = useState("10:00");
  const [deliveryDays, setDeliveryDays] = useState({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false,
  });
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [trendAlerts, setTrendAlerts] = useState(true);
  const [twitterConnected, setTwitterConnected] = useState(true);
  const [defaultLength, setDefaultLength] = useState<"short" | "medium" | "long">("medium");
  const [notifFrequency, setNotifFrequency] = useState<"immediate" | "hourly" | "daily">("immediate");
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [digestEnabled, setDigestEnabled] = useState(true);

  const trainingProgress = scripts.filter((s) => s.status === "complete").length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [".txt", ".docx", ".pdf"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error("Invalid file type. Only .txt, .docx, and .pdf are accepted.");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller file.`);
      return;
    }

    // Validate max scripts
    if (scripts.length >= MAX_SCRIPTS) {
      toast.error(`Maximum of ${MAX_SCRIPTS} scripts reached. Remove one before uploading.`);
      return;
    }

    // Simulate word count validation for .txt files
    if (ext === ".txt") {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const wordCount = text.trim().split(/\s+/).length;
        if (wordCount < MIN_WORD_COUNT) {
          toast.error(`Script must contain at least ${MIN_WORD_COUNT} words. Found ${wordCount}.`);
          return;
        }
        addScript(file);
      };
      reader.readAsText(file);
    } else {
      // For docx/pdf, we'd validate server-side; proceed with upload
      addScript(file);
    }

    e.target.value = "";
  };

  const addScript = (file: File) => {
    const sizeStr = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const newScript: TrainingScript = {
      id: `ts${Date.now()}`,
      fileName: file.name,
      fileSize: sizeStr,
      uploadedAt: new Date().toISOString().slice(0, 10),
      status: "processing",
    };
    setScripts((prev) => [...prev, newScript]);
    toast.success("Script uploaded. Processing...");

    setTimeout(() => {
      setScripts((prev) =>
        prev.map((s) => (s.id === newScript.id ? { ...s, status: "complete" as const } : s))
      );
      toast.success("Script processing complete!");
    }, 3000);
  };

  const handleRemoveScript = (id: string) => {
    setScripts((prev) => prev.filter((s) => s.id !== id));
    toast.success("Script removed.");
  };

  const statusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle className="h-3 w-3 text-success" />;
    if (status === "processing") return <Loader2 className="h-3 w-3 text-warning animate-spin" />;
    return <AlertCircle className="h-3 w-3 text-destructive" />;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Configure your profile, AI training, and delivery preferences
        </p>
      </div>

      <Tabs defaultValue="training">
        <TabsList>
          <TabsTrigger value="training">
            <FileText className="mr-1 h-3 w-3" /> Style Training
          </TabsTrigger>
          <TabsTrigger value="content">
            <Ruler className="mr-1 h-3 w-3" /> Content
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Clock className="mr-1 h-3 w-3" /> Delivery
          </TabsTrigger>
          <TabsTrigger value="twitter">
            <Twitter className="mr-1 h-3 w-3" /> Twitter
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Mail className="mr-1 h-3 w-3" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Style Training Tab */}
        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">AI Writing Style Training</CardTitle>
              <p className="text-xs text-muted-foreground font-body">
                Upload your best scripts to train the AI to write in your voice.
                Accepted: .txt, .docx, .pdf · Max 10MB · Min 100 words
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold font-body">Training Progress</span>
                  <span className="text-xs font-mono text-foreground">
                    {trainingProgress}/{MAX_SCRIPTS} scripts
                  </span>
                </div>
                <Progress value={(trainingProgress / MAX_SCRIPTS) * 100} className="h-2" />
                {trainingProgress < 5 && (
                  <p className="text-[11px] text-warning mt-1.5 font-body">
                    Upload at least 5 scripts to enable AI drafting
                  </p>
                )}
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.docx,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="flex items-center justify-center w-full h-10 rounded-md border border-input bg-background hover:bg-accent transition-colors text-sm font-body">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Script (.txt, .docx, .pdf)
                </div>
              </label>

              <div className="space-y-2">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className="flex items-center justify-between p-3 rounded bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(script.status)}
                      <div>
                        <p className="text-sm font-semibold font-body">{script.fileName}</p>
                        <p className="text-[10px] text-muted-foreground font-body">
                          {script.fileSize} · Uploaded {script.uploadedAt}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveScript(script.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Length Preference Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Content Length Preferences</CardTitle>
              <p className="text-xs text-muted-foreground font-body">
                Set your default AI draft length. You can override this per individual draft.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="font-body">Default Draft Length</Label>
                <Select value={defaultLength} onValueChange={(v) => setDefaultLength(v as "short" | "medium" | "long")}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (up to 280 chars)</SelectItem>
                    <SelectItem value="medium">Medium (280–500 chars)</SelectItem>
                    <SelectItem value="long">Long (500–1000 chars)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded bg-muted space-y-2">
                <p className="text-sm font-semibold font-body">Length Guide</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Short", desc: "Single tweet, up to 280 characters", chars: "≤280" },
                    { label: "Medium", desc: "Extended tweet or thread opener", chars: "280–500" },
                    { label: "Long", desc: "Thread or detailed analysis", chars: "500–1000" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`p-3 rounded border text-center transition-colors ${
                        defaultLength === item.label.toLowerCase()
                          ? "border-foreground bg-background"
                          : "border-border"
                      }`}
                    >
                      <p className="text-sm font-semibold font-body">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">{item.chars}</p>
                      <p className="text-[11px] text-muted-foreground font-body mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => toast.success("Content preferences saved!")} className="font-body">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Daily Digest Delivery</CardTitle>
              <p className="text-xs text-muted-foreground font-body">
                Configure when you receive your daily briefing
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-body">Enable Daily Digest</p>
                  <p className="text-xs text-muted-foreground font-body">Receive a daily summary of top trending topics</p>
                </div>
                <Switch checked={digestEnabled} onCheckedChange={setDigestEnabled} />
              </div>

              {digestEnabled && (
                <>
                  <div className="space-y-2">
                    <Label className="font-body">Delivery Time</Label>
                    <Input
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-body">Delivery Days</Label>
                    <div className="flex gap-2">
                      {Object.entries(deliveryDays).map(([day, active]) => (
                        <Button
                          key={day}
                          size="sm"
                          variant={active ? "default" : "outline"}
                          className="text-xs h-8 w-10 font-body"
                          onClick={() =>
                            setDeliveryDays((prev) => ({ ...prev, [day]: !prev[day as keyof typeof prev] }))
                          }
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Button onClick={() => toast.success("Delivery schedule saved!")} className="font-body">
                Save Schedule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Twitter Tab */}
        <TabsContent value="twitter">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Twitter/X Connection</CardTitle>
              <p className="text-xs text-muted-foreground font-body">
                Connect your personal Twitter account for publishing
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {twitterConnected ? (
                <div className="flex items-center justify-between p-4 rounded bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center">
                      <Twitter className="h-5 w-5 text-background" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold font-body">@JaneReporter</p>
                      <p className="text-xs text-muted-foreground font-body">Connected via OAuth 2.0</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
                      <CheckCircle className="mr-1 h-3 w-3" /> Connected
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 font-body"
                      onClick={() => {
                        setTwitterConnected(false);
                        toast.info("Twitter disconnected.");
                      }}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="w-full font-body"
                  onClick={() => {
                    setTwitterConnected(true);
                    toast.success("Twitter account connected!");
                  }}
                >
                  <Link className="mr-2 h-4 w-4" />
                  Connect Twitter Account
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Notification Preferences</CardTitle>
              <p className="text-xs text-muted-foreground font-body">
                Control how and when you receive alerts
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-body">In-App Notifications</p>
                  <p className="text-xs text-muted-foreground font-body">Show notifications inside the platform</p>
                </div>
                <Switch checked={inAppAlerts} onCheckedChange={setInAppAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-body">Email Notifications</p>
                  <p className="text-xs text-muted-foreground font-body">Receive alerts via email</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-body">Real-Time Trend Alerts</p>
                  <p className="text-xs text-muted-foreground font-body">Get notified instantly for high-engagement topics</p>
                </div>
                <Switch checked={trendAlerts} onCheckedChange={setTrendAlerts} />
              </div>

              <div className="space-y-2">
                <Label className="font-body">Notification Frequency</Label>
                <Select value={notifFrequency} onValueChange={(v) => setNotifFrequency(v as "immediate" | "hourly" | "daily")}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 p-4 rounded bg-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold font-body">Quiet Hours</p>
                    <p className="text-xs text-muted-foreground font-body">No notifications during these hours</p>
                  </div>
                  <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
                </div>
                {quietHoursEnabled && (
                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-body">From</Label>
                      <Input
                        type="time"
                        value={quietStart}
                        onChange={(e) => setQuietStart(e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-body">To</Label>
                      <Input
                        type="time"
                        value={quietEnd}
                        onChange={(e) => setQuietEnd(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={() => toast.success("Notification preferences saved!")} className="font-body">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
