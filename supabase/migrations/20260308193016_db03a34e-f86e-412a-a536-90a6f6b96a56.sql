
-- Create updated_at triggers (using IF NOT EXISTS via DROP IF EXISTS + CREATE)
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.user_preferences;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.ai_drafts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.ai_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
