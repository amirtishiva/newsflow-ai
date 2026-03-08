import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useDrafts(statusFilter?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["drafts", user?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("ai_drafts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateDraftStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, tweet_url }: { id: string; status: string; tweet_url?: string }) => {
      const updates: Record<string, any> = { status };
      if (tweet_url) updates.tweet_url = tweet_url;
      const { error } = await supabase.from("ai_drafts").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      queryClient.invalidateQueries({ queryKey: ["trending-topics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDraftContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase.from("ai_drafts").update({ content }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      toast.success("Draft updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_drafts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
      toast.success("Draft deleted.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
