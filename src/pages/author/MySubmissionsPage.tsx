import * as React from "react";
import { Link } from "react-router-dom";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SubmissionStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Submission } from "@/types";
import { Plus, Eye } from "lucide-react";

export function MySubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    api.getSubmissions({ ownerId: user.id }).then((s) => { setSubmissions(s); setIsLoading(false); });
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">My Submissions</h1>
        <Button asChild>
          <Link to="/author/submit"><Plus className="h-4 w-4" /> New Submission</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paper ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Track</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-sm">{s.id}</TableCell>
              <TableCell className="max-w-xs truncate font-medium">{s.title}</TableCell>
              <TableCell className="text-base text-muted-foreground">{s.track}</TableCell>
              <TableCell className="text-base capitalize">{s.type.replace("_", " ")}</TableCell>
              <TableCell><SubmissionStatusBadge status={s.status} /></TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/author/submissions/${s.id.replace("#", "")}`}><Eye className="h-3.5 w-3.5" /> View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && submissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-base text-muted-foreground">
                No submissions yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
