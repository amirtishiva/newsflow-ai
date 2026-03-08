import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTrendingTopics(sourceFilter?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["trending-topics", user?.id, sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from("trending_topics")
        .select("*")
        .eq("user_id", user!.id)
        .order("significance_score", { ascending: false });
      if (sourceFilter && sourceFilter !== "all") {
        query = query.eq("source", sourceFilter as any);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
