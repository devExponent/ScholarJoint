import * as React from "react";
import { Link } from "react-router-dom";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ReviewStatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { Review, Submission } from "@/types";
import { FileEdit, Download } from "lucide-react";

export function AssignedPapersPage() {
  const { user } = useAuth();
  const [rows, setRows] = React.useState<{ review: Review; submission: Submission }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    Promise.all([api.getReviews({ reviewerId: user.id }), api.getSubmissions()]).then(([revs, subs]) => {
      const combined = revs
        .map((r) => ({ review: r, submission: subs.find((s) => s.id === r.submissionId)! }))
        .filter((row) => row.submission);
      setRows(combined);
      setIsLoading(false);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">My Assigned Papers</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paper ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Track</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ review, submission }) => (
            <TableRow key={review.id}>
              <TableCell className="font-mono text-sm">{submission.id}</TableCell>
              <TableCell className="max-w-xs truncate font-medium">{submission.title}</TableCell>
              <TableCell className="text-base capitalize">{submission.type.replace("_", " ")}</TableCell>
              <TableCell className="text-base text-muted-foreground">{submission.track}</TableCell>
              <TableCell className="text-base">{new Date(review.deadline).toLocaleDateString()}</TableCell>
              <TableCell><ReviewStatusBadge status={review.status} /></TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {submission.files.length > 0 && (
                    <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /></Button>
                  )}
                  <Button size="sm" asChild disabled={review.status === "submitted"}>
                    <Link to={`/reviewer/review/${review.id}`}>
                      <FileEdit className="h-3.5 w-3.5" /> {review.status === "submitted" ? "Submitted" : "Start Review"}
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && rows.length === 0 && (
            <TableRow><TableCell colSpan={7} className="py-10 text-center text-base text-muted-foreground">No papers assigned.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
