# Backend Specification — News2Flow AI

> Supabase-powered backend infrastructure for the News2Flow AI newsroom intelligence platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Enums & Custom Types](#2-database-enums--custom-types)
3. [Database Schema](#3-database-schema)
4. [Authentication](#4-authentication)
5. [Row-Level Security (RLS)](#5-row-level-security-rls)
6. [Storage Buckets](#6-storage-buckets)
7. [Edge Functions](#7-edge-functions)
8. [Database Triggers & Functions](#8-database-triggers--functions)
9. [Realtime Subscriptions](#9-realtime-subscriptions)
10. [Cron Jobs](#10-cron-jobs)
11. [Environment Secrets](#11-environment-secrets)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                      │
│  (Vite + TanStack Query + Supabase JS Client)       │
└──────────┬──────────┬──────────┬────────────────────┘
           │          │          │
     Auth API    Client SDK   functions.invoke()
           │          │          │
┌──────────▼──────────▼──────────▼────────────────────┐
│                  Supabase                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │  Auth    │ │ Postgres │ │   Edge Functions     │ │
│  │ (GoTrue)│ │  + RLS   │ │  (Deno Runtime)      │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Storage  │ │ Realtime │ │   pg_cron + pg_net   │ │
│  └──────────┘ └──────────┘ └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
           │
     External APIs
  (Twitter/X, RSS, YouTube, Google Gemini)
```

**Key Principles:**
- All data access goes through RLS-protected client SDK calls
- Server-side logic (LLM calls, external APIs) runs in Edge Functions
- No raw SQL from the client — parameterized queries only
- `user_id` on every user-owned table, never nullable

---

## 2. Database Enums & Custom Types

```sql
-- User roles (stored in separate table, never on profiles)
CREATE TYPE public.app_role AS ENUM ('admin', 'reporter', 'viewer');

-- Source types for monitored feeds
CREATE TYPE public.source_type AS ENUM ('twitter', 'rss', 'youtube');

-- AI draft lifecycle statuses
CREATE TYPE public.draft_status AS ENUM ('pending', 'approved', 'rejected', 'published');

-- Content length presets
CREATE TYPE public.content_length AS ENUM ('short', 'medium', 'long');

-- Notification categories
CREATE TYPE public.notification_type AS ENUM (
  'trend_alert',
  'training_complete',
  'delivery',
  'override'
);

-- Activity log event types
CREATE TYPE public.activity_event_type AS ENUM (
  'auth_login',
  'auth_logout',
  'draft_approved',
  'draft_rejected',
  'draft_generated',
  'post_published',
  'post_deleted',
  'source_added',
  'source_removed',
  'script_uploaded',
  'script_deleted',
  'settings_updated',
  'profile_updated'
);

-- Training script processing statuses
CREATE TYPE public.script_status AS ENUM ('processing', 'complete', 'error');
```

---

## 3. Database Schema

### 3.1 `profiles`

Auto-created on signup via trigger. Extends `auth.users`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, FK → `auth.users(id)` ON DELETE CASCADE | User ID |
| `full_name` | `text` | NOT NULL | Display name |
| `avatar_url` | `text` | NULLABLE | Storage path to avatar |
| `organization` | `text` | NULLABLE | Newsroom/org name |
| `onboarding_complete` | `boolean` | DEFAULT `false` | Onboarding wizard finished |
| `created_at` | `timestamptz` | DEFAULT `now()` | Account creation |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last profile update |

```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  avatar_url text,
  organization text,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3.2 `user_roles`

Separate table for RBAC — never stored on `profiles`.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL |
| `role` | `app_role` | NOT NULL |
| — | — | UNIQUE(`user_id`, `role`) |

```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
```

### 3.3 `user_preferences`

User-specific settings for delivery, content defaults, and notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL, UNIQUE | |
| `delivery_schedule` | `text` | DEFAULT `'08:00'` | Daily digest time (HH:MM) |
| `delivery_enabled` | `boolean` | DEFAULT `true` | Digest on/off |
| `default_content_length` | `content_length` | DEFAULT `'medium'` | Preferred draft length |
| `trend_alert_enabled` | `boolean` | DEFAULT `true` | Push trend alerts |
| `email_notifications` | `boolean` | DEFAULT `true` | Email notifications |
| `twitter_connected` | `boolean` | DEFAULT `false` | Twitter OAuth linked |
| `significance_threshold` | `integer` | DEFAULT `70`, CHECK 0–100 | Min score to alert |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

```sql
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  delivery_schedule text DEFAULT '08:00',
  delivery_enabled boolean DEFAULT true,
  default_content_length content_length DEFAULT 'medium',
  trend_alert_enabled boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  twitter_connected boolean DEFAULT false,
  significance_threshold integer DEFAULT 70 CHECK (significance_threshold BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3.4 `monitored_sources`

RSS feeds, Twitter accounts, and YouTube channels being tracked.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | Owner |
| `type` | `source_type` | NOT NULL | twitter / rss / youtube |
| `handle` | `text` | NOT NULL | @handle or URL |
| `label` | `text` | NOT NULL | Human-readable name |
| `added_at` | `timestamptz` | DEFAULT `now()` | |

```sql
CREATE TABLE public.monitored_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type source_type NOT NULL,
  handle text NOT NULL,
  label text NOT NULL,
  added_at timestamptz DEFAULT now()
);
```

### 3.5 `trending_topics`

Detected trending topics from monitored sources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | Owner |
| `title` | `text` | NOT NULL | Topic headline |
| `source` | `source_type` | NOT NULL | Origin source type |
| `source_handle` | `text` | NOT NULL | Originating handle/feed |
| `engagement` | `integer` | DEFAULT `0` | Engagement metric count |
| `significance_score` | `integer` | NOT NULL, CHECK 0–100 | AI-computed relevance |
| `summary` | `text` | NOT NULL | Auto-generated summary |
| `has_draft` | `boolean` | DEFAULT `false` | Draft generated? |
| `detected_at` | `timestamptz` | DEFAULT `now()` | First detection time |

```sql
CREATE TABLE public.trending_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  source source_type NOT NULL,
  source_handle text NOT NULL,
  engagement integer DEFAULT 0,
  significance_score integer NOT NULL CHECK (significance_score BETWEEN 0 AND 100),
  summary text NOT NULL,
  has_draft boolean DEFAULT false,
  detected_at timestamptz DEFAULT now()
);
```

### 3.6 `ai_drafts`

AI-generated content drafts linked to trending topics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | Owner |
| `topic_id` | `uuid` | FK → `trending_topics(id)` ON DELETE CASCADE, NOT NULL | Source topic |
| `topic_title` | `text` | NOT NULL | Denormalized for display |
| `content` | `text` | NOT NULL | Draft body |
| `status` | `draft_status` | DEFAULT `'pending'` | Lifecycle status |
| `content_length` | `content_length` | NOT NULL | short/medium/long |
| `tweet_url` | `text` | NULLABLE | Published tweet URL |
| `created_at` | `timestamptz` | DEFAULT `now()` | |
| `updated_at` | `timestamptz` | DEFAULT `now()` | |

```sql
CREATE TABLE public.ai_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id uuid REFERENCES trending_topics(id) ON DELETE CASCADE NOT NULL,
  topic_title text NOT NULL,
  content text NOT NULL,
  status draft_status DEFAULT 'pending',
  content_length content_length NOT NULL,
  tweet_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 3.7 `research_reports`

Deep-dive research reports generated per topic.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | |
| `topic_id` | `uuid` | FK → `trending_topics(id)` ON DELETE CASCADE, NOT NULL | |
| `significance_score` | `integer` | NOT NULL | Snapshot of topic score |
| `summary` | `text` | NOT NULL | Executive summary |
| `key_facts` | `jsonb` | NOT NULL, DEFAULT `'[]'` | `string[]` |
| `timeline` | `jsonb` | NOT NULL, DEFAULT `'[]'` | `{time, description}[]` |
| `quotes` | `jsonb` | NOT NULL, DEFAULT `'[]'` | `{text, author, source}[]` |
| `sources` | `jsonb` | NOT NULL, DEFAULT `'[]'` | `{title, publisher, url}[]` |
| `generated_at` | `timestamptz` | DEFAULT `now()` | |

```sql
CREATE TABLE public.research_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id uuid REFERENCES trending_topics(id) ON DELETE CASCADE NOT NULL,
  significance_score integer NOT NULL,
  summary text NOT NULL,
  key_facts jsonb NOT NULL DEFAULT '[]',
  timeline jsonb NOT NULL DEFAULT '[]',
  quotes jsonb NOT NULL DEFAULT '[]',
  sources jsonb NOT NULL DEFAULT '[]',
  generated_at timestamptz DEFAULT now()
);
```

### 3.8 `training_scripts`

Uploaded writing samples for AI voice training.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | |
| `file_name` | `text` | NOT NULL | Original filename |
| `file_size` | `text` | NOT NULL | Human-readable size |
| `storage_path` | `text` | NOT NULL | Path in storage bucket |
| `status` | `script_status` | DEFAULT `'processing'` | Processing state |
| `uploaded_at` | `timestamptz` | DEFAULT `now()` | |

```sql
CREATE TABLE public.training_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_size text NOT NULL,
  storage_path text NOT NULL,
  status script_status DEFAULT 'processing',
  uploaded_at timestamptz DEFAULT now()
);
```

### 3.9 `notifications`

In-app notifications for trend alerts, digests, training completion.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | |
| `type` | `notification_type` | NOT NULL | Category |
| `title` | `text` | NOT NULL | Notification headline |
| `message` | `text` | NOT NULL | Body text |
| `read` | `boolean` | DEFAULT `false` | Read state |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### 3.10 `activity_logs`

Immutable audit trail of all user actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | |
| `user_id` | `uuid` | FK → `auth.users(id)` ON DELETE CASCADE, NOT NULL | |
| `event_type` | `activity_event_type` | NOT NULL | Action type |
| `reporter_name` | `text` | NOT NULL | Denormalized user name |
| `details` | `text` | NOT NULL | Human-readable description |
| `created_at` | `timestamptz` | DEFAULT `now()` | |

```sql
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type activity_event_type NOT NULL,
  reporter_name text NOT NULL,
  details text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### 3.11 Entity Relationship Diagram

```
auth.users (Supabase managed)
    │
    ├── 1:1 ── profiles
    ├── 1:1 ── user_preferences
    ├── 1:N ── user_roles
    ├── 1:N ── monitored_sources
    ├── 1:N ── trending_topics
    │              ├── 1:N ── ai_drafts
    │              └── 1:N ── research_reports
    ├── 1:N ── training_scripts
    ├── 1:N ── notifications
    └── 1:N ── activity_logs
```

---

## 4. Authentication

### 4.1 Auth Providers

| Provider | Purpose | Configuration |
|----------|---------|---------------|
| Email/Password | Primary signup/login | Min 12 chars, confirm email enabled |
| Twitter/X OAuth | Publish-on-behalf, source monitoring | `api.x.com` OAuth 2.0 PKCE |

### 4.2 Auth Flow

```
Signup → Confirm Email → Auto-create profile (trigger)
       → Auto-create user_preferences (trigger)
       → Auto-assign 'reporter' role (trigger)
       → Redirect to /onboarding
```

### 4.3 Password Policy

Enforced client-side (already in `Signup.tsx`) and server-side:
- Minimum 12 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character

### 4.4 Session Management

- JWT access tokens with 1-hour expiry
- Refresh tokens with 7-day expiry
- `supabase.auth.onAuthStateChange()` listener in React context
- Protected routes redirect to `/login` if no session

---

## 5. Row-Level Security (RLS)

### 5.1 Security Definer Helper

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

### 5.2 RLS Policies

All tables have RLS enabled. Pattern: users see their own data; admins see all.

#### `profiles`

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

#### `user_roles`

```sql
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles
CREATE POLICY "Users read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

#### `user_preferences`

```sql
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### `monitored_sources`

```sql
ALTER TABLE public.monitored_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sources"
  ON public.monitored_sources FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### `trending_topics`

```sql
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own topics"
  ON public.trending_topics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert/update via Edge Functions (service_role), not direct client
CREATE POLICY "Service role manages topics"
  ON public.trending_topics FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

#### `ai_drafts`

```sql
ALTER TABLE public.ai_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own drafts"
  ON public.ai_drafts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### `research_reports`

```sql
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reports"
  ON public.research_reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages reports"
  ON public.research_reports FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

#### `training_scripts`

```sql
ALTER TABLE public.training_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own scripts"
  ON public.training_scripts FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### `notifications`

```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

#### `activity_logs`

```sql
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users read their own logs (immutable — no update/delete)
CREATE POLICY "Users read own logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert via triggers/service_role only
CREATE POLICY "Service role inserts logs"
  ON public.activity_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins can read all logs
CREATE POLICY "Admins read all logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
```

---

## 6. Storage Buckets

### 6.1 `training-scripts`

| Property | Value |
|----------|-------|
| Bucket name | `training-scripts` |
| Public | No |
| Max file size | 10 MB |
| Allowed MIME types | `text/plain`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |

```sql
-- Storage policy: Users manage their own scripts
CREATE POLICY "Users upload own scripts"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'training-scripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own scripts"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'training-scripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own scripts"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'training-scripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

**File path convention:** `{user_id}/{timestamp}_{filename}`

### 6.2 `avatars`

| Property | Value |
|----------|-------|
| Bucket name | `avatars` |
| Public | Yes (read) |
| Max file size | 5 MB |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp` |

```sql
CREATE POLICY "Anyone can read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

**File path convention:** `{user_id}/avatar.{ext}`

---

## 7. Edge Functions

All edge functions reside in `supabase/functions/{name}/index.ts`.

### 7.1 `generate-draft`

| Property | Value |
|----------|-------|
| Purpose | Generate AI draft from a trending topic using user's trained voice |
| Auth | JWT required (verify in code) |
| Method | POST |
| Secrets | `GEMINI_API_KEY` |

**Input:**
```json
{
  "topic_id": "uuid",
  "content_length": "short | medium | long"
}
```

**Logic:**
1. Fetch topic from `trending_topics`
2. Fetch user's training scripts to build style prompt
3. Call Google Gemini (`gemini-2.5-flash`) via `https://generativelanguage.googleapis.com/v1beta` with topic context + style instructions + length constraint
4. Insert result into `ai_drafts` with status `pending`
5. Update `trending_topics.has_draft = true`
6. Insert notification of type `trend_alert`
7. Log activity `draft_generated`

**Output:**
```json
{
  "draft_id": "uuid",
  "content": "string",
  "status": "pending"
}
```

### 7.2 `poll-sources`

| Property | Value |
|----------|-------|
| Purpose | Poll monitored sources for new trending content |
| Auth | Service role (cron-invoked) |
| Method | POST |
| Secrets | `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`, `YOUTUBE_API_KEY` |

**Logic:**
1. Fetch all `monitored_sources` grouped by user
2. For each source type:
   - **Twitter:** Call `https://api.x.com/2/tweets/search/recent` for each handle
   - **RSS:** Fetch and parse XML feeds
   - **YouTube:** Call YouTube Data API v3 `/search` endpoint
3. Score content using engagement metrics + keyword relevance → `significance_score`
4. Upsert into `trending_topics` (deduplicate by title similarity)
5. Create notifications for topics above user's `significance_threshold`

**Cron schedule:** Every 15 minutes (`*/15 * * * *`)

### 7.3 `publish-tweet`

| Property | Value |
|----------|-------|
| Purpose | Publish an approved draft to Twitter/X |
| Auth | JWT required |
| Method | POST |
| Secrets | `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET` |

**Input:**
```json
{
  "draft_id": "uuid"
}
```

**Logic:**
1. Fetch draft, verify `status = 'approved'` and `user_id = auth.uid()`
2. Fetch user's Twitter OAuth tokens from `auth.users.raw_user_meta_data`
3. Sign request with OAuth 1.0a (user context)
4. POST to `https://api.x.com/2/tweets`
5. Update draft: `status = 'published'`, `tweet_url = response.url`
6. Log activity `post_published`

**Output:**
```json
{
  "tweet_url": "https://x.com/user/status/123",
  "status": "published"
}
```

### 7.4 `generate-research`

| Property | Value |
|----------|-------|
| Purpose | Generate a deep-dive research report for a topic |
| Auth | JWT required |
| Method | POST |
| Secrets | `GEMINI_API_KEY` |

**Input:**
```json
{
  "topic_id": "uuid"
}
```

**Logic:**
1. Fetch topic and its source data
2. Call Google Gemini (`gemini-2.5-flash`) with research synthesis prompt
3. Parse structured output into `key_facts`, `timeline`, `quotes`, `sources`
4. Insert into `research_reports`
5. Log activity

**Output:** Full `ResearchReport` object

### 7.5 `process-script`

| Property | Value |
|----------|-------|
| Purpose | Analyze uploaded training script to extract writing style features |
| Auth | Service role (triggered after upload) |
| Method | POST |
| Secrets | `GEMINI_API_KEY` |

**Input:**
```json
{
  "script_id": "uuid",
  "storage_path": "string"
}
```

**Logic:**
1. Download file from storage bucket
2. Extract text content (parse PDF/DOCX if needed)
3. Send to OpenAI for style analysis (tone, vocabulary, structure patterns)
4. Update `training_scripts.status = 'complete'`
5. Create notification `training_complete`
6. Log activity

### 7.6 `send-digest`

| Property | Value |
|----------|-------|
| Purpose | Send daily digest email with top trends and pending drafts |
| Auth | Service role (cron-invoked) |
| Method | POST |
| Secrets | `RESEND_API_KEY` |

**Logic:**
1. Fetch users with `delivery_enabled = true` and matching `delivery_schedule`
2. For each user, aggregate top 5 trending topics + pending drafts count
3. Send formatted email via Resend API
4. Create notification `delivery`

**Cron schedule:** Every minute, checks against user's `delivery_schedule` (`* * * * *`)

---

## 8. Database Triggers & Functions

### 8.1 Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  -- Assign default 'reporter' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'reporter');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 8.2 Auto-update `updated_at` timestamps

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ai_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

### 8.3 Auto-log draft status changes

```sql
CREATE OR REPLACE FUNCTION public.log_draft_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _event activity_event_type;
  _name text;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    _event := CASE NEW.status
      WHEN 'approved' THEN 'draft_approved'
      WHEN 'rejected' THEN 'draft_rejected'
      WHEN 'published' THEN 'post_published'
    END;

    IF _event IS NOT NULL THEN
      SELECT full_name INTO _name FROM public.profiles WHERE id = NEW.user_id;

      INSERT INTO public.activity_logs (user_id, event_type, reporter_name, details)
      VALUES (
        NEW.user_id,
        _event,
        COALESCE(_name, 'Unknown'),
        _event::text || ': "' || NEW.topic_title || '"'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_draft_status_change
  AFTER UPDATE ON public.ai_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_draft_status_change();
```

---

## 9. Realtime Subscriptions

Enable Realtime on these tables in the Supabase Dashboard:

| Table | Events | Use Case |
|-------|--------|----------|
| `trending_topics` | INSERT | Live trend feed on Dashboard |
| `notifications` | INSERT, UPDATE | Badge count + toast alerts |
| `ai_drafts` | INSERT, UPDATE | Draft status changes |

**Frontend subscription pattern:**

```typescript
supabase
  .channel('trending-topics')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'trending_topics', filter: `user_id=eq.${userId}` },
    (payload) => queryClient.invalidateQueries({ queryKey: ['trending-topics'] })
  )
  .subscribe();
```

---

## 10. Cron Jobs

Requires `pg_cron` and `pg_net` extensions enabled.

| Job | Schedule | Edge Function | Description |
|-----|----------|---------------|-------------|
| Poll Sources | `*/15 * * * *` | `poll-sources` | Every 15 min, poll all monitored sources |
| Send Digest | `* * * * *` | `send-digest` | Every minute, check for scheduled digests |

```sql
-- Poll sources every 15 minutes
SELECT cron.schedule(
  'poll-sources-every-15-min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/poll-sources',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Check for daily digests every minute
SELECT cron.schedule(
  'send-digest-check',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);
```

---

## 11. Environment Secrets

Stored via Supabase Secrets (Vault), accessed in Edge Functions via `Deno.env.get()`.

| Secret | Used By | Description |
|--------|---------|-------------|
| `OPENAI_API_KEY` | `generate-draft`, `generate-research`, `process-script` | OpenAI GPT-4 API key |
| `TWITTER_CONSUMER_KEY` | `poll-sources`, `publish-tweet` | Twitter/X API key |
| `TWITTER_CONSUMER_SECRET` | `poll-sources`, `publish-tweet` | Twitter/X API secret |
| `TWITTER_ACCESS_TOKEN` | `poll-sources` | App-level Twitter access token |
| `TWITTER_ACCESS_TOKEN_SECRET` | `poll-sources` | App-level Twitter access token secret |
| `YOUTUBE_API_KEY` | `poll-sources` | YouTube Data API v3 key |
| `RESEND_API_KEY` | `send-digest` | Resend email API key |

---

*Generated: 2026-03-08 | Version: 1.0 | Status: Specification*
