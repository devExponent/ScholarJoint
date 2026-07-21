import * as React from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "@/services/api";
import { SubmissionStatusBadge, ReviewStatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Submission, User, Review } from "@/types";
import { ArrowLeft, Check, X, RotateCcw, UserPlus } from "lucide-react";

export function AdminSubmissionDetailsPage() {
  const { id } = useParams();
  const [submission, setSubmission] = React.useState<Submission | null>(null);
  const [reviewers, setReviewers] = React.useState<User[]>([]);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [selectedReviewers, setSelectedReviewers] = React.useState<string[]>([]);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!id) return;
    const sub = await api.getSubmissionById(`#${id}`);
    if (!sub) return;
    setSubmission(sub);
    const [revs, allReviews] = await Promise.all([api.getUsers("reviewer"), api.getReviews({ submissionId: sub.id })]);
    setReviewers(revs);
    setReviews(allReviews);
  }, [id]);

  React.useEffect(() => { load(); }, [load]);

  const handleDecision = async (status: "accepted" | "rejected" | "abstract_accepted" | "abstract_rejected" | "revision_requested") => {
    if (!submission) return;
    await api.updateSubmissionStatus(submission.id, status);
    setSuccessMsg("Decision saved successfully.");
    load();
  };

  const toggleReviewer = (rid: string) => {
    setSelectedReviewers((prev) => (prev.includes(rid) ? prev.filter((x) => x !== rid) : [...prev, rid]));
  };

  const handleAssign = async () => {
    if (!submission || selectedReviewers.length === 0) return;
    await api.assignReviewers(submission.id, selectedReviewers);
    setSuccessMsg(`Reviewer(s) assigned successfully.`);
    setSelectedReviewers([]);
    load();
  };

  if (!submission) return <p className="text-base text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/admin/submissions" className="inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Submissions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm text-muted-foreground">{submission.id}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold break-words">{submission.title}</h1>
          <p className="mt-1 truncate text-base text-muted-foreground">{submission.authors[0]?.displayName} · {submission.track}</p>
        </div>
        <div className="shrink-0"><SubmissionStatusBadge status={submission.status} /></div>
      </div>

      {successMsg && <div className="rounded-md bg-success/10 px-4 py-2 text-base text-success">{successMsg}</div>}

      <Card>
        <CardHeader><CardTitle>Abstract</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-base leading-relaxed text-muted-foreground">{submission.abstractText}</p>
          <div className="flex flex-wrap gap-1.5">
            {submission.keywords.map((k) => <Badge key={k} variant="secondary">{k}</Badge>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Decision</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="default" onClick={() => handleDecision(submission.type === "abstract" ? "abstract_accepted" : "accepted")}>
            <Check className="h-4 w-4" /> Accept
          </Button>
          <Button variant="destructive" onClick={() => handleDecision(submission.type === "abstract" ? "abstract_rejected" : "rejected")}>
            <X className="h-4 w-4" /> Reject
          </Button>
          <Button variant="outline" onClick={() => handleDecision("revision_requested")}>
            <RotateCcw className="h-4 w-4" /> Request Revision
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Assign Reviewer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {reviewers.map((r) => {
              const existingReview = reviews.find((rv) => rv.reviewerId === r.id);
              return (
                <label key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-base">
                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      type="checkbox"
                      className="shrink-0"
                      checked={selectedReviewers.includes(r.id) || !!existingReview}
                      disabled={!!existingReview}
                      onChange={() => toggleReviewer(r.id)}
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium">{r.firstName} {r.lastName}</div>
                      <div className="truncate text-sm text-muted-foreground">{r.email} · {r.expertise?.join(", ")}</div>
                    </div>
                  </div>
                  {existingReview && <div className="shrink-0"><ReviewStatusBadge status={existingReview.status} /></div>}
                </label>
              );
            })}
          </div>
          <Button onClick={handleAssign} disabled={selectedReviewers.length === 0}>
            <UserPlus className="h-4 w-4" /> Assign Reviewer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
