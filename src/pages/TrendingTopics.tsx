import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TrendingUp, Search, Sparkles, ExternalLink, FileText, Twitter, Rss, Youtube } from "lucide-react";
import { useTrendingTopics } from "@/hooks/use-trending-topics";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const sourceIcons: Record<string, React.ElementType> = { twitter: Twitter, rss: Rss, youtube: Youtube };

function formatEngagement(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

const TrendingTopics = () => {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [generateTopicId, setGenerateTopicId] = useState<string | null>(null);
  const [draftLength, setDraftLength] = useState<"short" | "medium" | "long">("medium");
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: topics, isLoading } = useTrendingTopics(filter);

  const filtered = (topics ?? []).filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const generateTopic = filtered.find((t) => t.id === generateTopicId);

  const handleGenerate = async () => {
    if (!generateTopic || !user) return;
    // Insert draft directly (edge function can be used later with Gemini)
    const { error } = await supabase.from("ai_drafts").insert({
      user_id: user.id,
      topic_id: generateTopic.id,
      topic_title: generateTopic.title,
      content: `AI-generated ${draftLength} draft for "${generateTopic.title}": ${generateTopic.summary}`,
      content_length: draftLength as any,
      status: "pending" as any,
    });
    if (!error) {
      await supabase.from("trending_topics").update({ has_draft: true }).eq("id", generateTopic.id);
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["trending-topics"] });
      toast.success("Draft generated! Check AI Drafts.");
    } else {
      toast.error(error.message);
    }
    setGenerateTopicId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Trending Topics</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Live feed from all monitored sources · Sorted by significance</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search topics..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="rss">RSS Feeds</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground font-body">No trending topics found. Configure sources to start monitoring.</CardContent></Card>
        ) : (
          filtered.map((topic) => {
            const SourceIcon = sourceIcons[topic.source] || TrendingUp;
            return (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 rounded bg-muted"><SourceIcon className="h-4 w-4 text-muted-foreground" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-serif font-semibold text-sm text-foreground">{topic.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 font-body">
                            via <span className="font-mono">{topic.source_handle}</span> · {new Date(topic.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-sm font-mono font-bold text-foreground">{formatEngagement(topic.engagement)}</span>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Score: {topic.significance_score}/100</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono capitalize">{topic.source}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 font-body">{topic.summary}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline" className="text-xs h-7 font-body" onClick={() => navigate(`/research/${topic.id}`)}>
                          <FileText className="mr-1 h-3 w-3" /> Deep Research
                        </Button>
                        {topic.has_draft ? (
                          <Button size="sm" variant="outline" className="text-xs h-7 font-body" onClick={() => navigate("/drafts")}>
                            <ExternalLink className="mr-1 h-3 w-3" /> View Draft
                          </Button>
                        ) : (
                          <Button size="sm" className="text-xs h-7 font-body" onClick={() => setGenerateTopicId(topic.id)}>
                            <Sparkles className="mr-1 h-3 w-3" /> Generate Draft
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!generateTopicId} onOpenChange={() => setGenerateTopicId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif">Generate AI Draft</DialogTitle></DialogHeader>
          {generateTopic && (
            <div className="space-y-4">
              <div className="p-3 rounded bg-muted">
                <p className="text-sm font-serif font-semibold">{generateTopic.title}</p>
                <p className="text-xs text-muted-foreground font-body mt-1">{generateTopic.summary}</p>
              </div>
              <div className="space-y-2">
                <Label className="font-body">Draft Length</Label>
                <Select value={draftLength} onValueChange={(v) => setDraftLength(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short — up to 280 characters</SelectItem>
                    <SelectItem value="medium">Medium — 280–500 characters</SelectItem>
                    <SelectItem value="long">Long — 500–1000 characters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateTopicId(null)}>Cancel</Button>
            <Button onClick={handleGenerate}><Sparkles className="mr-1 h-4 w-4" /> Generate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrendingTopics;
