import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function usePreferences() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["preferences", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpdatePreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user!.id);
      if (error) throw error;
      await supabase.from("activity_logs").insert({
        user_id: user!.id,
        event_type: "settings_updated" as any,
        details: "Updated preferences",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      toast.success("Preferences saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
