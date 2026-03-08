import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileEdit, CheckCircle, XCircle, Send, Clock, RefreshCw, Pencil } from "lucide-react";
import { mockDrafts, statusConfig, type AIDraft } from "@/lib/mock-data";
import { toast } from "sonner";

const AIDrafts = () => {
  const [drafts, setDrafts] = useState<AIDraft[]>(mockDrafts);
  const [filter, setFilter] = useState<string>("all");
  const [editDraft, setEditDraft] = useState<AIDraft | null>(null);
  const [editContent, setEditContent] = useState("");

  const filtered = drafts.filter((d) =>
    filter === "all" ? d.status !== "published" : d.status === filter
  );

  const handleApprove = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "approved" as const } : d))
    );
    toast.success("Draft approved! Ready to publish.");
  };

  const handleReject = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "rejected" as const } : d))
    );
    toast.info("Draft rejected.");
  };

  const handlePublish = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "published" as const } : d))
    );
    toast.success("Published to Twitter!");
  };

  const handleEdit = (draft: AIDraft) => {
    setEditDraft(draft);
    setEditContent(draft.content);
  };

  const handleSaveEdit = () => {
    if (!editDraft) return;
    setDrafts((prev) =>
      prev.map((d) => (d.id === editDraft.id ? { ...d, content: editContent } : d))
    );
    setEditDraft(null);
    toast.success("Draft updated.");
  };

  const handleRegenerate = (id: string) => {
    toast.info("Regenerating draft with AI...");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileEdit className="h-6 w-6 text-warning" />
          AI Drafts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, edit, and approve AI-generated content
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drafts</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && (
          <Card className="bg-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              No drafts match this filter.
            </CardContent>
          </Card>
        )}
        {filtered.map((draft) => {
          const config = statusConfig[draft.status];
          const StatusIcon = config.icon;
          return (
            <Card key={draft.id} className="bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {draft.topicTitle}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Created {draft.createdAt} · Updated {draft.updatedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono capitalize">
                      {draft.contentLength}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        draft.status === "pending"
                          ? "bg-warning/10 text-warning border-warning/30"
                          : draft.status === "approved"
                          ? "bg-success/10 text-success border-success/30"
                          : draft.status === "rejected"
                          ? "bg-destructive/10 text-destructive border-destructive/30"
                          : "bg-primary/10 text-primary border-primary/30"
                      }`}
                    >
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-secondary/50 text-sm whitespace-pre-wrap leading-relaxed">
                  {draft.content}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {draft.status === "pending" && (
                    <>
                      <Button size="sm" className="text-xs h-7 bg-success text-success-foreground hover:bg-success/90" onClick={() => handleApprove(draft.id)}>
                        <CheckCircle className="mr-1 h-3 w-3" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(draft.id)}>
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleEdit(draft)}>
                        <Pencil className="mr-1 h-3 w-3" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleRegenerate(draft.id)}>
                        <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                      </Button>
                    </>
                  )}
                  {draft.status === "approved" && (
                    <Button size="sm" className="text-xs h-7 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handlePublish(draft.id)}>
                      <Send className="mr-1 h-3 w-3" /> Publish to Twitter
                    </Button>
                  )}
                  {draft.status === "rejected" && (
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => handleRegenerate(draft.id)}>
                      <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editDraft} onOpenChange={() => setEditDraft(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Draft</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={10}
            className="bg-secondary/50 resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDraft(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIDrafts;
