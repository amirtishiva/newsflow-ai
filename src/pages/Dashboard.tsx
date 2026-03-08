import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileEdit, Send, ArrowRight, BarChart3 } from "lucide-react";
import { mockTrendingTopics, mockDrafts, formatEngagement, sourceIcons } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const pendingDrafts = mockDrafts.filter((d) => d.status === "pending");
  const publishedDrafts = mockDrafts.filter((d) => d.status === "published");
  const topTrends = mockTrendingTopics.slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Your newsroom command center
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Trending Topics", value: mockTrendingTopics.length, icon: TrendingUp },
          { label: "Pending Drafts", value: pendingDrafts.length, icon: FileEdit },
          { label: "Published Today", value: publishedDrafts.length, icon: Send },
          { label: "Sources Active", value: 10, icon: BarChart3 },
        ].map((stat) => (
          <Card key={stat.label} className="border border-border">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-body uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-serif font-bold mt-1 text-foreground">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground opacity-30" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trends to Watch */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-serif">Trends to Watch</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">TOP 3</Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/trending")}>
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          {topTrends.map((topic) => {
            const SourceIcon = sourceIcons[topic.source];
            return (
              <div
                key={topic.id}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-accent/50 px-2 -mx-2 rounded cursor-pointer transition-colors"
                onClick={() => navigate("/trending")}
              >
                <div className="mt-0.5">
                  <SourceIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-semibold text-sm text-foreground">
                    {topic.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-body">
                    {topic.summary}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono font-bold text-foreground">
                    {formatEngagement(topic.engagement)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body">{topic.timestamp}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pending Drafts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-serif">Pending Review</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">
              {pendingDrafts.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/drafts")}>
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border">
          {pendingDrafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 hover:bg-accent/50 px-2 -mx-2 rounded cursor-pointer transition-colors"
              onClick={() => navigate("/drafts")}
            >
              <div className="flex-1 min-w-0">
                <p className="font-serif font-semibold text-sm text-foreground">{draft.topicTitle}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-body">
                  {draft.content}
                </p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {draft.contentLength}
                </Badge>
                <p className="text-[10px] text-muted-foreground mt-1 font-body">{draft.createdAt}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
