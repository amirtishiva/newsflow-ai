import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Twitter, Rss, Youtube, Plus, Trash2 } from "lucide-react";
import { useSources, useAddSource, useRemoveSource } from "@/hooks/use-sources";
import { Skeleton } from "@/components/ui/skeleton";

const sourceIcons: Record<string, React.ElementType> = { twitter: Twitter, rss: Rss, youtube: Youtube };

const Sources = () => {
  const { data: sources, isLoading } = useSources();
  const addSource = useAddSource();
  const removeSource = useRemoveSource();
  const [addOpen, setAddOpen] = useState(false);
  const [newType, setNewType] = useState<"twitter" | "rss" | "youtube">("twitter");
  const [newHandle, setNewHandle] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const allSources = sources ?? [];
  const twitterSources = allSources.filter((s) => s.type === "twitter");
  const rssSources = allSources.filter((s) => s.type === "rss");
  const youtubeSources = allSources.filter((s) => s.type === "youtube");

  const handleAdd = () => {
    if (!newHandle.trim() || !newLabel.trim()) return;
    addSource.mutate({ type: newType, handle: newHandle, label: newLabel });
    setNewHandle("");
    setNewLabel("");
    setAddOpen(false);
  };

  const SourceList = ({ items }: { items: any[] }) => (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center font-body">No sources configured.</p>}
      {items.map((source) => {
        const Icon = sourceIcons[source.type] || Twitter;
        return (
          <div key={source.id} className="flex items-center justify-between p-3 rounded bg-muted hover:bg-accent transition-colors">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold font-body">{source.label}</p>
                <p className="text-xs font-mono text-muted-foreground">{source.handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-body">Added {new Date(source.added_at).toLocaleDateString()}</span>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeSource.mutate(source.id)}>
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
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Source Management</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">Configure your monitored sources</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="mr-1 h-4 w-4" /> Add Source</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : (
        <Tabs defaultValue="twitter">
          <TabsList>
            <TabsTrigger value="twitter"><Twitter className="mr-1 h-3 w-3" /> Twitter ({twitterSources.length})</TabsTrigger>
            <TabsTrigger value="rss"><Rss className="mr-1 h-3 w-3" /> RSS ({rssSources.length})</TabsTrigger>
            <TabsTrigger value="youtube"><Youtube className="mr-1 h-3 w-3" /> YouTube ({youtubeSources.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="twitter"><Card><CardContent className="pt-4"><SourceList items={twitterSources} /></CardContent></Card></TabsContent>
          <TabsContent value="rss"><Card><CardContent className="pt-4"><SourceList items={rssSources} /></CardContent></Card></TabsContent>
          <TabsContent value="youtube"><Card><CardContent className="pt-4"><SourceList items={youtubeSources} /></CardContent></Card></TabsContent>
        </Tabs>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">Add Source</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-body">Source Type</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter Handle</SelectItem>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="youtube">YouTube Channel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-body">{newType === "twitter" ? "Handle" : newType === "rss" ? "Feed URL" : "Channel Handle"}</Label>
              <Input placeholder={newType === "twitter" ? "@handle" : newType === "rss" ? "https://..." : "@channel"} value={newHandle} onChange={(e) => setNewHandle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Display Label</Label>
              <Input placeholder="e.g., Reuters Finance" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
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
