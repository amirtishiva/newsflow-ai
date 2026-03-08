

# Plan: Backend Specification & API Specification Documents

## Overview

Create two comprehensive markdown files — `Backend-Specification.md` and `API-Specification.md` — that map every frontend feature to Supabase backend infrastructure (database schema, auth, storage, edge functions, RLS policies) and define the complete REST/RPC API contract.

## What will be created

### 1. `Backend-Specification.md`
A complete Supabase backend blueprint covering:

- **Database Schema** — All tables with columns, types, constraints, and relationships derived from the mock data interfaces (`TrendingTopic`, `AIDraft`, `MonitoredSource`, `Notification`, `TrainingScript`, `ResearchReport`, `ActivityLog`) plus `profiles`, `user_roles`, and `user_preferences`
- **Authentication** — Supabase Auth setup (email/password, OAuth Twitter), password policies, session management, onboarding flow
- **Row-Level Security (RLS)** — Policies for every table ensuring users only access their own data, with `has_role()` security definer function for admin access
- **Storage Buckets** — `training-scripts` (10MB, .txt/.docx/.pdf) and `avatars` (5MB, images) with upload policies
- **Edge Functions** — Specifications for: `generate-draft` (LLM integration), `poll-sources` (Twitter API/RSS/YouTube polling), `publish-tweet` (Twitter OAuth publishing), `generate-research` (research report generation), `process-script` (style training pipeline), `send-digest` (daily digest cron)
- **Realtime Subscriptions** — Channels for trending topics, notifications, and draft status changes
- **Database Triggers** — Auto-create profile on signup, auto-log activity events, auto-generate notifications on trend detection
- **Enums & Types** — `app_role`, `source_type`, `draft_status`, `content_length`, `notification_type`, `activity_event_type`

### 2. `API-Specification.md`
A complete API contract covering every frontend interaction:

- **Auth Endpoints** — signup, login, logout, forgot-password, reset-password, OAuth Twitter callback
- **Profiles** — GET/PATCH own profile, avatar upload URL
- **Trending Topics** — List (with source filter, sort by significance), get single topic
- **Research Reports** — Get by topic ID, generate new report
- **AI Drafts** — List (with status filter), generate new draft, approve/reject/edit/regenerate, publish to Twitter
- **Published Posts** — List all, delete post (with audit log), deletion history
- **Sources** — List, add, remove monitored sources
- **Training Scripts** — List, upload, delete, get style profile
- **Notifications** — List, mark read, mark all read, unread count
- **Activity Log** — List with pagination
- **Settings/Preferences** — GET/PATCH (delivery schedule, content defaults, notification preferences, Twitter connection status)
- **Dashboard Aggregates** — Stats endpoint returning counts for trending topics, pending drafts, published today, active sources

Each endpoint will specify: method, path, request body/params, response shape, auth requirements, and corresponding Supabase client call pattern (e.g., `supabase.from('table').select()` vs `supabase.functions.invoke()`).

## Approach
- Derive all types and relationships directly from the existing `mock-data.ts` interfaces and page component usage
- Follow Supabase conventions (RLS, security definer functions, storage policies)
- Follow the PRD's security requirements (separate `user_roles` table, human-in-the-loop for publishing, audit trails)
- Use `supabase.functions.invoke()` for edge function calls (never path-based `/api/...`)

