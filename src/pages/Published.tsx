import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2, ExternalLink, FileText } from "lucide-react";
import { useDrafts, useDeleteDraft } from "@/hooks/use-drafts";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Published = () => {
  const { data: allDrafts, isLoading } = useDrafts("published");
  const deleteDraft = useDeleteDraft();
  const { user } = useAuth();
  const [viewDraftId, setViewDraftId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const posts = allDrafts ?? [];
  const viewDraft = posts.find((p) => p.id === viewDraftId);

  const handleDelete = async (post: any) => {
    deleteDraft.mutate(post.id, {
      onSuccess: async () => {
        if (user) {
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            event_type: "post_deleted" as any,
            details: `Deleted published post: "${post.topic_title}"`,
          });
        }
      },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Published Posts</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Manage your published Twitter content</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground font-body">No published posts yet. Approve and publish drafts to see them here.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-muted-foreground font-mono">Published {new Date(post.updated_at).toLocaleString()}</p>
                      <Badge variant="outline" className="text-[10px] font-mono capitalize">{post.content_length}</Badge>
                    </div>
                    <p className="text-sm font-serif font-semibold text-foreground mb-1">{post.topic_title}</p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed font-body">{post.content}</p>
                    {post.tweet_url && (
                      <div className="mt-2 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        <a href={post.tweet_url} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-primary hover:underline">{post.tweet_url}</a>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {post.tweet_url && (
                      <Button size="sm" variant="ghost" className="text-xs h-7 font-body" asChild>
                        <a href={post.tweet_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3 w-3" /> View on X</a>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs h-7 font-body" onClick={() => setViewDraftId(post.id)}>
                      <FileText className="mr-1 h-3 w-3" /> Original Draft
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive hover:text-destructive font-body" onClick={() => setDeleteTarget(post)}>
                      <Trash2 className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Published Post?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently delete "{deleteTarget?.topic_title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body" onClick={() => { handleDelete(deleteTarget); setDeleteTarget(null); }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewDraftId} onOpenChange={() => setViewDraftId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-serif">Original AI Draft</DialogTitle></DialogHeader>
          {viewDraft && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono capitalize">{viewDraft.content_length}</Badge>
                <span className="text-xs text-muted-foreground font-body">Created {new Date(viewDraft.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm font-serif font-semibold">{viewDraft.topic_title}</p>
              <div className="p-3 rounded bg-muted text-sm whitespace-pre-wrap leading-relaxed font-body">{viewDraft.content}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Published;
