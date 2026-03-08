import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  Download,
  LogIn,
  CheckCircle,
  Send,
  Trash2,
  Plus,
  Minus,
  FileText,
  Shield,
} from "lucide-react";
import { mockActivityLogs, type ActivityLog as ActivityLogType } from "@/lib/mock-data";
import { toast } from "sonner";

const eventIcons: Record<string, React.ElementType> = {
  auth_login: LogIn,
  auth_logout: LogIn,
  draft_approved: CheckCircle,
  draft_rejected: Minus,
  post_published: Send,
  post_deleted: Trash2,
  source_added: Plus,
  source_removed: Minus,
  script_uploaded: FileText,
};

const eventLabels: Record<string, string> = {
  auth_login: "Login",
  auth_logout: "Logout",
  draft_approved: "Draft Approved",
  draft_rejected: "Draft Rejected",
  post_published: "Published",
  post_deleted: "Post Deleted",
  source_added: "Source Added",
  source_removed: "Source Removed",
  script_uploaded: "Script Uploaded",
};

const ActivityLog = () => {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = mockActivityLogs.filter((log) => {
    const matchesFilter = filter === "all" || log.eventType === filter;
    const matchesSearch =
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.reporter.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Reporter", "Event Type", "Details"];
    const rows = filtered.map((log) => [
      log.timestamp,
      log.reporter,
      eventLabels[log.eventType] || log.eventType,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Activity log exported as CSV.");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Activity Log
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-body">
            Comprehensive audit trail of all platform actions
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="font-body">
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by reporter or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="auth_login">Logins</SelectItem>
            <SelectItem value="auth_logout">Logouts</SelectItem>
            <SelectItem value="draft_approved">Draft Approvals</SelectItem>
            <SelectItem value="draft_rejected">Draft Rejections</SelectItem>
            <SelectItem value="post_published">Published</SelectItem>
            <SelectItem value="post_deleted">Deletions</SelectItem>
            <SelectItem value="source_added">Sources Added</SelectItem>
            <SelectItem value="source_removed">Sources Removed</SelectItem>
            <SelectItem value="script_uploaded">Script Uploads</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Audit Trail
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono">
              {filtered.length} events
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 divide-y divide-border">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center font-body">
                No events match your filters.
              </p>
            ) : (
              filtered.map((log) => {
                const Icon = eventIcons[log.eventType] || Shield;
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="mt-0.5 p-2 rounded bg-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold font-body text-foreground">
                          {eventLabels[log.eventType] || log.eventType}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-mono capitalize"
                        >
                          {log.eventType.split("_")[0]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-body">
                        {log.details}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                        by {log.reporter}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;
