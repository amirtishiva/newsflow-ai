import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useResearchReport(topicId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["research-report", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("research_reports")
        .select("*")
        .eq("topic_id", topicId!)
        .eq("user_id", user!.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!topicId,
  });
}

export function useTopic(topicId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trending_topics")
        .select("*")
        .eq("id", topicId!)
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!topicId,
  });
}
