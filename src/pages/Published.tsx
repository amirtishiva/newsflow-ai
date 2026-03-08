import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Trash2, ExternalLink, FileText, Clock } from "lucide-react";
import { mockDrafts, type AIDraft } from "@/lib/mock-data";
import { toast } from "sonner";

interface DeletedPost {
  id: string;
  topicTitle: string;
  contentPreview: string;
  deletedAt: string;
}

const Published = () => {
  const [posts, setPosts] = useState<AIDraft[]>(
    mockDrafts.filter((d) => d.status === "published")
  );
  const [deletedPosts, setDeletedPosts] = useState<DeletedPost[]>([]);
  const [viewDraft, setViewDraft] = useState<AIDraft | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const handleDelete = (post: AIDraft) => {
    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setDeletedPosts((prev) => [
      {
        id: post.id,
        topicTitle: post.topicTitle,
        contentPreview: post.content.slice(0, 120) + "...",
        deletedAt: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    toast.success("Post deleted from Twitter.");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Published Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">
            Manage your published Twitter content
          </p>
        </div>
        {deletedPosts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-body"
            onClick={() => setShowDeleted(!showDeleted)}
          >
            <Clock className="mr-1 h-3 w-3" />
            {showDeleted ? "Hide" : "Show"} Deletion History ({deletedPosts.length})
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground font-body">
            No published posts yet. Approve and publish drafts to see them here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-muted-foreground font-mono">
                        Published {post.updatedAt}
                      </p>
                      <Badge variant="outline" className="text-[10px] font-mono capitalize">
                        {post.contentLength}
                      </Badge>
                    </div>
                    <p className="text-sm font-serif font-semibold text-foreground mb-1">
                      {post.topicTitle}
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed font-body">
                      {post.content}
                    </p>
                    {post.tweetUrl && (
                      <div className="mt-2 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        <a
                          href={post.tweetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-primary hover:underline"
                        >
                          {post.tweetUrl}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {post.tweetUrl && (
                      <Button size="sm" variant="ghost" className="text-xs h-7 font-body" asChild>
                        <a href={post.tweetUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1 h-3 w-3" /> View on X
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 font-body"
                      onClick={() => setViewDraft(post)}
                    >
                      <FileText className="mr-1 h-3 w-3" /> Original Draft
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 text-destructive hover:text-destructive font-body"
                      onClick={() => handleDelete(post)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Deletion History */}
      {showDeleted && deletedPosts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-serif font-semibold text-foreground mb-3">
              Deletion History
            </h3>
            <div className="space-y-2">
              {deletedPosts.map((dp) => (
                <div
                  key={dp.id}
                  className="flex items-start justify-between p-3 rounded bg-muted opacity-70"
                >
                  <div>
                    <p className="text-sm font-semibold font-body">{dp.topicTitle}</p>
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {dp.contentPreview}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className="text-[9px] font-mono text-destructive border-destructive/30">
                      Deleted
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                      {dp.deletedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original Draft Dialog */}
      <Dialog open={!!viewDraft} onOpenChange={() => setViewDraft(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">Original AI Draft</DialogTitle>
          </DialogHeader>
          {viewDraft && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono capitalize">
                  {viewDraft.contentLength}
                </Badge>
                <span className="text-xs text-muted-foreground font-body">
                  Created {viewDraft.createdAt}
                </span>
              </div>
              <p className="text-sm font-serif font-semibold">{viewDraft.topicTitle}</p>
              <div className="p-3 rounded bg-muted text-sm whitespace-pre-wrap leading-relaxed font-body">
                {viewDraft.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Published;
