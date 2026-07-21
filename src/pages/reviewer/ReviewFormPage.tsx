import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Review, Submission, ReviewRecommendation } from "@/types";
import { ArrowLeft } from "lucide-react";

const RECOMMENDATIONS: { value: ReviewRecommendation; label: string }[] = [
  { value: "accept", label: "Accept" },
  { value: "minor_revision", label: "Minor Revision" },
  { value: "major_revision", label: "Major Revision" },
  { value: "reject", label: "Reject" },
];

const RATING_CRITERIA = [
  { key: "originality", label: "Originality" },
  { key: "clarity", label: "Clarity" },
  { key: "contribution", label: "Contribution to field" },
  { key: "technicalQuality", label: "Technical quality" },
] as const;

export function ReviewFormPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = React.useState<Review | null>(null);
  const [submission, setSubmission] = React.useState<Submission | null>(null);
  const [recommendation, setRecommendation] = React.useState<ReviewRecommendation | "">("");
  const [ratings, setRatings] = React.useState({ originality: 3, clarity: 3, contribution: 3, technicalQuality: 3 });
  const [commentsToAuthor, setCommentsToAuthor] = React.useState("");
  const [confidentialComments, setConfidentialComments] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (!reviewId) return;
    api.getReviews().then(async (all) => {
      const r = all.find((x) => x.id === reviewId);
      if (!r) return;
      setReview(r);
      const sub = await api.getSubmissionById(r.submissionId);
      setSubmission(sub ?? null);
    });
  }, [reviewId]);

  const handleSave = async (status: "in_progress" | "submitted") => {
    if (!review) return;
    if (status === "submitted" && (!recommendation || !commentsToAuthor.trim())) {
      setError("Overall recommendation and comments to author are required.");
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await api.submitReview(review.id, {
        status,
        recommendation: recommendation || undefined,
        ratings,
        commentsToAuthor,
        confidentialComments,
      });
      navigate("/reviewer/assigned", { state: { saved: status } });
    } finally {
      setIsSaving(false);
    }
  };

  if (!review || !submission) return <p className="text-base text-muted-foreground">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div>
        <p className="font-mono text-sm text-muted-foreground">{submission.id}</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">{submission.title}</h1>
        <p className="text-base text-muted-foreground">Deadline: {new Date(review.deadline).toLocaleDateString()}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Overall Recommendation</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RECOMMENDATIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRecommendation(opt.value)}
              className={`rounded-md border px-3 py-2 text-base font-medium transition-colors ${
                recommendation === opt.value ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-secondary/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ratings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {RATING_CRITERIA.map((c) => (
            <div key={c.key} className="flex flex-wrap items-center justify-between gap-3">
              <Label className="min-w-[140px]">{c.label}</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRatings((r) => ({ ...r, [c.key]: n }))}
                    className={`h-9 w-9 shrink-0 rounded-md border text-base font-medium transition-colors ${
                      ratings[c.key] >= n ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted-foreground hover:bg-secondary/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Comments to Author</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={5} value={commentsToAuthor} onChange={(e) => setCommentsToAuthor(e.target.value)} placeholder="Provide constructive feedback for the authors." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Confidential Comments to Admin</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={3} value={confidentialComments} onChange={(e) => setConfidentialComments(e.target.value)} placeholder="Only visible to Admin." />
        </CardContent>
        <CardFooter className="justify-between border-t border-border pt-4">
          {error && <p className="text-base text-destructive">{error}</p>}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={() => handleSave("in_progress")} disabled={isSaving}>Save Draft</Button>
            <Button type="button" onClick={() => handleSave("submitted")} disabled={isSaving}>Submit Review</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
