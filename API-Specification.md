# API Specification — News2Flow AI

> Complete API contract mapping every frontend feature to Supabase client calls and Edge Function invocations.

---

## Table of Contents

1. [Conventions](#1-conventions)
2. [Authentication](#2-authentication)
3. [Profiles](#3-profiles)
4. [Trending Topics](#4-trending-topics)
5. [Research Reports](#5-research-reports)
6. [AI Drafts](#6-ai-drafts)
7. [Monitored Sources](#7-monitored-sources)
8. [Training Scripts](#8-training-scripts)
9. [Notifications](#9-notifications)
10. [Activity Log](#10-activity-log)
11. [User Preferences / Settings](#11-user-preferences--settings)
12. [Dashboard Aggregates](#12-dashboard-aggregates)
13. [Realtime Subscriptions](#13-realtime-subscriptions)
14. [Error Handling](#14-error-handling)

---

## 1. Conventions

### Client Setup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### Patterns

| Pattern | When to Use |
|---------|-------------|
| `supabase.from('table').select()` | Direct DB reads (RLS-protected) |
| `supabase.from('table').insert()` | Direct DB writes (RLS-protected) |
| `supabase.from('table').update()` | Direct DB updates (RLS-protected) |
| `supabase.from('table').delete()` | Direct DB deletes (RLS-protected) |
| `supabase.functions.invoke('name')` | Server-side logic (LLM, external APIs) |
| `supabase.storage.from('bucket')` | File upload/download |
| `supabase.auth.*` | Authentication operations |

### Auth Header

All authenticated requests automatically include the JWT via the Supabase client. No manual header management needed.

### Response Shape

All Supabase client calls return:
```typescript
{ data: T | null, error: PostgrestError | null }
```

Edge Function responses return:
```typescript
{ data: T | null, error: { message: string } | null }
```

---

## 2. Authentication

### 2.1 Sign Up

**Page:** `Signup.tsx`

```typescript
const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    data: {
      full_name: string  // stored in raw_user_meta_data, used by trigger
    },
    emailRedirectTo: `${window.location.origin}/onboarding`
  }
});
```

**Response:**
```typescript
{
  data: {
    user: User | null,
    session: Session | null  // null if email confirmation required
  },
  error: AuthError | null
}
```

**Side Effects:** Trigger `handle_new_user` creates profile, preferences, and assigns `reporter` role.

---

### 2.2 Sign In (Email/Password)

**Page:** `Login.tsx`

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string
});
```

**Response:**
```typescript
{
  data: { user: User, session: Session },
  error: AuthError | null
}
```

**Post-login:** Log `auth_login` activity, redirect to `/dashboard`.

---

### 2.3 Sign In (Twitter OAuth)

**Page:** `Login.tsx`

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'twitter',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
    scopes: 'tweet.read tweet.write users.read'
  }
});
```

---

### 2.4 Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

**Post-logout:** Log `auth_logout` activity, redirect to `/login`.

---

### 2.5 Forgot Password

**Page:** `ForgotPassword.tsx`

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
});
```

---

### 2.6 Reset Password

**Page:** `ResetPassword.tsx`

```typescript
const { error } = await supabase.auth.updateUser({
  password: newPassword
});
```

---

### 2.7 Session Listener

**Component:** Auth context provider

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // Handle: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, PASSWORD_RECOVERY
});
```

---

### 2.8 Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

---

## 3. Profiles

### 3.1 Get Own Profile

**Page:** `Profile.tsx`

```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

**Response Type:**
```typescript
{
  id: string;
  full_name: string;
  avatar_url: string | null;
  organization: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}
```

---

### 3.2 Update Profile

**Page:** `Profile.tsx`, `Onboarding.tsx`

```typescript
const { error } = await supabase
  .from('profiles')
  .update({
    full_name?: string,
    organization?: string,
    avatar_url?: string,
    onboarding_complete?: boolean
  })
  .eq('id', user.id);
```

**Post-update:** Log `profile_updated` activity.

---

### 3.3 Upload Avatar

**Page:** `Profile.tsx`

```typescript
// 1. Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user.id}/avatar.${ext}`, file, {
    upsert: true,
    contentType: file.type
  });

// 2. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${user.id}/avatar.${ext}`);

// 3. Update profile
await supabase
  .from('profiles')
  .update({ avatar_url: publicUrl })
  .eq('id', user.id);
```

---

## 4. Trending Topics

### 4.1 List Trending Topics

**Page:** `TrendingTopics.tsx`, `Dashboard.tsx`

```typescript
const { data, error } = await supabase
  .from('trending_topics')
  .select('*')
  .order('significance_score', { ascending: false })
  .limit(50);
```

**With source filter:**
```typescript
const { data, error } = await supabase
  .from('trending_topics')
  .select('*')
  .eq('source', 'twitter')  // 'twitter' | 'rss' | 'youtube'
  .order('significance_score', { ascending: false });
```

**Response Type:**
```typescript
{
  id: string;
  title: string;
  source: 'twitter' | 'rss' | 'youtube';
  source_handle: string;
  engagement: number;
  significance_score: number;
  summary: string;
  has_draft: boolean;
  detected_at: string;
}[]
```

---

### 4.2 Get Single Topic

**Page:** `ResearchReport.tsx`

```typescript
const { data, error } = await supabase
  .from('trending_topics')
  .select('*')
  .eq('id', topicId)
  .single();
```

---

## 5. Research Reports

### 5.1 Get Report by Topic

**Page:** `ResearchReport.tsx`

```typescript
const { data, error } = await supabase
  .from('research_reports')
  .select('*')
  .eq('topic_id', topicId)
  .order('generated_at', { ascending: false })
  .limit(1)
  .single();
```

**Response Type:**
```typescript
{
  id: string;
  topic_id: string;
  significance_score: number;
  summary: string;
  key_facts: string[];
  timeline: { time: string; description: string }[];
  quotes: { text: string; author: string; source: string }[];
  sources: { title: string; publisher: string; url: string }[];
  generated_at: string;
}
```

---

### 5.2 Generate Research Report

**Page:** `ResearchReport.tsx`

```typescript
const { data, error } = await supabase.functions.invoke('generate-research', {
  body: { topic_id: string }
});
```

**Response:**
```typescript
{
  report: ResearchReport
}
```

---

## 6. AI Drafts

### 6.1 List Drafts

**Page:** `AIDrafts.tsx`

```typescript
const { data, error } = await supabase
  .from('ai_drafts')
  .select('*')
  .order('created_at', { ascending: false });
```

**With status filter:**
```typescript
const { data, error } = await supabase
  .from('ai_drafts')
  .select('*')
  .eq('status', 'pending')  // 'pending' | 'approved' | 'rejected' | 'published'
  .order('created_at', { ascending: false });
```

**Response Type:**
```typescript
{
  id: string;
  topic_id: string;
  topic_title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  content_length: 'short' | 'medium' | 'long';
  tweet_url: string | null;
  created_at: string;
  updated_at: string;
}[]
```

---

### 6.2 Generate Draft (Edge Function)

**Page:** `TrendingTopics.tsx`, `AIDrafts.tsx`

```typescript
const { data, error } = await supabase.functions.invoke('generate-draft', {
  body: {
    topic_id: string,
    content_length: 'short' | 'medium' | 'long'
  }
});
```

**Response:**
```typescript
{
  draft_id: string;
  content: string;
  status: 'pending';
}
```

---

### 6.3 Approve Draft

```typescript
const { error } = await supabase
  .from('ai_drafts')
  .update({ status: 'approved' })
  .eq('id', draftId);
```

**Side Effect:** Trigger logs `draft_approved` activity.

---

### 6.4 Reject Draft

```typescript
const { error } = await supabase
  .from('ai_drafts')
  .update({ status: 'rejected' })
  .eq('id', draftId);
```

**Side Effect:** Trigger logs `draft_rejected` activity.

---

### 6.5 Edit Draft Content

```typescript
const { error } = await supabase
  .from('ai_drafts')
  .update({ content: newContent })
  .eq('id', draftId);
```

---

### 6.6 Regenerate Draft (Edge Function)

```typescript
const { data, error } = await supabase.functions.invoke('generate-draft', {
  body: {
    topic_id: string,
    content_length: 'short' | 'medium' | 'long'
  }
});

// Optionally delete old draft
await supabase
  .from('ai_drafts')
  .delete()
  .eq('id', oldDraftId);
```

---

### 6.7 Publish Draft (Edge Function)

**Page:** `AIDrafts.tsx`

```typescript
const { data, error } = await supabase.functions.invoke('publish-tweet', {
  body: { draft_id: string }
});
```

**Response:**
```typescript
{
  tweet_url: string;
  status: 'published';
}
```

**Pre-condition:** Draft `status` must be `'approved'`.

---

## 7. Monitored Sources

### 7.1 List Sources

**Page:** `Sources.tsx`

```typescript
const { data, error } = await supabase
  .from('monitored_sources')
  .select('*')
  .order('added_at', { ascending: false });
```

**Response Type:**
```typescript
{
  id: string;
  type: 'twitter' | 'rss' | 'youtube';
  handle: string;
  label: string;
  added_at: string;
}[]
```

---

### 7.2 Add Source

```typescript
const { data, error } = await supabase
  .from('monitored_sources')
  .insert({
    user_id: user.id,
    type: 'twitter' | 'rss' | 'youtube',
    handle: string,
    label: string
  })
  .select()
  .single();
```

**Post-insert:** Log `source_added` activity.

---

### 7.3 Remove Source

```typescript
const { error } = await supabase
  .from('monitored_sources')
  .delete()
  .eq('id', sourceId);
```

**Post-delete:** Log `source_removed` activity.

---

## 8. Training Scripts

### 8.1 List Scripts

**Page:** `Settings.tsx` (Voice Training tab)

```typescript
const { data, error } = await supabase
  .from('training_scripts')
  .select('*')
  .order('uploaded_at', { ascending: false });
```

**Response Type:**
```typescript
{
  id: string;
  file_name: string;
  file_size: string;
  storage_path: string;
  status: 'processing' | 'complete' | 'error';
  uploaded_at: string;
}[]
```

---

### 8.2 Upload Script

```typescript
// 1. Upload to storage
const storagePath = `${user.id}/${Date.now()}_${file.name}`;
const { error: uploadError } = await supabase.storage
  .from('training-scripts')
  .upload(storagePath, file);

// 2. Create DB record
const { data, error } = await supabase
  .from('training_scripts')
  .insert({
    user_id: user.id,
    file_name: file.name,
    file_size: formatFileSize(file.size),
    storage_path: storagePath,
    status: 'processing'
  })
  .select()
  .single();

// 3. Trigger processing
await supabase.functions.invoke('process-script', {
  body: {
    script_id: data.id,
    storage_path: storagePath
  }
});
```

**Post-upload:** Log `script_uploaded` activity.

---

### 8.3 Delete Script

```typescript
// 1. Get storage path
const { data: script } = await supabase
  .from('training_scripts')
  .select('storage_path')
  .eq('id', scriptId)
  .single();

// 2. Delete from storage
await supabase.storage
  .from('training-scripts')
  .remove([script.storage_path]);

// 3. Delete DB record
await supabase
  .from('training_scripts')
  .delete()
  .eq('id', scriptId);
```

**Post-delete:** Log `script_deleted` activity.

---

## 9. Notifications

### 9.1 List Notifications

**Page:** `Notifications.tsx`

```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(50);
```

**Response Type:**
```typescript
{
  id: string;
  type: 'trend_alert' | 'training_complete' | 'delivery' | 'override';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}[]
```

---

### 9.2 Get Unread Count

**Component:** Sidebar badge

```typescript
const { count, error } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('read', false);
```

---

### 9.3 Mark Single as Read

```typescript
const { error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('id', notificationId);
```

---

### 9.4 Mark All as Read

```typescript
const { error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('read', false);
```

---

## 10. Activity Log

### 10.1 List Activity Logs (Paginated)

**Page:** `ActivityLog.tsx`

```typescript
const PAGE_SIZE = 20;

const { data, error, count } = await supabase
  .from('activity_logs')
  .select('*', { count: 'exact' })
  .order('created_at', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

**Response Type:**
```typescript
{
  id: string;
  event_type: string;
  reporter_name: string;
  details: string;
  created_at: string;
}[]
```

---

### 10.2 Insert Activity Log (Helper)

Used internally after user actions (client-side helper for non-trigger events):

```typescript
async function logActivity(
  eventType: ActivityEventType,
  details: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    event_type: eventType,
    reporter_name: profile.full_name,
    details
  });
}
```

---

## 11. User Preferences / Settings

### 11.1 Get Preferences

**Page:** `Settings.tsx`

```typescript
const { data, error } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

**Response Type:**
```typescript
{
  id: string;
  user_id: string;
  delivery_schedule: string;
  delivery_enabled: boolean;
  default_content_length: 'short' | 'medium' | 'long';
  trend_alert_enabled: boolean;
  email_notifications: boolean;
  twitter_connected: boolean;
  significance_threshold: number;
  created_at: string;
  updated_at: string;
}
```

---

### 11.2 Update Preferences

```typescript
const { error } = await supabase
  .from('user_preferences')
  .update({
    delivery_schedule?: string,
    delivery_enabled?: boolean,
    default_content_length?: 'short' | 'medium' | 'long',
    trend_alert_enabled?: boolean,
    email_notifications?: boolean,
    significance_threshold?: number
  })
  .eq('user_id', user.id);
```

**Post-update:** Log `settings_updated` activity.

---

## 12. Dashboard Aggregates

### 12.1 Dashboard Stats

**Page:** `Dashboard.tsx`

Fetch multiple counts in parallel using TanStack Query:

```typescript
// Trending topics count (last 24h)
const { count: trendingCount } = await supabase
  .from('trending_topics')
  .select('*', { count: 'exact', head: true })
  .gte('detected_at', new Date(Date.now() - 86400000).toISOString());

// Pending drafts count
const { count: pendingDrafts } = await supabase
  .from('ai_drafts')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'pending');

// Published today count
const { count: publishedToday } = await supabase
  .from('ai_drafts')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'published')
  .gte('updated_at', new Date().toISOString().split('T')[0]);

// Active sources count
const { count: activeSources } = await supabase
  .from('monitored_sources')
  .select('*', { count: 'exact', head: true });
```

**Alternative:** Create an RPC function for a single round-trip:

```sql
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(_user_id uuid)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'trending_count', (
      SELECT count(*) FROM trending_topics
      WHERE user_id = _user_id
      AND detected_at > now() - interval '24 hours'
    ),
    'pending_drafts', (
      SELECT count(*) FROM ai_drafts
      WHERE user_id = _user_id AND status = 'pending'
    ),
    'published_today', (
      SELECT count(*) FROM ai_drafts
      WHERE user_id = _user_id
      AND status = 'published'
      AND updated_at::date = current_date
    ),
    'active_sources', (
      SELECT count(*) FROM monitored_sources
      WHERE user_id = _user_id
    )
  );
$$;
```

```typescript
const { data, error } = await supabase.rpc('get_dashboard_stats', {
  _user_id: user.id
});
```

**Response:**
```typescript
{
  trending_count: number;
  pending_drafts: number;
  published_today: number;
  active_sources: number;
}
```

---

## 13. Realtime Subscriptions

### 13.1 Trending Topics Feed

**Component:** `TrendingTopics.tsx`, `Dashboard.tsx`

```typescript
const channel = supabase
  .channel('trending-topics-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'trending_topics',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      queryClient.invalidateQueries({ queryKey: ['trending-topics'] });
      toast.info(`New trend: ${payload.new.title}`);
    }
  )
  .subscribe();

// Cleanup on unmount
return () => { supabase.removeChannel(channel); };
```

### 13.2 Notifications

**Component:** `AppSidebar.tsx` (badge), `Notifications.tsx`

```typescript
const channel = supabase
  .channel('notifications-realtime')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    }
  )
  .subscribe();
```

### 13.3 Draft Status Updates

**Component:** `AIDrafts.tsx`

```typescript
const channel = supabase
  .channel('drafts-realtime')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'ai_drafts',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    }
  )
  .subscribe();
```

---

## 14. Error Handling

### 14.1 Standard Error Pattern

```typescript
import { toast } from 'sonner';

async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T | null> {
  const { data, error } = await queryFn();

  if (error) {
    console.error('API Error:', error);

    if (error.code === 'PGRST301') {
      toast.error('Session expired. Please log in again.');
      // redirect to login
    } else if (error.code === '42501') {
      toast.error('Permission denied.');
    } else {
      toast.error(error.message || 'An unexpected error occurred.');
    }

    return null;
  }

  return data;
}
```

### 14.2 Edge Function Error Pattern

```typescript
const { data, error } = await supabase.functions.invoke('generate-draft', {
  body: { topic_id, content_length }
});

if (error) {
  if (error.message.includes('rate limit')) {
    toast.error('Rate limit reached. Please try again in a moment.');
  } else if (error.message.includes('unauthorized')) {
    toast.error('Please log in to generate drafts.');
  } else {
    toast.error('Failed to generate draft. Please try again.');
  }
}
```

### 14.3 Common Error Codes

| Code | Meaning | User Message |
|------|---------|--------------|
| `PGRST301` | JWT expired | "Session expired. Please log in again." |
| `42501` | RLS violation | "Permission denied." |
| `23505` | Unique constraint violation | "This item already exists." |
| `23503` | Foreign key violation | "Referenced item not found." |
| `PGRST116` | Row not found (`.single()`) | "Item not found." |
| `429` | Edge function rate limit | "Rate limit reached. Try again shortly." |

---

## Appendix: TanStack Query Key Convention

| Query Key | Endpoint |
|-----------|----------|
| `['profile', userId]` | Get own profile |
| `['preferences', userId]` | Get user preferences |
| `['trending-topics']` | List trending topics |
| `['trending-topics', filters]` | List with source filter |
| `['topic', topicId]` | Get single topic |
| `['research-report', topicId]` | Get report by topic |
| `['drafts']` | List all drafts |
| `['drafts', statusFilter]` | List with status filter |
| `['sources']` | List monitored sources |
| `['training-scripts']` | List training scripts |
| `['notifications']` | List notifications |
| `['unread-count']` | Unread notification count |
| `['activity-logs', page]` | Paginated activity logs |
| `['dashboard-stats']` | Dashboard aggregates |

---

*Generated: 2026-03-08 | Version: 1.0 | Status: Specification*
