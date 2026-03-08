

# Plan: Build the Full Supabase Backend

## Overview

The entire application currently runs on mock data (`src/lib/mock-data.ts`) with no authentication, no database, and no edge functions. This plan implements the complete Supabase backend and rewires every page to use real data, following the existing Backend-Specification.md and API-Specification.md.

This is a large implementation. To keep each step manageable and testable, the work is split into 6 phases executed sequentially.

---

## Phase 1: Database Schema, Enums, RLS, Triggers & Storage

Run a single migration that creates:

- **6 enums**: `app_role`, `source_type`, `draft_status`, `content_length`, `notification_type`, `activity_event_type`, `script_status`
- **10 tables**: `profiles`, `user_roles`, `user_preferences`, `monitored_sources`, `trending_topics`, `ai_drafts`, `research_reports`, `training_scripts`, `notifications`, `activity_logs`
- **`has_role()` security definer function** for admin checks
- **RLS policies** on every table (users see own data, service_role for system writes)
- **`handle_new_user()` trigger** on `auth.users` — auto-creates profile, preferences, and assigns `reporter` role
- **`update_updated_at()` trigger** on profiles, user_preferences, ai_drafts
- **`log_draft_status_change()` trigger** on ai_drafts — auto-logs approve/reject/publish to activity_logs
- **2 storage buckets**: `training-scripts` (private, 10MB) and `avatars` (public read, 5MB) with storage policies

---

## Phase 2: Auth Context & Protected Routes

Create the authentication infrastructure:

- **`src/contexts/AuthContext.tsx`** — React context providing `user`, `session`, `profile`, `loading`, `signOut`. Sets up `onAuthStateChange` listener before `getSession()`. Fetches profile from `profiles` table on auth state change.
- **`src/components/ProtectedRoute.tsx`** — Wrapper that redirects to `/login` if no session, redirects to `/onboarding` if `!profile.onboarding_complete`.
- **Update `App.tsx`** — Wrap app in `AuthProvider`, wrap all `/dashboard/*` routes in `ProtectedRoute`.
- **Update `Login.tsx`** — Replace mock `setTimeout` with `supabase.auth.signInWithPassword()`. On success, log `auth_login` activity and navigate to `/dashboard`.
- **Update `Signup.tsx`** — Replace mock with `supabase.auth.signUp()` passing `full_name` in metadata and `emailRedirectTo: origin`. Show confirmation message.
- **Update `ForgotPassword.tsx`** — Replace mock with `supabase.auth.resetPasswordForEmail()` with `redirectTo: origin + '/reset-password'`.
- **Update `ResetPassword.tsx`** — Listen for `PASSWORD_RECOVERY` event in `onAuthStateChange`, then call `supabase.auth.updateUser({ password })`.
- **Update `Onboarding.tsx`** — Save profile data to `profiles` table, save sources to `monitored_sources`, set `onboarding_complete = true` on finish.
- **Update `AppSidebar.tsx`** — Show actual user name/initials from profile context instead of hardcoded "Jane Reporter".
- **Update `AppLayout.tsx`** — Show real unread notification count from database.

---

## Phase 3: Data Layer — Hooks & TanStack Query Integration

Create reusable data hooks that replace all mock data imports:

- **`src/hooks/use-profile.ts`** — `useProfile()`, `useUpdateProfile()` 
- **`src/hooks/use-trending-topics.ts`** — `useTrendingTopics(sourceFilter?)` with Realtime subscription for live updates
- **`src/hooks/use-drafts.ts`** — `useDrafts(statusFilter?)`, `useApproveDraft()`, `useRejectDraft()`, `useEditDraft()`, `useDeleteDraft()`
- **`src/hooks/use-sources.ts`** — `useSources()`, `useAddSource()`, `useRemoveSource()`
- **`src/hooks/use-notifications.ts`** — `useNotifications()`, `useMarkRead()`, `useMarkAllRead()`, `useUnreadCount()` with Realtime subscription
- **`src/hooks/use-training-scripts.ts`** — `useTrainingScripts()`, `useUploadScript()`, `useDeleteScript()`
- **`src/hooks/use-activity-log.ts`** — `useActivityLogs(filter?, search?)`
- **`src/hooks/use-preferences.ts`** — `usePreferences()`, `useUpdatePreferences()`
- **`src/hooks/use-research-report.ts`** — `useResearchReport(topicId)`

Each hook uses TanStack Query with proper query keys, error handling, and optimistic updates where appropriate.

---

## Phase 4: Rewire All Pages to Use Real Data

Replace every `useState(mockData)` pattern with the hooks from Phase 3:

- **`Dashboard.tsx`** — Use `useTrendingTopics`, `useDrafts`, `useNotifications`, `useTrainingScripts` for real counts and data
- **`TrendingTopics.tsx`** — Use `useTrendingTopics(filter)`, invoke `generate-draft` edge function for draft generation
- **`AIDrafts.tsx`** — Use `useDrafts(filter)`, use mutation hooks for approve/reject/edit
- **`Published.tsx`** — Use `useDrafts('published')`, delete via mutation + activity log
- **`Sources.tsx`** — Use `useSources()`, `useAddSource()`, `useRemoveSource()`
- **`Notifications.tsx`** — Use `useNotifications()`, `useMarkRead()`, `useMarkAllRead()`
- **`Settings.tsx`** — Use `usePreferences()`, `useTrainingScripts()` with real file upload to `training-scripts` storage bucket
- **`Profile.tsx`** — Use `useProfile()`, `useUpdateProfile()` with real avatar upload to `avatars` bucket
- **`ResearchReport.tsx`** — Use `useResearchReport(topicId)`, invoke `generate-research` edge function
- **`ActivityLog.tsx`** — Use `useActivityLogs()` with server-side filtering
- **Remove mock-data.ts imports** from all pages (keep the file temporarily for type reference, then remove)

---

## Phase 5: Edge Functions

Create and deploy 3 priority edge functions (the others depend on external API keys):

### 5.1 `generate-draft`
- Requires `GEMINI_API_KEY` secret (will prompt user to add)
- Fetches topic + user's training scripts for style context
- Calls Gemini `gemini-2.5-flash` to generate draft content
- Inserts into `ai_drafts`, updates `trending_topics.has_draft`, creates notification
- CORS headers, JWT verification in code

### 5.2 `generate-research`
- Requires `GEMINI_API_KEY`
- Fetches topic data, calls Gemini with research synthesis prompt
- Returns structured JSON: summary, key_facts, timeline, quotes, sources
- Inserts into `research_reports`

### 5.3 `process-script`
- Requires `GEMINI_API_KEY`
- Called after training script upload
- Downloads file from storage, sends to Gemini for style analysis
- Updates `training_scripts.status` to `complete`
- Creates `training_complete` notification

**Note**: `poll-sources` and `publish-tweet` require Twitter API keys and `send-digest` requires Resend API key. These will be stubbed with clear TODO comments and can be activated once the user provides the secrets.

---

## Phase 6: Cleanup & Polish

- Remove `src/lib/mock-data.ts` entirely
- Add loading skeletons to all pages during data fetch
- Add error states/empty states for when no data exists
- Ensure sign-out clears TanStack Query cache
- Update notification badge in AppLayout to use real `useUnreadCount()`

---

## Secrets Required

Before edge functions can work, the user needs to add:

| Secret | Required For |
|--------|-------------|
| `GEMINI_API_KEY` | generate-draft, generate-research, process-script |

Twitter and YouTube API keys are optional and only needed for `poll-sources` and `publish-tweet`.

---

## Files Created/Modified Summary

```text
NEW FILES:
  src/contexts/AuthContext.tsx
  src/components/ProtectedRoute.tsx
  src/hooks/use-profile.ts
  src/hooks/use-trending-topics.ts
  src/hooks/use-drafts.ts
  src/hooks/use-sources.ts
  src/hooks/use-notifications.ts
  src/hooks/use-training-scripts.ts
  src/hooks/use-activity-log.ts
  src/hooks/use-preferences.ts
  src/hooks/use-research-report.ts
  supabase/functions/generate-draft/index.ts
  supabase/functions/generate-research/index.ts
  supabase/functions/process-script/index.ts

MODIFIED FILES:
  supabase/config.toml (add verify_jwt = false for edge functions)
  src/App.tsx (AuthProvider + ProtectedRoute)
  src/pages/Login.tsx
  src/pages/Signup.tsx
  src/pages/ForgotPassword.tsx
  src/pages/ResetPassword.tsx
  src/pages/Onboarding.tsx
  src/pages/Dashboard.tsx
  src/pages/TrendingTopics.tsx
  src/pages/AIDrafts.tsx
  src/pages/Published.tsx
  src/pages/Sources.tsx
  src/pages/Notifications.tsx
  src/pages/Settings.tsx
  src/pages/Profile.tsx
  src/pages/ResearchReport.tsx
  src/pages/ActivityLog.tsx
  src/components/AppLayout.tsx
  src/components/AppSidebar.tsx

DELETED FILES:
  src/lib/mock-data.ts (after all pages migrated)
```

