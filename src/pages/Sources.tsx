import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Database, Twitter, Rss, Youtube, Plus, Trash2 } from "lucide-react";
import { mockSources, sourceIcons, type MonitoredSource } from "@/lib/mock-data";
import { toast } from "sonner";

const Sources = () => {
  const [sources, setSources] = useState<MonitoredSource[]>(mockSources);
  const [addOpen, setAddOpen] = useState(false);
  const [newType, setNewType] = useState<"twitter" | "rss" | "youtube">("twitter");
  const [newHandle, setNewHandle] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const twitterSources = sources.filter((s) => s.type === "twitter");
  const rssSources = sources.filter((s) => s.type === "rss");
  const youtubeSources = sources.filter((s) => s.type === "youtube");

  const handleAdd = () => {
    if (!newHandle.trim() || !newLabel.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    const newSource: MonitoredSource = {
      id: `s${Date.now()}`,
      type: newType,
      handle: newHandle,
      label: newLabel,
      addedAt: new Date().toISOString().slice(0, 10),
    };
    setSources((prev) => [...prev, newSource]);
    setNewHandle("");
    setNewLabel("");
    setAddOpen(false);
    toast.success(`${newType} source added.`);
  };

  const handleRemove = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    toast.success("Source removed.");
  };

  const SourceList = ({ items }: { items: MonitoredSource[] }) => (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">No sources configured.</p>
      )}
      {items.map((source) => {
        const Icon = sourceIcons[source.type];
        return (
          <div
            key={source.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{source.label}</p>
                <p className="text-xs font-mono text-muted-foreground">{source.handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Added {source.addedAt}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleRemove(source.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Source Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your monitored sources
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-1 h-4 w-4" /> Add Source
        </Button>
      </div>

      <Tabs defaultValue="twitter">
        <TabsList className="bg-secondary">
          <TabsTrigger value="twitter" className="data-[state=active]:bg-card">
            <Twitter className="mr-1 h-3 w-3" /> Twitter ({twitterSources.length})
          </TabsTrigger>
          <TabsTrigger value="rss" className="data-[state=active]:bg-card">
            <Rss className="mr-1 h-3 w-3" /> RSS ({rssSources.length})
          </TabsTrigger>
          <TabsTrigger value="youtube" className="data-[state=active]:bg-card">
            <Youtube className="mr-1 h-3 w-3" /> YouTube ({youtubeSources.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="twitter">
          <Card className="bg-card">
            <CardContent className="pt-4">
              <SourceList items={twitterSources} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rss">
          <Card className="bg-card">
            <CardContent className="pt-4">
              <SourceList items={rssSources} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="youtube">
          <Card className="bg-card">
            <CardContent className="pt-4">
              <SourceList items={youtubeSources} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter Handle</SelectItem>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="youtube">YouTube Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {newType === "twitter" ? "Handle" : newType === "rss" ? "Feed URL" : "Channel Handle"}
              </Label>
              <Input
                placeholder={
                  newType === "twitter" ? "@handle" : newType === "rss" ? "https://..." : "@channel"
                }
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Display Label</Label>
              <Input
                placeholder="e.g., Reuters Finance"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sources;
