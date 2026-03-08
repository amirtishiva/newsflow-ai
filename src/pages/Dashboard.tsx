import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileEdit, Send, Eye, Zap, ArrowRight, BarChart3 } from "lucide-react";
import { mockTrendingTopics, mockDrafts, formatEngagement, sourceIcons } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const pendingDrafts = mockDrafts.filter((d) => d.status === "pending");
  const publishedDrafts = mockDrafts.filter((d) => d.status === "published");
  const topTrends = mockTrendingTopics.slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your newsroom command center
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Trending Topics", value: mockTrendingTopics.length, icon: TrendingUp, accent: "text-primary" },
          { label: "Pending Drafts", value: pendingDrafts.length, icon: FileEdit, accent: "text-warning" },
          { label: "Published Today", value: publishedDrafts.length, icon: Send, accent: "text-success" },
          { label: "Sources Active", value: 10, icon: BarChart3, accent: "text-primary" },
        ].map((stat) => (
          <Card key={stat.label} className="gradient-border bg-card">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${stat.accent}`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.accent} opacity-30`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trends to Watch */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Trends to Watch</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">TOP 3</Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/trending")}>
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {topTrends.map((topic) => {
            const SourceIcon = sourceIcons[topic.source];
            return (
              <div
                key={topic.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer group"
                onClick={() => navigate("/trending")}
              >
                <div className="mt-0.5">
                  <SourceIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">
                    {topic.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {topic.summary}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono text-primary">
                    {formatEngagement(topic.engagement)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{topic.timestamp}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Pending Drafts */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <FileEdit className="h-4 w-4 text-warning" />
            <CardTitle className="text-base">Pending Review</CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono bg-warning/10 text-warning border-warning/30">
              {pendingDrafts.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/drafts")}>
            View all <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingDrafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              onClick={() => navigate("/drafts")}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{draft.topicTitle}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {draft.content}
                </p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {draft.contentLength}
                </Badge>
                <p className="text-[10px] text-muted-foreground mt-1">{draft.createdAt}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
