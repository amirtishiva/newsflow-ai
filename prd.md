# Product Requirements Document (PRD)
## News2Flow AI — AI-Powered Newsroom Intelligence Platform

**Version:** 1.0  
**Date:** March 8, 2026  
**Status:** In Development (Frontend MVP)

---

## 1. App Overview and Objectives

### 1.1 Overview
News2Flow AI is a web-based, AI-powered newsroom content management platform designed for modern reporters, journalists, and editorial teams. It automates the end-to-end editorial workflow — from discovering trending topics and conducting deep research, to generating AI-written drafts in the reporter's unique voice, and publishing approved content directly to social platforms like Twitter/X.

### 1.2 Objectives
- **Accelerate news production** by reducing the time from trend discovery to published story from hours to minutes.
- **Maintain editorial authenticity** by training AI models on each reporter's writing samples to replicate their unique voice, tone, and style.
- **Centralize source monitoring** across Twitter, RSS feeds, and YouTube channels into a single, real-time dashboard.
- **Enforce editorial accountability** through a human-in-the-loop approval workflow with full audit trails.
- **Empower solo reporters and small teams** with enterprise-grade newsroom tooling at an accessible scale.

### 1.3 Vision Statement
*"From trend to published — in minutes, not hours."*

---

## 2. Target Audience

### 2.1 Primary Users
| Persona | Description |
|---|---|
| **Solo Reporters / Freelancers** | Independent journalists managing their own beats who need to stay ahead of trends and publish rapidly across social platforms. |
| **Newsroom Correspondents** | Staff reporters at digital-first publications who handle high-volume content creation on tight deadlines. |
| **Editorial Teams** | Small-to-mid-sized editorial teams looking for AI-assisted drafting with editorial oversight and approval workflows. |

### 2.2 Secondary Users
| Persona | Description |
|---|---|
| **Content Managers / Editors** | Supervisors who review, approve, and manage the publishing pipeline. |
| **Social Media Managers** | Team members responsible for distributing stories across social channels. |

### 2.3 User Characteristics
- Technically comfortable but not necessarily developers.
- High value on speed, accuracy, and maintaining their journalistic voice.
- Work across devices (desktop primary, mobile secondary).
- Need to monitor multiple sources simultaneously.

---

## 3. Core Features and Functionality

### 3.1 Feature Map

#### 3.1.1 Landing Page & Marketing
- Animated hero section with shader-based background effects.
- Glassmorphic floating navbar with smooth-scroll navigation.
- Features showcase (6-card grid) highlighting platform capabilities.
- 4-step workflow timeline ("Monitor → Research → Draft → Publish").
- CTA buttons driving to signup/login.

#### 3.1.2 Authentication System
| Feature | Description | Status |
|---|---|---|
| Email/Password Login | Standard credential-based login | Mock (UI complete) |
| User Signup | Account registration with email | Mock (UI complete) |
| Forgot Password | Password recovery via email | Mock (UI complete) |
| Password Reset | Secure token-based password reset | Mock (UI complete) |

#### 3.1.3 Onboarding Flow (4-Step Wizard)
1. **Profile Setup** — Display name, bio/beat configuration.
2. **Twitter Connection** — OAuth 2.0 Twitter/X account linking (simulated).
3. **Source Configuration** — Add initial Twitter handles, RSS feeds, YouTube channels.
4. **Style Training** — Upload writing samples (.txt, .docx, .pdf) for AI voice training.

#### 3.1.4 Dashboard (Command Center)
- **Stats Row** — Real-time KPIs: Trending Topics count, Pending Drafts, Published Today, Active Sources.
- **Style Training Status** — Progress bar showing script uploads (min 5 to enable AI, max 20).
- **Trends to Watch** — Top 3 trending topics with source filter (Twitter/RSS/YouTube), engagement metrics, and significance scores.
- **Notifications Panel** — Latest unread alerts (trend alerts, training updates, delivery notifications).
- **Pending Review Queue** — AI drafts awaiting editorial review.
- **Published Posts Feed** — Recently published content with status badges.

#### 3.1.5 Trending Topics Monitor
- Real-time feed from all monitored sources.
- **Filtering** — By source type (Twitter, RSS, YouTube) and keyword search.
- **Sorting** — By significance score (AI-calculated).
- **Per-topic actions:**
  - "Deep Research" — Navigate to auto-generated research report.
  - "Generate Draft" — Open format selection dialog (short/medium/long).
  - "View Draft" — Navigate to existing draft if available.

#### 3.1.6 AI Draft Generation & Management
- **Draft Generation** — AI-generated content with configurable length:
  - Short: ≤280 characters (single tweet)
  - Medium: 280–500 characters (extended tweet)
  - Long: 500–1000 characters (thread/analysis)
- **Draft Review Workflow:**
  - Approve → moves to "Ready to Publish" state.
  - Reject → can regenerate.
  - Edit → inline content editing in modal.
  - Regenerate → request a new AI draft.
- **Status Tracking:** Pending → Approved → Published (or Rejected → Regenerate).

#### 3.1.7 Deep Research Reports
- Auto-generated per trending topic, containing:
  - Executive summary.
  - Key facts & statistics (numbered list).
  - Development timeline (visual timeline with connected dots).
  - Relevant quotes with attribution.
  - Source citations with links.
- **Action:** "Generate Draft from Report" to create content based on research.

#### 3.1.8 Published Posts Management
- View all published Twitter posts.
- **Actions:** View on X (external link), view original draft, delete post.
- **Deletion History** — Auditable log of deleted posts with timestamps.

#### 3.1.9 Source Management
- **Tabbed interface** — Twitter handles, RSS feeds, YouTube channels.
- **Add Source Dialog** — Type selection, handle/URL input, display label.
- **Remove Source** — With confirmation.
- **Source Counts** — Per-tab counters.

#### 3.1.10 Settings
| Tab | Features |
|---|---|
| **Style Training** | Upload scripts (.txt, .docx, .pdf), progress tracking (0–20), style profile display (tone, vocabulary, structure), file validation (type, size ≤10MB, word count ≥100) |
| **Content** | Default draft length preference (short/medium/long) with visual guide |
| **Delivery** | Daily digest toggle, delivery time/day configuration |
| **Twitter** | OAuth connection status, connect/disconnect, post-deletion override toggle |
| **Notifications** | Email/in-app/trend alert toggles, frequency (immediate/hourly/daily), quiet hours, significance threshold slider |

#### 3.1.11 Profile Management
- Avatar upload (image validation, ≤5MB).
- Editable fields: name, title, email, bio, location, website, Twitter handle.
- Dark/light mode toggle.

#### 3.1.12 Activity Log (Audit Trail)
- Chronological event log: logins, draft approvals/rejections, publications, deletions, source changes, script uploads.
- Per-event metadata: reporter, action details, timestamp.

#### 3.1.13 Notifications Center
- Notification types: Trend alerts, training completion, delivery, override alerts.
- Read/unread status tracking.
- Unread count badge in sidebar navigation.

---

## 4. User Interface Design Flows

### 4.1 Design System
- **Typography:** Playfair Display (serif/display), Source Sans 3 (body), JetBrains Mono (monospace/data).
- **Color Palette:** Monochromatic grayscale with semantic accents (success green, warning orange, destructive red). HSL-based CSS custom properties with full dark mode support.
- **UI Framework:** React + Tailwind CSS + shadcn/ui components.
- **Design Aesthetic:** Editorial/newspaper-inspired — clean, professional, content-dense with generous whitespace.

### 4.2 Key User Flows

#### Flow 1: New User Onboarding
```
Landing Page → Sign Up → Onboarding Wizard (4 steps) → Dashboard
```
1. User visits landing page, clicks "Get Started."
2. Creates account (email/password).
3. Completes onboarding: Profile → Twitter → Sources → Training.
4. Steps are skippable; progress bar tracks completion.
5. Redirects to Dashboard upon completion.

#### Flow 2: Trend-to-Publication Pipeline
```
Dashboard (Trends to Watch) → Trending Topics → Deep Research → Generate Draft → AI Drafts (Review) → Approve → Publish to Twitter → Published Posts
```
1. Reporter spots a trending topic on the dashboard or trending page.
2. Clicks "Deep Research" for an AI-generated research report.
3. Clicks "Generate Draft" and selects format (short/medium/long).
4. Reviews AI draft — edits if needed.
5. Approves draft → clicks "Publish to Twitter."
6. Post appears in Published Posts with external link.

#### Flow 3: Source Management
```
Sidebar → Sources → Add Source (type, handle, label) → Source appears in tab
```

#### Flow 4: Style Training
```
Settings → Style Training → Upload Scripts → Processing → Style Profile Generated
```

### 4.3 Navigation Architecture
- **Public routes (no layout):** Landing (`/`), Login, Signup, Forgot/Reset Password, Onboarding.
- **App routes (sidebar layout):** Dashboard, Trending, AI Drafts, Published, Sources, Research Reports, Activity Log, Notifications, Settings, Profile.
- **Sidebar:** Collapsible with icon-only mode. Two groups: "Newsroom" (Dashboard, Trending, Drafts, Published) and "Manage" (Sources, Activity Log, Notifications, Settings). Footer shows user avatar with profile link.

### 4.4 Responsive Design
- Mobile-first approach with responsive grid layouts (1→2→3→4 columns).
- Collapsible sidebar for smaller screens.
- Touch-friendly tap targets.

---

## 5. Security Considerations

### 5.1 Authentication & Authorization
- **Current state:** Mock authentication (UI-only, no backend).
- **Planned:** Integration with a backend authentication provider (e.g., Lovable Cloud / Supabase Auth) for secure session management.
- **Password requirements:** Minimum 12 characters (indicated in UI).
- **OAuth 2.0:** Twitter/X integration for publishing (currently simulated).

### 5.2 Data Security
- **Role-based access control (RBAC):** Required for multi-user teams — roles should be stored in a dedicated table (not on user profiles) to prevent privilege escalation.
- **Row-Level Security (RLS):** Must be enforced on all database tables when backend is implemented.
- **API keys:** Private keys must never be stored in client-side code; use server-side environment variables/secrets.

### 5.3 Content Security
- **Human-in-the-loop:** All AI-generated content requires explicit reporter approval before publishing — no auto-publish.
- **Audit trail:** Full activity log for editorial accountability and compliance tracking.
- **Post-deletion override:** Reporter can enable/disable the ability to delete published tweets via settings, with all deletions logged.

### 5.4 File Upload Security
- **Validation:** File type whitelist (.txt, .docx, .pdf), size limits (10MB for scripts, 5MB for avatars), minimum word count (100 words for training scripts).
- **Script limit:** Maximum 20 training scripts per user.

### 5.5 Future Security Requirements
- CSRF protection on all state-changing operations.
- Rate limiting on API endpoints (draft generation, publishing).
- Content sanitization for user-generated inputs.
- Secure token storage (httpOnly cookies, not localStorage).

---

## 6. Potential Challenges and Solutions

| Challenge | Impact | Solution |
|---|---|---|
| **AI voice accuracy** | Low-quality drafts reduce trust and adoption. | Require minimum 5 training scripts; display style profile (tone, vocabulary, structure) for transparency; allow regeneration. |
| **Real-time source monitoring at scale** | High API costs and rate limits from Twitter, RSS, YouTube. | Implement server-side polling with configurable intervals; use significance scoring to prioritize high-value topics; cache results. |
| **Twitter API rate limits** | Publishing throttled during high-volume periods. | Queue-based publishing with retry logic; display publishing status/errors to user; support scheduled publishing. |
| **Content moderation** | AI may generate biased or factually incorrect content. | Human-in-the-loop approval is mandatory; deep research reports provide source citations for fact-checking; no auto-publish. |
| **Backend dependency** | Currently frontend-only with mock data — no persistence. | Migrate to Lovable Cloud (Supabase) for database, auth, file storage, and edge functions. All data currently in `mock-data.ts` maps directly to database tables. |
| **Multi-device experience** | Reporters may need to review/approve from mobile. | Responsive design is implemented; push notifications planned for mobile alerting. |
| **Training data privacy** | Uploaded writing samples contain proprietary content. | Scripts should be stored encrypted; processed server-side only; not shared across users; deletion must be permanent. |

---

## 7. Future Expansion Possibilities

### 7.1 Near-Term (Next Release)
- **Backend integration** — Connect Lovable Cloud for persistent database, authentication, and file storage.
- **Real Twitter OAuth** — Replace mock with actual OAuth 2.0 flow for publishing.
- **Real AI draft generation** — Integrate Google Gemini API with user style profiles for actual draft generation.
- **Real source monitoring** — Implement Twitter API, RSS parsing, and YouTube API integrations via edge functions.

### 7.2 Mid-Term
- **Multi-platform publishing** — Extend beyond Twitter/X to LinkedIn, Bluesky, Mastodon, Threads, and CMS integrations (WordPress, Ghost).
- **Collaborative editing** — Multi-user draft review with comments, suggestions, and version history.
- **Scheduled publishing** — Time-based publication queues with optimal posting time suggestions.
- **Analytics dashboard** — Post-publication performance metrics (engagement, reach, clicks) pulled from platform APIs.
- **Newsletter integration** — Auto-generate and distribute email newsletters from approved content.

### 7.3 Long-Term
- **AI-powered fact-checking** — Cross-reference AI drafts against verified source databases.
- **Sentiment & bias analysis** — Real-time analysis of source credibility and content bias.
- **Custom AI models** — Fine-tuned per-reporter language models (beyond prompt engineering) for higher voice fidelity.
- **Mobile native app** — Dedicated iOS/Android app for on-the-go trend monitoring and draft approval.
- **Team management** — Organization accounts with role hierarchies (Reporter, Editor, Admin), approval chains, and editorial calendars.
- **White-label / API** — Offer News2Flow as an embeddable widget or API service for newsroom platforms.
- **Multimedia support** — AI-generated image captions, video summaries, and podcast show notes.

---

## 8. Technical Architecture Summary

### 8.1 Current Stack
| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui + CSS custom properties (HSL) |
| **Routing** | React Router DOM v6 |
| **State** | React useState (local), TanStack React Query (ready for async) |
| **Fonts** | Playfair Display, Source Sans 3, JetBrains Mono (Google Fonts) |
| **Icons** | Lucide React |
| **Notifications** | Sonner + Radix Toast |
| **Testing** | Vitest |

### 8.2 Planned Backend (Lovable Cloud)
| Service | Purpose |
|---|---|
| **PostgreSQL** | Users, sources, topics, drafts, published posts, activity logs, training scripts |
| **Auth** | Email/password, OAuth (Google, Apple), session management |
| **Storage** | Training script files, avatar uploads |
| **Edge Functions** | AI draft generation (LLM API calls), source polling (Twitter/RSS/YouTube APIs), Twitter publishing |
| **Real-time** | WebSocket subscriptions for live trend updates and notifications |

### 8.3 Data Model (Implied from Mock Data)
```
users
├── profiles (name, title, bio, avatar, preferences)
├── user_roles (RBAC — separate table)
├── training_scripts (fileName, fileSize, status, uploadedAt)
├── monitored_sources (type, handle, label)
└── notification_preferences (email, in-app, frequency, quiet hours)

trending_topics (title, source, sourceHandle, engagement, significanceScore, summary)
├── research_reports (summary, keyFacts, timeline, quotes, citations)
└── ai_drafts (content, status, contentLength, timestamps)
    └── published_posts (tweetUrl, publishedAt)
        └── deletion_history (deletedAt, contentPreview)

activity_logs (eventType, reporter, details, timestamp)
notifications (type, title, message, read, timestamp)
```

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Time from trend discovery to published post | < 5 minutes |
| AI draft approval rate (first attempt) | > 70% |
| Reporter style training adoption (≥5 scripts uploaded) | > 80% of active users |
| Daily active usage | Reporter checks dashboard ≥2x/day |
| Post-publication engagement lift | 20% higher vs. manually written posts |

---

*Document maintained by the News2Flow AI product team.*
