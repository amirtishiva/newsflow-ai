import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Trash2, ExternalLink } from "lucide-react";
import { mockDrafts, type AIDraft } from "@/lib/mock-data";
import { toast } from "sonner";

const Published = () => {
  const [posts, setPosts] = useState<AIDraft[]>(
    mockDrafts.filter((d) => d.status === "published")
  );

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Post deleted from Twitter.");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
          Published Posts
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Manage your published Twitter content
        </p>
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
                    <p className="text-xs text-muted-foreground font-mono mb-2">
                      Published {post.updatedAt}
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed font-body">
                      {post.content}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="text-xs h-7 font-body">
                      <ExternalLink className="mr-1 h-3 w-3" /> View on X
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 text-destructive hover:text-destructive font-body"
                      onClick={() => handleDelete(post.id)}
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
    </div>
  );
};

export default Published;
