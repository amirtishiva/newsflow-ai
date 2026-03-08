import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Quote, BarChart3, ExternalLink, FileText, Sparkles, TrendingUp, Twitter, Rss, Youtube } from "lucide-react";
import { useResearchReport, useTopic } from "@/hooks/use-research-report";
import { Skeleton } from "@/components/ui/skeleton";

const sourceIcons: Record<string, React.ElementType> = { twitter: Twitter, rss: Rss, youtube: Youtube };

const ResearchReport = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const { data: topic, isLoading: topicLoading } = useTopic(topicId);
  const { data: report, isLoading: reportLoading } = useResearchReport(topicId);

  if (topicLoading || reportLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="font-body"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
        <Card><CardContent className="py-12 text-center text-muted-foreground font-body">Topic not found.</CardContent></Card>
      </div>
    );
  }

  const SourceIcon = sourceIcons[topic.source] || TrendingUp;

  if (!report) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="font-body"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Trending</Button>
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">{topic.title}</h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">No research report generated yet for this topic.</p>
        </div>
        <Card><CardContent className="py-12 text-center text-muted-foreground font-body">
          <p className="mb-4">Generate a research report using AI to get deep insights on this topic.</p>
          <Button className="font-body"><Sparkles className="mr-1 h-4 w-4" /> Generate Research Report</Button>
        </CardContent></Card>
      </div>
    );
  }

  const keyFacts = (report.key_facts as any[]) || [];
  const timeline = (report.timeline as any[]) || [];
  const quotes = (report.quotes as any[]) || [];
  const sources = (report.sources as any[]) || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="font-body"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Trending</Button>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] font-mono capitalize"><SourceIcon className="mr-1 h-3 w-3" />{topic.source}</Badge>
          <Badge variant="outline" className="text-[10px] font-mono"><TrendingUp className="mr-1 h-3 w-3" />Significance: {report.significance_score}/100</Badge>
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">{topic.title}</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Deep Research Report · Generated {new Date(report.generated_at).toLocaleString()}</p>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base font-serif flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />Executive Summary</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-relaxed font-body text-foreground">{report.summary}</p></CardContent>
      </Card>

      {keyFacts.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-serif flex items-center gap-2"><BarChart3 className="h-4 w-4 text-muted-foreground" />Key Facts</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {keyFacts.map((fact: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-mono font-bold shrink-0">{i + 1}</span>
                  <p className="text-sm font-body text-foreground leading-relaxed">{fact}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-serif flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((event: any, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-foreground shrink-0 mt-1.5" />
                    {i < timeline.length - 1 && <div className="w-px h-full bg-border min-h-[24px]" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-[11px] font-mono text-muted-foreground">{event.time}</p>
                    <p className="text-sm font-body text-foreground mt-0.5">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {quotes.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-serif flex items-center gap-2"><Quote className="h-4 w-4 text-muted-foreground" />Quotes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {quotes.map((q: any, i: number) => (
              <div key={i} className="border-l-2 border-foreground/20 pl-4 py-1">
                <p className="text-sm font-body italic text-foreground leading-relaxed">"{q.text}"</p>
                <p className="text-xs text-muted-foreground mt-1 font-body">— {q.author}, <span className="font-mono">{q.source}</span></p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {sources.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base font-serif flex items-center gap-2"><ExternalLink className="h-4 w-4 text-muted-foreground" />Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sources.map((src: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded bg-muted">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground">[{i + 1}]</span>
                    <div>
                      <p className="text-sm font-semibold font-body">{src.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{src.publisher}</p>
                    </div>
                  </div>
                  {src.url && src.url !== "#" && (
                    <Button size="sm" variant="ghost" className="text-xs h-7 font-body" asChild>
                      <a href={src.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3 w-3" /> View</a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button className="font-body" onClick={() => navigate("/drafts")}><Sparkles className="mr-1 h-4 w-4" /> Generate Draft from Report</Button>
        <Button variant="outline" className="font-body" onClick={() => navigate("/trending")}>Back to Trending</Button>
      </div>
    </div>
  );
};

export default ResearchReport;
