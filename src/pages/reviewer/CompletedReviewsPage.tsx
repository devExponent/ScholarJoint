import * as React from "react";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Review, Submission } from "@/types";

export function CompletedReviewsPage() {
  const { user } = useAuth();
  const [rows, setRows] = React.useState<{ review: Review; submission: Submission }[]>([]);

  React.useEffect(() => {
    if (!user) return;
    Promise.all([api.getReviews({ reviewerId: user.id }), api.getSubmissions()]).then(([revs, subs]) => {
      const combined = revs
        .filter((r) => r.status === "submitted")
        .map((r) => ({ review: r, submission: subs.find((s) => s.id === r.submissionId)! }))
        .filter((row) => row.submission);
      setRows(combined);
    });
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">Completed Reviews</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paper ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Recommendation</TableHead>
            <TableHead>Submitted On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ review, submission }) => (
            <TableRow key={review.id}>
              <TableCell className="font-mono text-sm">{submission.id}</TableCell>
              <TableCell className="max-w-xs truncate font-medium">{submission.title}</TableCell>
              <TableCell className="text-base capitalize">{submission.type.replace("_", " ")}</TableCell>
              <TableCell><Badge variant="success" className="capitalize">{review.recommendation?.replace("_", " ")}</Badge></TableCell>
              <TableCell className="text-base text-muted-foreground">{review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : "—"}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={5} className="py-10 text-center text-base text-muted-foreground">No completed reviews yet.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
