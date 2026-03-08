import { TrendingUp, Rss, Twitter, Youtube, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export interface TrendingTopic {
  id: string;
  title: string;
  source: "twitter" | "rss" | "youtube";
  sourceHandle: string;
  engagement: number;
  significanceScore: number;
  timestamp: string;
  summary: string;
  hasDraft: boolean;
}

export interface AIDraft {
  id: string;
  topicId: string;
  topicTitle: string;
  content: string;
  status: "pending" | "approved" | "rejected" | "published";
  contentLength: "short" | "medium" | "long";
  createdAt: string;
  updatedAt: string;
  tweetUrl?: string;
}

export interface MonitoredSource {
  id: string;
  type: "twitter" | "rss" | "youtube";
  handle: string;
  label: string;
  addedAt: string;
}

export interface Notification {
  id: string;
  type: "trend_alert" | "training_complete" | "delivery" | "override";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface TrainingScript {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: "processing" | "complete" | "error";
}

export const mockTrendingTopics: TrendingTopic[] = [
  { id: "t1", title: "Supreme Court Rules on Digital Privacy Rights", source: "twitter", sourceHandle: "@SCOTUSblog", engagement: 45200, timestamp: "12 min ago", summary: "The Supreme Court has issued a landmark ruling expanding digital privacy protections for citizens, potentially reshaping how tech companies handle user data.", hasDraft: true },
  { id: "t2", title: "Federal Reserve Signals Rate Cut in Q2", source: "rss", sourceHandle: "Reuters Finance", engagement: 32100, timestamp: "28 min ago", summary: "Fed Chair indicated a potential rate cut in Q2 2026, citing improving inflation metrics and stable employment figures.", hasDraft: false },
  { id: "t3", title: "SpaceX Starship Completes First Orbital Refueling", source: "youtube", sourceHandle: "@SpaceX", engagement: 89400, timestamp: "1 hr ago", summary: "SpaceX successfully demonstrated orbital refueling between two Starship vehicles, a critical milestone for the Artemis lunar program.", hasDraft: true },
  { id: "t4", title: "WHO Declares New Pandemic Preparedness Framework", source: "twitter", sourceHandle: "@WHO", engagement: 28700, timestamp: "2 hr ago", summary: "The World Health Organization has announced a new global pandemic preparedness framework with binding commitments from 140+ nations.", hasDraft: false },
  { id: "t5", title: "AI Regulation Bill Passes Senate Committee", source: "rss", sourceHandle: "Politico", engagement: 19800, timestamp: "3 hr ago", summary: "Bipartisan AI regulation bill advances through Senate committee, introducing mandatory safety testing and transparency requirements for frontier models.", hasDraft: true },
  { id: "t6", title: "Tesla Unveils Next-Gen Robotaxi Fleet", source: "youtube", sourceHandle: "@Tesla", engagement: 67300, timestamp: "4 hr ago", summary: "Tesla revealed its production-ready robotaxi fleet during a live event, announcing initial deployment in 5 US cities starting Q3 2026.", hasDraft: false },
  { id: "t7", title: "Climate Summit Reaches Historic Carbon Pledge", source: "twitter", sourceHandle: "@UN_Climate", engagement: 41200, timestamp: "5 hr ago", summary: "Nations at the Climate Summit have agreed to a historic pledge to reduce carbon emissions by 60% by 2035.", hasDraft: false },
  { id: "t8", title: "Major Cybersecurity Breach Hits Financial Sector", source: "rss", sourceHandle: "WSJ Tech", engagement: 55800, timestamp: "6 hr ago", summary: "A sophisticated cyberattack has compromised data at three major financial institutions, affecting millions of accounts.", hasDraft: true },
];

export const mockDrafts: AIDraft[] = [
  { id: "d1", topicId: "t1", topicTitle: "Supreme Court Rules on Digital Privacy Rights", content: "BREAKING: The Supreme Court just expanded digital privacy protections in a landmark ruling. This could fundamentally reshape how Big Tech handles your data. Here's what you need to know — and why it matters for every American. 🧵\n\nThe ruling establishes that digital footprints carry the same Fourth Amendment protections as physical property. Companies must now obtain explicit consent before collecting behavioral data.\n\nThis is the most significant privacy ruling since Carpenter v. United States in 2018.", status: "pending", contentLength: "medium", createdAt: "12 min ago", updatedAt: "12 min ago" },
  { id: "d2", topicId: "t3", topicTitle: "SpaceX Starship Completes First Orbital Refueling", content: "🚀 HISTORIC: SpaceX just nailed orbital refueling for the first time. This isn't just a space milestone — it's THE key technology that makes a permanent Moon base and Mars missions possible. The Artemis program just got very real.", status: "approved", contentLength: "short", createdAt: "1 hr ago", updatedAt: "45 min ago" },
  { id: "d3", topicId: "t5", topicTitle: "AI Regulation Bill Passes Senate Committee", content: "The AI regulation bill just cleared the Senate committee with bipartisan support. Mandatory safety testing. Transparency requirements. This could be the framework that shapes AI development for the next decade.\n\nKey provisions include:\n• Pre-deployment safety testing for frontier models\n• Public disclosure of training data sources\n• Annual algorithmic audits by independent third parties\n• Whistleblower protections for AI researchers\n\nBig Tech's response has been mixed — some welcome clarity, others warn of innovation slowdowns.", status: "pending", contentLength: "long", createdAt: "3 hr ago", updatedAt: "2 hr ago" },
  { id: "d4", topicId: "t8", topicTitle: "Major Cybersecurity Breach Hits Financial Sector", content: "⚠️ DEVELOPING: A major cyberattack has hit three financial institutions simultaneously. Millions of accounts potentially compromised. Authorities are investigating what appears to be a coordinated state-sponsored attack.", status: "published", contentLength: "short", createdAt: "6 hr ago", updatedAt: "5 hr ago" },
];

export const mockSources: MonitoredSource[] = [
  { id: "s1", type: "twitter", handle: "@SCOTUSblog", label: "SCOTUS Blog", addedAt: "2026-01-15" },
  { id: "s2", type: "twitter", handle: "@WHO", label: "World Health Org", addedAt: "2026-01-15" },
  { id: "s3", type: "twitter", handle: "@UN_Climate", label: "UN Climate", addedAt: "2026-02-01" },
  { id: "s4", type: "twitter", handle: "@AP", label: "Associated Press", addedAt: "2026-02-01" },
  { id: "s5", type: "rss", handle: "https://reuters.com/feed", label: "Reuters Finance", addedAt: "2026-01-20" },
  { id: "s6", type: "rss", handle: "https://politico.com/rss", label: "Politico", addedAt: "2026-01-20" },
  { id: "s7", type: "rss", handle: "https://wsj.com/tech/feed", label: "WSJ Tech", addedAt: "2026-02-10" },
  { id: "s8", type: "youtube", handle: "@SpaceX", label: "SpaceX", addedAt: "2026-01-25" },
  { id: "s9", type: "youtube", handle: "@Tesla", label: "Tesla", addedAt: "2026-01-25" },
  { id: "s10", type: "youtube", handle: "@CNN", label: "CNN", addedAt: "2026-02-05" },
];

export const mockNotifications: Notification[] = [
  { id: "n1", type: "trend_alert", title: "Trending: Supreme Court Privacy Ruling", message: "High-engagement topic detected across Twitter and RSS sources", timestamp: "12 min ago", read: false },
  { id: "n2", type: "trend_alert", title: "Trending: SpaceX Orbital Refueling", message: "89K+ engagements detected on YouTube source @SpaceX", timestamp: "1 hr ago", read: false },
  { id: "n3", type: "delivery", title: "Daily Digest Ready", message: "Your morning briefing is ready with 3 trends and 1 deep-dive report", timestamp: "10:00 AM", read: true },
  { id: "n4", type: "training_complete", title: "Style Training Updated", message: "AI model retrained with 2 new scripts. Voice accuracy improved.", timestamp: "Yesterday", read: true },
  { id: "n5", type: "trend_alert", title: "Cybersecurity Breach Alert", message: "Urgent: Major financial sector breach detected across multiple sources", timestamp: "6 hr ago", read: false },
];

export const mockTrainingScripts: TrainingScript[] = [
  { id: "ts1", fileName: "election_coverage_2024.docx", fileSize: "245 KB", uploadedAt: "2026-01-15", status: "complete" },
  { id: "ts2", fileName: "tech_industry_analysis.pdf", fileSize: "1.2 MB", uploadedAt: "2026-01-20", status: "complete" },
  { id: "ts3", fileName: "breaking_news_scripts.txt", fileSize: "89 KB", uploadedAt: "2026-02-01", status: "complete" },
  { id: "ts4", fileName: "opinion_editorials_collection.docx", fileSize: "340 KB", uploadedAt: "2026-02-10", status: "complete" },
  { id: "ts5", fileName: "investigative_report_series.pdf", fileSize: "2.1 MB", uploadedAt: "2026-02-15", status: "complete" },
  { id: "ts6", fileName: "social_media_threads.txt", fileSize: "156 KB", uploadedAt: "2026-03-01", status: "processing" },
];

export const sourceIcons = {
  twitter: Twitter,
  rss: Rss,
  youtube: Youtube,
};

export const statusConfig = {
  pending: { label: "Pending Review", color: "warning", icon: Clock },
  approved: { label: "Approved", color: "success", icon: CheckCircle },
  rejected: { label: "Rejected", color: "destructive", icon: XCircle },
  published: { label: "Published", color: "primary", icon: CheckCircle },
};

export function formatEngagement(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export interface ResearchReport {
  topicId: string;
  significanceScore: number;
  generatedAt: string;
  summary: string;
  keyFacts: string[];
  timeline: { time: string; description: string }[];
  quotes: { text: string; author: string; source: string }[];
  sources: { title: string; publisher: string; url: string }[];
}

export interface ActivityLog {
  id: string;
  eventType: string;
  reporter: string;
  details: string;
  timestamp: string;
}

export const mockResearchReports: ResearchReport[] = [
  {
    topicId: "t1",
    significanceScore: 94,
    generatedAt: "12 min ago",
    summary:
      "The Supreme Court issued a 6-3 landmark ruling expanding digital privacy protections, establishing that digital footprints carry Fourth Amendment protections equivalent to physical property. This decision could fundamentally reshape how technology companies collect, store, and monetize user data, with far-reaching implications for the $200B+ data brokerage industry.",
    keyFacts: [
      "6-3 ruling with Justice Roberts writing the majority opinion",
      "Digital footprints now carry the same Fourth Amendment protections as physical property",
      "Tech companies must obtain explicit opt-in consent before collecting behavioral data",
      "The ruling affects an estimated $200B+ data brokerage industry",
      "Implementation deadline set for 18 months from ruling date",
    ],
    timeline: [
      { time: "6 months ago", description: "Case filed by ACLU on behalf of privacy advocates" },
      { time: "3 months ago", description: "Oral arguments heard by the Supreme Court" },
      { time: "1 week ago", description: "Leaked draft opinion circulated among legal scholars" },
      { time: "Today, 10:32 AM", description: "Official ruling published by the Supreme Court" },
      { time: "Today, 11:15 AM", description: "Major tech companies issue initial responses" },
    ],
    quotes: [
      { text: "This ruling brings the Fourth Amendment into the digital age.", author: "Chief Justice Roberts", source: "Majority Opinion" },
      { text: "The era of unchecked data harvesting is over.", author: "ACLU Director", source: "Press Conference" },
      { text: "We will comply fully and support user privacy.", author: "Tech Industry Coalition", source: "Joint Statement" },
    ],
    sources: [
      { title: "Supreme Court Opinion No. 23-1847", publisher: "supremecourt.gov", url: "#" },
      { title: "Analysis: What the Ruling Means for Big Tech", publisher: "Reuters", url: "#" },
      { title: "Privacy Ruling Live Updates", publisher: "SCOTUSblog", url: "#" },
    ],
  },
  {
    topicId: "t3",
    significanceScore: 91,
    generatedAt: "1 hr ago",
    summary:
      "SpaceX successfully demonstrated orbital refueling between two Starship vehicles in low Earth orbit, a critical milestone for NASA's Artemis lunar program and future Mars missions. The operation transferred approximately 10 metric tons of liquid oxygen and methane between vehicles over a 45-minute window.",
    keyFacts: [
      "First successful orbital propellant transfer between two Starship vehicles",
      "Approximately 10 metric tons of propellant transferred over 45 minutes",
      "Critical milestone for NASA Artemis III lunar landing mission",
      "SpaceX received $3.4B NASA contract dependent on this capability",
      "Enables deep space missions requiring multiple refueling stops",
    ],
    timeline: [
      { time: "2 years ago", description: "SpaceX awarded $3.4B Artemis HLS contract by NASA" },
      { time: "6 months ago", description: "First Starship orbital test flight successful" },
      { time: "Yesterday", description: "Two Starship vehicles launched 4 hours apart" },
      { time: "Today, 08:47 UTC", description: "Vehicles achieved orbital rendezvous" },
      { time: "Today, 09:32 UTC", description: "Propellant transfer completed successfully" },
    ],
    quotes: [
      { text: "This changes everything for deep space exploration.", author: "Elon Musk", source: "X/Twitter" },
      { text: "A giant leap toward sustainable space infrastructure.", author: "NASA Administrator", source: "Press Briefing" },
    ],
    sources: [
      { title: "SpaceX Starship Refueling Mission Report", publisher: "SpaceX", url: "#" },
      { title: "NASA Artemis Program Update", publisher: "NASA.gov", url: "#" },
      { title: "Orbital Refueling: Technical Analysis", publisher: "Ars Technica", url: "#" },
    ],
  },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: "al1", eventType: "auth_login", reporter: "Jane Reporter", details: "Logged in from Chrome on macOS", timestamp: "2026-03-08 09:15" },
  { id: "al2", eventType: "draft_approved", reporter: "Jane Reporter", details: 'Approved draft "Supreme Court Rules on Digital Privacy Rights"', timestamp: "2026-03-08 09:22" },
  { id: "al3", eventType: "post_published", reporter: "Jane Reporter", details: 'Published to @JaneReporter: "BREAKING: Supreme Court expands digital privacy..."', timestamp: "2026-03-08 09:23" },
  { id: "al4", eventType: "source_added", reporter: "Jane Reporter", details: "Added Twitter source @BBCBreaking", timestamp: "2026-03-08 08:45" },
  { id: "al5", eventType: "script_uploaded", reporter: "Jane Reporter", details: "Uploaded training script: social_media_threads.txt (156 KB)", timestamp: "2026-03-01 14:30" },
  { id: "al6", eventType: "draft_rejected", reporter: "Jane Reporter", details: 'Rejected draft "WHO Pandemic Framework Analysis"', timestamp: "2026-03-07 16:10" },
  { id: "al7", eventType: "post_deleted", reporter: "Jane Reporter", details: 'Deleted tweet: "DEVELOPING: Cybersecurity breach..."', timestamp: "2026-03-07 11:45" },
  { id: "al8", eventType: "source_removed", reporter: "Jane Reporter", details: "Removed RSS source: TechCrunch Feed", timestamp: "2026-03-06 09:30" },
  { id: "al9", eventType: "auth_logout", reporter: "Jane Reporter", details: "Logged out", timestamp: "2026-03-05 18:00" },
  { id: "al10", eventType: "auth_login", reporter: "Jane Reporter", details: "Logged in from Safari on iOS", timestamp: "2026-03-05 08:12" },
  { id: "al11", eventType: "draft_approved", reporter: "Jane Reporter", details: 'Approved draft "SpaceX Starship Orbital Refueling"', timestamp: "2026-03-05 10:30" },
  { id: "al12", eventType: "post_published", reporter: "Jane Reporter", details: 'Published to @JaneReporter: "HISTORIC: SpaceX nails orbital refueling..."', timestamp: "2026-03-05 10:31" },
];
