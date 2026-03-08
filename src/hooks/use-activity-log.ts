import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useActivityLogs(filter?: string, search?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["activity-logs", user?.id, filter, search],
    queryFn: async () => {
      let query = supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (filter && filter !== "all") {
        query = query.eq("event_type", filter as any);
      }
      if (search) {
        query = query.ilike("details", `%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
