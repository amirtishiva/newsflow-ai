import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  Quote,
  BarChart3,
  ExternalLink,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { mockTrendingTopics, mockResearchReports, sourceIcons } from "@/lib/mock-data";

const ResearchReport = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const topic = mockTrendingTopics.find((t) => t.id === topicId);
  const report = mockResearchReports.find((r) => r.topicId === topicId);

  if (!topic || !report) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="font-body">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground font-body">
            Research report not found for this topic.
          </CardContent>
        </Card>
      </div>
    );
  }

  const SourceIcon = sourceIcons[topic.source];

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="font-body">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Trending
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] font-mono capitalize">
            <SourceIcon className="mr-1 h-3 w-3" />
            {topic.source}
          </Badge>
          <Badge variant="outline" className="text-[10px] font-mono">
            <TrendingUp className="mr-1 h-3 w-3" />
            Significance: {report.significanceScore}/100
          </Badge>
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          {topic.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Deep Research Report · Generated {report.generatedAt}
        </p>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed font-body text-foreground">
            {report.summary}
          </p>
        </CardContent>
      </Card>

      {/* Key Facts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Key Facts & Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {report.keyFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                  {i + 1}
                </span>
                <p className="text-sm font-body text-foreground leading-relaxed">{fact}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Topic Development Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.timeline.map((event, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-foreground shrink-0 mt-1.5" />
                  {i < report.timeline.length - 1 && (
                    <div className="w-px h-full bg-border min-h-[24px]" />
                  )}
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

      {/* Relevant Quotes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <Quote className="h-4 w-4 text-muted-foreground" />
            Relevant Quotes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.quotes.map((q, i) => (
            <div key={i} className="border-l-2 border-foreground/20 pl-4 py-1">
              <p className="text-sm font-body italic text-foreground leading-relaxed">
                "{q.text}"
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-body">
                — {q.author}, <span className="font-mono">{q.source}</span>
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Source Citations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-serif flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            Source Citations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.sources.map((src, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded bg-muted hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-muted-foreground">[{i + 1}]</span>
                  <div>
                    <p className="text-sm font-semibold font-body">{src.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{src.publisher}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-xs h-7 font-body" asChild>
                  <a href={src.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1 h-3 w-3" /> View
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button className="font-body" onClick={() => navigate("/drafts")}>
          <Sparkles className="mr-1 h-4 w-4" /> Generate Draft from Report
        </Button>
        <Button variant="outline" className="font-body" onClick={() => navigate("/trending")}>
          Back to Trending
        </Button>
      </div>
    </div>
  );
};

export default ResearchReport;
