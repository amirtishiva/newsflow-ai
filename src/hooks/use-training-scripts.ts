import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useTrainingScripts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["training-scripts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_scripts")
        .select("*")
        .eq("user_id", user!.id)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUploadScript() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const storagePath = `${user!.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("training-scripts")
        .upload(storagePath, file);
      if (uploadError) throw uploadError;

      const sizeStr = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(0)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const { data: scriptData, error } = await supabase.from("training_scripts").insert({
        user_id: user!.id,
        file_name: file.name,
        file_size: sizeStr,
        storage_path: storagePath,
        status: "processing" as any,
      }).select().single();
      if (error) throw error;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: user!.id,
        event_type: "script_uploaded" as any,
        details: `Uploaded training script: ${file.name} (${sizeStr})`,
      });

      // Trigger processing via edge function
      supabase.functions.invoke("process-script", {
        body: { script_id: scriptData.id, storage_path: storagePath },
      }).catch(console.error); // Fire and forget
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-scripts"] });
      toast.success("Script uploaded. Processing...");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteScript() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath?: string | null }) => {
      if (storagePath) {
        await supabase.storage.from("training-scripts").remove([storagePath]);
      }
      const { error } = await supabase.from("training_scripts").delete().eq("id", id);
      if (error) throw error;
      await supabase.from("activity_logs").insert({
        user_id: user!.id,
        event_type: "script_removed" as any,
        details: "Removed a training script",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-scripts"] });
      toast.success("Script removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
