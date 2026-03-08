import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Send, RefreshCw, Pencil, Clock } from "lucide-react";
import { useDrafts, useUpdateDraftStatus, useUpdateDraftContent } from "@/hooks/use-drafts";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<string, { label: string; icon: React.ElementType }> = {
  pending: { label: "Pending Review", icon: Clock },
  approved: { label: "Approved", icon: CheckCircle },
  rejected: { label: "Rejected", icon: XCircle },
  published: { label: "Published", icon: CheckCircle },
};

const AIDrafts = () => {
  const [filter, setFilter] = useState<string>("all");
  const [editDraftId, setEditDraftId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: allDrafts, isLoading } = useDrafts();
  const updateStatus = useUpdateDraftStatus();
  const updateContent = useUpdateDraftContent();

  const drafts = (allDrafts ?? []).filter((d) =>
    filter === "all" ? d.status !== "published" : d.status === filter
  );

  const editDraft = allDrafts?.find((d) => d.id === editDraftId);

  const handleApprove = (id: string) => {
    updateStatus.mutate({ id, status: "approved" });
    toast.success("Draft approved!");
  };

  const handleReject = (id: string) => {
    updateStatus.mutate({ id, status: "rejected" });
    toast.info("Draft rejected.");
  };

  const handlePublish = (id: string) => {
    updateStatus.mutate({ id, status: "published" });
    toast.success("Published to Twitter!");
  };

  const handleEdit = (draft: any) => {
    setEditDraftId(draft.id);
    setEditContent(draft.content);
  };

  const handleSaveEdit = () => {
    if (!editDraftId) return;
    updateContent.mutate({ id: editDraftId, content: editContent });
    setEditDraftId(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">AI Drafts</h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">Review, edit, and approve AI-generated content</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drafts</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-40 w-full" />)
        ) : drafts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground font-body">No drafts match this filter.</CardContent></Card>
        ) : (
          drafts.map((draft) => {
            const config = statusConfig[draft.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Card key={draft.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-serif font-semibold">{draft.topic_title}</CardTitle>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-body">
                        Created {new Date(draft.created_at).toLocaleString()} · Updated {new Date(draft.updated_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono capitalize">{draft.content_length}</Badge>
                      <Badge variant="outline" className={`text-[10px] font-mono ${
                        draft.status === "pending" ? "bg-warning/10 text-warning border-warning/30"
                        : draft.status === "approved" ? "bg-success/10 text-success border-success/30"
                        : draft.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/30"
                        : "bg-muted text-foreground"
                      }`}>
                        <StatusIcon className="mr-1 h-3 w-3" />{config.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded bg-muted text-sm whitespace-pre-wrap leading-relaxed font-body">{draft.content}</div>
                  <div className="flex items-center gap-2 mt-3">
                    {draft.status === "pending" && (
                      <>
                        <Button size="sm" className="text-xs h-7 bg-success text-success-foreground hover:bg-success/90 font-body" onClick={() => handleApprove(draft.id)}><CheckCircle className="mr-1 h-3 w-3" /> Approve</Button>
                        <Button size="sm" variant="outline" className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10 font-body" onClick={() => handleReject(draft.id)}><XCircle className="mr-1 h-3 w-3" /> Reject</Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7 font-body" onClick={() => handleEdit(draft)}><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                      </>
                    )}
                    {draft.status === "approved" && (
                      <Button size="sm" className="text-xs h-7 font-body" onClick={() => handlePublish(draft.id)}><Send className="mr-1 h-3 w-3" /> Publish to Twitter</Button>
                    )}
                    {draft.status === "rejected" && (
                      <Button size="sm" variant="ghost" className="text-xs h-7 font-body"><RefreshCw className="mr-1 h-3 w-3" /> Regenerate</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!editDraftId} onOpenChange={() => setEditDraftId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-serif">Edit Draft</DialogTitle></DialogHeader>
          <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={10} className="resize-none font-body" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDraftId(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIDrafts;
