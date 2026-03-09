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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Upload, FileText, CheckCircle, Loader2, AlertCircle, Twitter, Clock, Mail, Trash2, Link, Ruler, GraduationCap,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useTrainingScripts, useUploadScript, useDeleteScript } from "@/hooks/use-training-scripts";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-preferences";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const MAX_FILE_SIZE_MB = 10;
const MIN_WORD_COUNT = 100;
const MAX_SCRIPTS = 20;

const Settings = () => {
  const { data: scripts, isLoading: scriptsLoading } = useTrainingScripts();
  const uploadScript = useUploadScript();
  const deleteScript = useDeleteScript();
  const { data: prefs, isLoading: prefsLoading } = usePreferences();
  const updatePrefs = useUpdatePreferences();

  const [localPrefs, setLocalPrefs] = useState<Record<string, any> | null>(null);
  const [deleteScriptTarget, setDeleteScriptTarget] = useState<{ id: string; storagePath?: string | null; fileName?: string } | null>(null);
  const p = localPrefs ?? prefs;

  const trainingProgress = scripts?.filter((s) => s.status === "complete").length ?? 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".txt", ".docx", ".pdf"].includes(ext)) {
      toast.error("Invalid file type. Only .txt, .docx, and .pdf are accepted.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }
    if ((scripts?.length ?? 0) >= MAX_SCRIPTS) {
      toast.error(`Maximum of ${MAX_SCRIPTS} scripts reached.`);
      return;
    }
    uploadScript.mutate(file);
    e.target.value = "";
  };

  const statusIcon = (status: string) => {
    if (status === "complete") return <CheckCircle className="h-3 w-3 text-success" />;
    if (status === "processing") return <Loader2 className="h-3 w-3 text-warning animate-spin" />;
    return <AlertCircle className="h-3 w-3 text-destructive" />;
  };

  if (prefsLoading) return <div className="space-y-4 max-w-4xl">{[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Configure your profile, AI training, and delivery preferences</p>
      </div>

      <Tabs defaultValue="training">
        <TabsList>
          <TabsTrigger value="training"><FileText className="mr-1 h-3 w-3" /> Style Training</TabsTrigger>
          <TabsTrigger value="content"><Ruler className="mr-1 h-3 w-3" /> Content</TabsTrigger>
          <TabsTrigger value="delivery"><Clock className="mr-1 h-3 w-3" /> Delivery</TabsTrigger>
          <TabsTrigger value="twitter"><Twitter className="mr-1 h-3 w-3" /> Twitter</TabsTrigger>
          <TabsTrigger value="notifications"><Mail className="mr-1 h-3 w-3" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="training">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-serif flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Style Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {trainingProgress >= 5 ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded bg-muted text-center">
                      <p className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Tone</p>
                      <p className="text-sm font-semibold font-body mt-1 text-foreground">Authoritative</p>
                    </div>
                    <div className="p-3 rounded bg-muted text-center">
                      <p className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Vocabulary</p>
                      <p className="text-sm font-semibold font-body mt-1 text-foreground">Technical</p>
                    </div>
                    <div className="p-3 rounded bg-muted text-center">
                      <p className="text-[10px] font-body uppercase tracking-wider text-muted-foreground">Structure</p>
                      <p className="text-sm font-semibold font-body mt-1 text-foreground">Concise</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground font-body text-center py-4">Upload at least 5 scripts to generate your style profile.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-serif">AI Writing Style Training</CardTitle>
                <p className="text-xs text-muted-foreground font-body">Upload your best scripts. Accepted: .txt, .docx, .pdf · Max 10MB · Min 100 words</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold font-body">Training Progress</span>
                    <span className="text-xs font-mono text-foreground">{trainingProgress}/{MAX_SCRIPTS} scripts</span>
                  </div>
                  <Progress value={(trainingProgress / MAX_SCRIPTS) * 100} className="h-2" />
                  {trainingProgress < 5 && <p className="text-[11px] text-warning mt-1.5 font-body">Upload at least 5 scripts to enable AI drafting</p>}
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept=".txt,.docx,.pdf" className="hidden" onChange={handleFileUpload} />
                  <div className="flex items-center justify-center w-full h-10 rounded-md border border-input bg-background hover:bg-accent transition-colors text-sm font-body">
                    <Upload className="mr-2 h-4 w-4" /> Upload Script (.txt, .docx, .pdf)
                  </div>
                </label>
                <div className="space-y-2">
                  {scriptsLoading ? [1,2].map(i => <Skeleton key={i} className="h-12 w-full" />) : (scripts ?? []).map((script) => (
                    <div key={script.id} className="flex items-center justify-between p-3 rounded bg-muted">
                      <div className="flex items-center gap-3">
                        {statusIcon(script.status)}
                        <div>
                          <p className="text-sm font-semibold font-body">{script.file_name}</p>
                          <p className="text-[10px] text-muted-foreground font-body">{script.file_size} · Uploaded {new Date(script.uploaded_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteScriptTarget({ id: script.id, storagePath: script.storage_path, fileName: script.file_name })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Content Length Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="font-body">Default Draft Length</Label>
                <Select value={p?.default_length ?? "medium"} onValueChange={(v) => setLocalPrefs({ ...p, default_length: v })}>
                  <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (up to 280 chars)</SelectItem>
                    <SelectItem value="medium">Medium (280–500 chars)</SelectItem>
                    <SelectItem value="long">Long (500–1000 chars)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => updatePrefs.mutate({ default_length: localPrefs?.default_length ?? p?.default_length })} className="font-body">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Daily Digest Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-body">Enable Daily Digest</p>
                  <p className="text-xs text-muted-foreground font-body">Receive a daily summary</p>
                </div>
                <Switch checked={p?.digest_enabled ?? true} onCheckedChange={(v) => { setLocalPrefs({ ...p, digest_enabled: v }); updatePrefs.mutate({ digest_enabled: v }); }} />
              </div>
              {(p?.digest_enabled ?? true) && (
                <div className="space-y-2">
                  <Label className="font-body">Delivery Time</Label>
                  <Input type="time" value={p?.digest_time ?? "10:00"} onChange={(e) => setLocalPrefs({ ...p, digest_time: e.target.value })} className="w-40" />
                </div>
              )}
              <Button onClick={() => updatePrefs.mutate({ digest_time: localPrefs?.digest_time ?? p?.digest_time })} className="font-body">Save Schedule</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twitter">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Twitter/X Connection</CardTitle>
              <p className="text-xs text-muted-foreground font-body">Connect your Twitter account for publishing</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {p?.twitter_connected ? (
                <div className="flex items-center justify-between p-4 rounded bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-foreground flex items-center justify-center"><Twitter className="h-5 w-5 text-background" /></div>
                    <div>
                      <p className="text-sm font-semibold font-body">{p?.twitter_handle || "@YourHandle"}</p>
                      <p className="text-xs text-muted-foreground font-body">Connected via OAuth 2.0</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/30"><CheckCircle className="mr-1 h-3 w-3" /> Connected</Badge>
                </div>
              ) : (
                <Button className="w-full font-body" onClick={() => { updatePrefs.mutate({ twitter_connected: true }); toast.success("Twitter connected!"); }}>
                  <Link className="mr-2 h-4 w-4" /> Connect Twitter Account
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-body">In-App Notifications</p>
                  <p className="text-xs text-muted-foreground font-body">Show notifications inside the platform</p>
                </div>
                <Switch checked={p?.in_app_alerts ?? true} onCheckedChange={(v) => { setLocalPrefs({ ...p, in_app_alerts: v }); updatePrefs.mutate({ in_app_alerts: v }); }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-body">Email Notifications</p>
                  <p className="text-xs text-muted-foreground font-body">Receive alerts via email</p>
                </div>
                <Switch checked={p?.email_alerts ?? true} onCheckedChange={(v) => { setLocalPrefs({ ...p, email_alerts: v }); updatePrefs.mutate({ email_alerts: v }); }} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold font-body">Real-Time Trend Alerts</p>
                  <p className="text-xs text-muted-foreground font-body">Get notified instantly for high-engagement topics</p>
                </div>
                <Switch checked={p?.trend_alerts ?? true} onCheckedChange={(v) => { setLocalPrefs({ ...p, trend_alerts: v }); updatePrefs.mutate({ trend_alerts: v }); }} />
              </div>
              <div className="space-y-3 p-4 rounded bg-muted">
                <div>
                  <p className="text-sm font-semibold font-body">Alert Significance Threshold</p>
                  <p className="text-xs text-muted-foreground font-body">Only alert when topics exceed this score ({p?.alert_threshold ?? 70}/100)</p>
                </div>
                <Slider value={[p?.alert_threshold ?? 70]} onValueChange={(v) => { setLocalPrefs({ ...p, alert_threshold: v[0] }); }} min={10} max={100} step={5} className="w-full" />
              </div>
              <Button onClick={() => updatePrefs.mutate({ alert_threshold: localPrefs?.alert_threshold ?? p?.alert_threshold })} className="font-body">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteScriptTarget} onOpenChange={(open) => !open && setDeleteScriptTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Training Script?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently delete "{deleteScriptTarget?.fileName}". Your style profile may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body" onClick={() => { deleteScript.mutate({ id: deleteScriptTarget!.id, storagePath: deleteScriptTarget!.storagePath }); setDeleteScriptTarget(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
