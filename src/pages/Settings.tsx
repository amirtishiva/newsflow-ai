import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
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
} from "lucide-react";
import { mockTrainingScripts, type TrainingScript } from "@/lib/mock-data";
import { toast } from "sonner";

const Settings = () => {
  const [scripts, setScripts] = useState<TrainingScript[]>(mockTrainingScripts);
  const [deliveryTime, setDeliveryTime] = useState("10:00");
  const [deliveryDays, setDeliveryDays] = useState({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false,
  });
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [trendAlerts, setTrendAlerts] = useState(true);
  const [twitterConnected, setTwitterConnected] = useState(true);

  const trainingProgress = scripts.filter((s) => s.status === "complete").length;
  const maxScripts = 20;

  const handleUpload = () => {
    const newScript: TrainingScript = {
      id: `ts${Date.now()}`,
      fileName: `new_script_${Date.now()}.txt`,
      fileSize: "120 KB",
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
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your profile, AI training, and delivery preferences
        </p>
      </div>

      <Tabs defaultValue="training">
        <TabsList className="bg-secondary">
          <TabsTrigger value="training" className="data-[state=active]:bg-card">
            <FileText className="mr-1 h-3 w-3" /> Style Training
          </TabsTrigger>
          <TabsTrigger value="delivery" className="data-[state=active]:bg-card">
            <Clock className="mr-1 h-3 w-3" /> Delivery
          </TabsTrigger>
          <TabsTrigger value="twitter" className="data-[state=active]:bg-card">
            <Twitter className="mr-1 h-3 w-3" /> Twitter
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-card">
            <Mail className="mr-1 h-3 w-3" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* Style Training */}
        <TabsContent value="training">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">AI Writing Style Training</CardTitle>
              <p className="text-xs text-muted-foreground">
                Upload your best scripts to train the AI to write in your voice
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Training Progress
                  </span>
                  <span className="text-xs font-mono text-primary">
                    {trainingProgress}/{maxScripts} scripts
                  </span>
                </div>
                <Progress value={(trainingProgress / maxScripts) * 100} className="h-2" />
                {trainingProgress < 5 && (
                  <p className="text-[11px] text-warning mt-1.5">
                    Upload at least 5 scripts to enable AI drafting
                  </p>
                )}
              </div>

              <Button onClick={handleUpload} variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload Script (.txt, .docx, .pdf)
              </Button>

              <div className="space-y-2">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(script.status)}
                      <div>
                        <p className="text-sm font-medium">{script.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">
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

        {/* Delivery Schedule */}
        <TabsContent value="delivery">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Daily Digest Delivery</CardTitle>
              <p className="text-xs text-muted-foreground">
                Configure when you receive your daily briefing
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Delivery Time</Label>
                <Input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-40 bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery Days</Label>
                <div className="flex gap-2">
                  {Object.entries(deliveryDays).map(([day, active]) => (
                    <Button
                      key={day}
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className={`text-xs h-8 w-10 ${active ? "bg-primary text-primary-foreground" : ""}`}
                      onClick={() =>
                        setDeliveryDays((prev) => ({ ...prev, [day]: !prev[day as keyof typeof prev] }))
                      }
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={() => toast.success("Delivery schedule saved!")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Schedule
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Twitter Connection */}
        <TabsContent value="twitter">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Twitter/X Connection</CardTitle>
              <p className="text-xs text-muted-foreground">
                Connect your personal Twitter account for publishing
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {twitterConnected ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                      <Twitter className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">@JaneReporter</p>
                      <p className="text-xs text-muted-foreground">Connected via OAuth 2.0</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30">
                      <CheckCircle className="mr-1 h-3 w-3" /> Connected
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
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
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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

        {/* Notification Preferences */}
        <TabsContent value="notifications">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <p className="text-xs text-muted-foreground">
                Control how and when you receive alerts
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive alerts via email</p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Real-Time Trend Alerts</p>
                  <p className="text-xs text-muted-foreground">Get notified instantly for high-engagement topics</p>
                </div>
                <Switch checked={trendAlerts} onCheckedChange={setTrendAlerts} />
              </div>

              <Button onClick={() => toast.success("Notification preferences saved!")} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
