import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Search, Sparkles, ExternalLink, FileText } from "lucide-react";
import { mockTrendingTopics, formatEngagement, sourceIcons } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

const TrendingTopics = () => {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = mockTrendingTopics.filter((t) => {
    const matchesFilter = filter === "all" || t.source === filter;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          Trending Topics
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Live feed from all monitored sources
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
            <SelectItem value="rss">RSS Feeds</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {filtered.map((topic) => {
          const SourceIcon = sourceIcons[topic.source];
          return (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded bg-muted">
                    <SourceIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif font-semibold text-sm text-foreground">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 font-body">
                          via <span className="font-mono">{topic.sourceHandle}</span> · {topic.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-mono font-bold text-foreground">
                          {formatEngagement(topic.engagement)}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono capitalize">
                          {topic.source}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 font-body">{topic.summary}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" variant="outline" className="text-xs h-7 font-body" onClick={() => navigate(`/research/${topic.id}`)}>
                        <FileText className="mr-1 h-3 w-3" /> Deep Research
                      </Button>
                      {topic.hasDraft ? (
                        <Button size="sm" variant="outline" className="text-xs h-7 font-body" onClick={() => navigate("/drafts")}>
                          <ExternalLink className="mr-1 h-3 w-3" /> View Draft
                        </Button>
                      ) : (
                        <Button size="sm" className="text-xs h-7 font-body">
                          <Sparkles className="mr-1 h-3 w-3" /> Generate Draft
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingTopics;
