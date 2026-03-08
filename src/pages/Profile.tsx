import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Twitter,
  Mail,
  MapPin,
  Calendar,
  FileEdit,
  Send,
  TrendingUp,
  FileText,
  CheckCircle,
  Loader2,
  ExternalLink,
  Pencil,
  Database,
  BarChart3,
} from "lucide-react";
import { mockDrafts, mockTrainingScripts, mockTrendingTopics, mockSources } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";

const reporterProfile = {
  name: "Jane Reporter",
  title: "Senior Correspondent",
  email: "jane.reporter@globalwire.com",
  location: "Washington, D.C.",
  beat: "Technology, Policy & National Security",
  bio: "Award-winning journalist with 12 years of experience covering the intersection of technology and public policy. Former White House correspondent. Two-time Pulitzer finalist for investigative reporting on AI governance and digital privacy.",
  joinedDate: "January 2026",
  twitterHandle: "@JaneReporter",
  twitterFollowers: "142K",
  twitterConnected: true,
  avatar: "JR",
  newsroom: "Global Wire News",
};

const styleProfile = {
  tone: { label: "Authoritative", description: "Direct, confident phrasing with strong leads" },
  vocabulary: { label: "Technical", description: "Industry-specific terms, accessible explanations" },
  structure: { label: "Concise", description: "Short sentences, active voice, inverted pyramid" },
  signature: [
    "Thread-style breakdowns with numbered points",
    "Opens with BREAKING or key emoji indicators",
    "Closes with contextual significance statement",
    "Uses rhetorical questions to engage audience",
  ],
};

const Profile = () => {
  const navigate = useNavigate();

  const totalDrafts = mockDrafts.length;
  const publishedCount = mockDrafts.filter((d) => d.status === "published").length;
  const approvedCount = mockDrafts.filter((d) => d.status === "approved").length;
  const pendingCount = mockDrafts.filter((d) => d.status === "pending").length;
  const trainingComplete = mockTrainingScripts.filter((s) => s.status === "complete").length;
  const trainingTotal = mockTrainingScripts.length;
  const sourcesCount = mockSources.length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-foreground flex items-center justify-center text-2xl font-serif font-bold text-background shrink-0">
              {reporterProfile.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-foreground">
                    {reporterProfile.name}
                  </h1>
                  <p className="text-sm text-muted-foreground font-body mt-0.5">
                    {reporterProfile.title} · {reporterProfile.newsroom}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="font-body" onClick={() => navigate("/settings")}>
                  <Pencil className="mr-1 h-3 w-3" /> Edit Profile
                </Button>
              </div>
              <p className="text-sm font-body text-foreground mt-3 leading-relaxed">
                {reporterProfile.bio}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                  <MapPin className="h-3 w-3" /> {reporterProfile.location}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                  <Mail className="h-3 w-3" /> {reporterProfile.email}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                  <Calendar className="h-3 w-3" /> Joined {reporterProfile.joinedDate}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-body">
                  <Twitter className="h-3 w-3" />
                  <span className="font-mono">{reporterProfile.twitterHandle}</span>
                  <Badge variant="outline" className="text-[9px] bg-success/10 text-success border-success/30 ml-1">
                    Connected
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Published Posts", value: publishedCount, icon: Send, color: "text-success" },
          { label: "Pending Review", value: pendingCount, icon: FileEdit, color: "text-warning" },
          { label: "Sources Monitored", value: sourcesCount, icon: Database, color: "text-foreground" },
          { label: "Twitter Followers", value: reporterProfile.twitterFollowers, icon: Twitter, color: "text-foreground" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-body uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-serif font-bold mt-1 text-foreground">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-6 w-6 opacity-30 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Style Profile */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-serif">AI Style Profile</CardTitle>
              <Badge variant="outline" className="text-[10px] font-mono bg-success/10 text-success border-success/30">
                <CheckCircle className="mr-1 h-3 w-3" /> Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(styleProfile).filter(([k]) => k !== "signature").map(([key, val]) => {
                const v = val as { label: string; description: string };
                return (
                  <div key={key} className="p-3 rounded bg-muted text-center">
                    <p className="text-[9px] font-body uppercase tracking-wider text-muted-foreground">{key}</p>
                    <p className="text-sm font-semibold font-body mt-1 text-foreground">{v.label}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5">{v.description}</p>
                  </div>
                );
              })}
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold font-body text-foreground mb-2">Signature Patterns</p>
              <ul className="space-y-1.5">
                {styleProfile.signature.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                    <span className="text-xs font-body text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Training Progress */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-serif">Style Training</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/settings")}>
                Manage
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold font-body">Scripts Processed</span>
                <span className="text-xs font-mono text-foreground">{trainingComplete}/20</span>
              </div>
              <Progress value={(trainingComplete / 20) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              {mockTrainingScripts.slice(0, 5).map((script) => (
                <div key={script.id} className="flex items-center justify-between p-2 rounded bg-muted">
                  <div className="flex items-center gap-2">
                    {script.status === "complete" ? (
                      <CheckCircle className="h-3 w-3 text-success" />
                    ) : (
                      <Loader2 className="h-3 w-3 text-warning animate-spin" />
                    )}
                    <span className="text-xs font-body truncate max-w-[180px]">{script.fileName}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{script.fileSize}</span>
                </div>
              ))}
              {mockTrainingScripts.length > 5 && (
                <p className="text-[10px] text-muted-foreground text-center font-body">
                  +{mockTrainingScripts.length - 5} more scripts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif">Content Activity</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/drafts")}>
                Drafts
              </Button>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/published")}>
                Published
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { label: "Total Drafts", value: totalDrafts },
              { label: "Published", value: publishedCount },
              { label: "Approved", value: approvedCount },
              { label: "Pending", value: pendingCount },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded bg-muted">
                <p className="text-xl font-serif font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <Separator className="mb-4" />
          <div className="space-y-0 divide-y divide-border">
            {mockDrafts.slice(0, 3).map((draft) => (
              <div key={draft.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="mt-0.5">
                  {draft.status === "published" ? (
                    <Send className="h-3.5 w-3.5 text-success" />
                  ) : draft.status === "approved" ? (
                    <CheckCircle className="h-3.5 w-3.5 text-foreground" />
                  ) : (
                    <FileEdit className="h-3.5 w-3.5 text-warning" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-serif font-semibold text-foreground">{draft.topicTitle}</p>
                  <p className="text-xs text-muted-foreground font-body line-clamp-1 mt-0.5">{draft.content}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono capitalize ${
                      draft.status === "published"
                        ? "bg-success/10 text-success border-success/30"
                        : draft.status === "approved"
                        ? "bg-foreground/10 text-foreground border-foreground/30"
                        : "bg-warning/10 text-warning border-warning/30"
                    }`}
                  >
                    {draft.status}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1 font-body">{draft.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitored Sources Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif">Monitored Sources</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground font-body" onClick={() => navigate("/sources")}>
              Manage Sources
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Twitter", count: mockSources.filter((s) => s.type === "twitter").length, icon: Twitter },
              { label: "RSS Feeds", count: mockSources.filter((s) => s.type === "rss").length, icon: BarChart3 },
              { label: "YouTube", count: mockSources.filter((s) => s.type === "youtube").length, icon: ExternalLink },
            ].map((src) => (
              <div key={src.label} className="flex items-center gap-3 p-3 rounded bg-muted">
                <src.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-serif font-bold text-foreground">{src.count}</p>
                  <p className="text-[10px] font-body text-muted-foreground">{src.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
