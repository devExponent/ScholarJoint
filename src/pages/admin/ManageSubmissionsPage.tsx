import * as React from "react";
import { Link } from "react-router-dom";
import * as api from "@/services/api";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SubmissionStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { Submission } from "@/types";
import { Eye } from "lucide-react";

export function ManageSubmissionsPage() {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.getSubmissions().then((s) => { setSubmissions(s); setIsLoading(false); });
  }, []);

  const filtered = statusFilter === "all" ? submissions : submissions.filter((s) => s.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Manage Submissions</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="abstract_submitted">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paper ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Track</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-sm">{s.id}</TableCell>
              <TableCell className="max-w-xs truncate font-medium">{s.title}</TableCell>
              <TableCell className="text-base text-muted-foreground">{s.authors[0]?.displayName}</TableCell>
              <TableCell className="text-base text-muted-foreground">{s.track}</TableCell>
              <TableCell className="text-base capitalize">{s.type.replace("_", " ")}</TableCell>
              <TableCell><SubmissionStatusBadge status={s.status} /></TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/submissions/${s.id.replace("#", "")}`}><Eye className="h-3.5 w-3.5" /> View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && filtered.length === 0 && (
            <TableRow><TableCell colSpan={7} className="py-10 text-center text-base text-muted-foreground">No submissions match this filter.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
