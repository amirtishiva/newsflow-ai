import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, FileEdit, Send, ArrowRight, BarChart3, Bell } from "lucide-react";
import { Twitter, Rss, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrendingTopics } from "@/hooks/use-trending-topics";
import { useDrafts } from "@/hooks/use-drafts";
import { useNotifications } from "@/hooks/use-notifications";
import { useTrainingScripts } from "@/hooks/use-training-scripts";
import { useSources } from "@/hooks/use-sources";
import { Skeleton } from "@/components/ui/skeleton";

const sourceIcons: Record<string, React.ElementType> = { twitter: Twitter, rss: Rss, youtube: Youtube };

function formatEngagement(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const { data: topics, isLoading: topicsLoading } = useTrendingTopics(sourceFilter);
  const { data: allDrafts, isLoading: draftsLoading } = useDrafts();
  const { data: notifications } = useNotifications();
  const { data: scripts } = useTrainingScripts();
  const { data: sources } = useSources();

  const pendingDrafts = allDrafts?.filter((d) => d.status === "pending") ?? [];
  const publishedDrafts = allDrafts?.filter((d) => d.status === "published") ?? [];
  const unreadNotifs = notifications?.filter((n) => !n.read) ?? [];
  const trainingComplete = scripts?.filter((s) => s.status === "complete").length ?? 0;
  const trainingTotal = scripts?.length ?? 0;
  const topTrends = (topics ?? []).slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Your newsroom command center</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Trending Topics", value: topics?.length ?? 0, icon: TrendingUp },
          { label: "Pending Drafts", value: pendingDrafts.length, icon: FileEdit },
          { label: "Published", value: publishedDrafts.length, icon: Send },
          { label: "Sources Active", value: sources?.length ?? 0, icon: BarChart3 },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-body uppercase tracking-[0.15em] text-muted-foreground font-semibold">{stat.label}</p>
                  <p className="text-3xl font-serif font-bold mt-1 text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground opacity-30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Style Training Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-serif">Style Training Status</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">{trainingComplete}/{trainingTotal} complete</Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/settings")}>
            Manage <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={(trainingComplete / 20) * 100} className="h-2" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground font-body">
                {trainingComplete < 5 ? `Upload ${5 - trainingComplete} more scripts to enable AI drafting` : "AI voice model is active and learning"}
              </p>
              <span className="text-[10px] font-mono text-muted-foreground">{trainingComplete}/20 max</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends to Watch */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-serif">Trends to Watch</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">TOP 3</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-7 w-28 text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
                <SelectItem value="rss">RSS</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/trending")}>
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          {topicsLoading ? (
            <div className="space-y-3 py-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : topTrends.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center font-body">No trending topics yet. Configure sources to start monitoring.</p>
          ) : (
            topTrends.map((topic) => {
              const SourceIcon = sourceIcons[topic.source] || TrendingUp;
              return (
                <div key={topic.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-accent/50 px-2 -mx-2 rounded cursor-pointer transition-colors" onClick={() => navigate("/trending")}>
                  <div className="mt-0.5"><SourceIcon className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-semibold text-sm text-foreground">{topic.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-body">{topic.summary}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-foreground">{formatEngagement(topic.engagement)}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">Score: {topic.significance_score}</p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-serif">Notifications</CardTitle>
            {unreadNotifs.length > 0 && <Badge className="text-[10px]">{unreadNotifs.length} new</Badge>}
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/notifications")}>
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          {unreadNotifs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center font-body">No new notifications.</p>
          ) : (
            unreadNotifs.slice(0, 3).map((n) => (
              <div key={n.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold font-body text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Drafts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-serif">Pending Review</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">{pendingDrafts.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/drafts")}>
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            {draftsLoading ? (
              <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : pendingDrafts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center font-body">No pending drafts.</p>
            ) : (
              pendingDrafts.slice(0, 3).map((draft) => (
                <div key={draft.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-accent/50 px-2 -mx-2 rounded cursor-pointer transition-colors" onClick={() => navigate("/drafts")}>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-semibold text-sm text-foreground">{draft.topic_title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-body">{draft.content}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="text-[10px] font-mono">{draft.content_length}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Published Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-serif">Published Posts</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono">{publishedDrafts.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/published")}>
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-border">
            {publishedDrafts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center font-body">No published posts yet.</p>
            ) : (
              publishedDrafts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-accent/50 px-2 -mx-2 rounded cursor-pointer transition-colors" onClick={() => navigate("/published")}>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-semibold text-sm text-foreground">{post.topic_title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-body">{post.content}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="text-[10px] font-mono bg-success/10 text-success border-success/30">Published</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
