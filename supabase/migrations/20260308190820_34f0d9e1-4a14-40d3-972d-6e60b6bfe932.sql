
-- ============================================================
-- Phase 1: Full Database Schema for NewsFlow AI
-- ============================================================

-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('reporter', 'editor', 'admin');
CREATE TYPE public.source_type AS ENUM ('twitter', 'rss', 'youtube');
CREATE TYPE public.draft_status AS ENUM ('pending', 'approved', 'rejected', 'published');
CREATE TYPE public.content_length AS ENUM ('short', 'medium', 'long');
CREATE TYPE public.notification_type AS ENUM ('trend_alert', 'training_complete', 'delivery', 'override');
CREATE TYPE public.activity_event_type AS ENUM (
  'auth_login', 'auth_logout',
  'draft_approved', 'draft_rejected', 'draft_edited',
  'post_published', 'post_deleted',
  'source_added', 'source_removed',
  'script_uploaded', 'script_removed',
  'settings_updated', 'profile_updated'
);
CREATE TYPE public.script_status AS ENUM ('processing', 'complete', 'error');

-- 2. TABLES

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  display_name TEXT,
  title TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  avatar_url TEXT,
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  twitter_handle TEXT DEFAULT '',
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- user_preferences
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_length public.content_length NOT NULL DEFAULT 'medium',
  digest_enabled BOOLEAN NOT NULL DEFAULT true,
  digest_time TIME NOT NULL DEFAULT '10:00',
  digest_days TEXT[] NOT NULL DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri'],
  email_alerts BOOLEAN NOT NULL DEFAULT true,
  in_app_alerts BOOLEAN NOT NULL DEFAULT true,
  trend_alerts BOOLEAN NOT NULL DEFAULT true,
  alert_threshold INTEGER NOT NULL DEFAULT 70,
  notif_frequency TEXT NOT NULL DEFAULT 'immediate',
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_start TIME NOT NULL DEFAULT '22:00',
  quiet_end TIME NOT NULL DEFAULT '07:00',
  twitter_connected BOOLEAN NOT NULL DEFAULT false,
  twitter_handle TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- monitored_sources
CREATE TABLE public.monitored_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.source_type NOT NULL,
  handle TEXT NOT NULL,
  label TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- trending_topics
CREATE TABLE public.trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source public.source_type NOT NULL,
  source_handle TEXT NOT NULL,
  engagement INTEGER NOT NULL DEFAULT 0,
  significance_score INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  has_draft BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ai_drafts
CREATE TABLE public.ai_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.trending_topics(id) ON DELETE SET NULL,
  topic_title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status public.draft_status NOT NULL DEFAULT 'pending',
  content_length public.content_length NOT NULL DEFAULT 'medium',
  tweet_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- research_reports
CREATE TABLE public.research_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.trending_topics(id) ON DELETE SET NULL,
  significance_score INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  key_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  quotes JSONB NOT NULL DEFAULT '[]'::jsonb,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- training_scripts
CREATE TABLE public.training_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  storage_path TEXT,
  status public.script_status NOT NULL DEFAULT 'processing',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- activity_logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type public.activity_event_type NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SECURITY DEFINER FUNCTION for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. RLS POLICIES

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- monitored_sources
ALTER TABLE public.monitored_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sources" ON public.monitored_sources FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sources" ON public.monitored_sources FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sources" ON public.monitored_sources FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- trending_topics
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own topics" ON public.trending_topics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own topics" ON public.trending_topics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own topics" ON public.trending_topics FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ai_drafts
ALTER TABLE public.ai_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own drafts" ON public.ai_drafts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drafts" ON public.ai_drafts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drafts" ON public.ai_drafts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drafts" ON public.ai_drafts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- research_reports
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON public.research_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.research_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- training_scripts
ALTER TABLE public.training_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own scripts" ON public.training_scripts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scripts" ON public.training_scripts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scripts" ON public.training_scripts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scripts" ON public.training_scripts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON public.activity_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. TRIGGERS

-- Auto-create profile + preferences + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'reporter');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_drafts_updated_at BEFORE UPDATE ON public.ai_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-log draft status changes
CREATE OR REPLACE FUNCTION public.log_draft_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.activity_logs (user_id, event_type, details, metadata)
    VALUES (
      NEW.user_id,
      CASE NEW.status
        WHEN 'approved' THEN 'draft_approved'::activity_event_type
        WHEN 'rejected' THEN 'draft_rejected'::activity_event_type
        WHEN 'published' THEN 'post_published'::activity_event_type
        ELSE 'draft_edited'::activity_event_type
      END,
      'Draft "' || NEW.topic_title || '" status changed to ' || NEW.status,
      jsonb_build_object('draft_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_draft_status_change
  AFTER UPDATE ON public.ai_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_draft_status_change();

-- 6. STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('training-scripts', 'training-scripts', false, 10485760);

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', true, 5242880);

-- Storage policies for training-scripts
CREATE POLICY "Users can upload own scripts" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'training-scripts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own scripts" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'training-scripts' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own scripts" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'training-scripts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 7. Enable realtime for notifications and trending_topics
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trending_topics;
