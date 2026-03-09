import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useSources() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sources", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monitored_sources")
        .select("*")
        .eq("user_id", user!.id)
        .order("added_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAddSource() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (source: { type: string; handle: string; label: string }) => {
      const { error } = await supabase.from("monitored_sources").insert({
        user_id: user!.id,
        type: source.type as any,
        handle: source.handle,
        label: source.label,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      if (user) {
        await supabase.from("activity_logs").insert({
          user_id: user.id,
          event_type: "source_added" as any,
          details: "Added a new monitored source",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Source added.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveSource() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("monitored_sources").delete().eq("id", id);
      if (error) throw error;
      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user!.id,
        event_type: "source_removed" as any,
        details: "Removed a monitored source",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      toast.success("Source removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
