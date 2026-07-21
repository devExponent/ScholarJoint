import * as React from "react";
import { useParams, Link } from "react-router-dom";
import * as api from "@/services/api";
import { SubmissionStatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Submission } from "@/types";
import { ArrowLeft, Download, Star, FileText } from "lucide-react";

export function SubmissionDetailsPage() {
  const { id } = useParams();
  const [submission, setSubmission] = React.useState<Submission | null | undefined>(undefined);

  React.useEffect(() => {
    if (!id) return;
    api.getSubmissionById(`#${id}`).then(setSubmission);
  }, [id]);

  if (submission === undefined) return <p className="text-base text-muted-foreground">Loading...</p>;
  if (submission === null || submission === undefined) return <p className="text-base text-muted-foreground">Submission not found.</p>;

  const canSubmitFullPaper = submission.status === "abstract_accepted" && submission.type === "abstract";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/author/submissions" className="inline-flex items-center gap-1 text-base text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to My Submissions
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm text-muted-foreground">{submission.id}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold break-words">{submission.title}</h1>
        </div>
        <div className="shrink-0"><SubmissionStatusBadge status={submission.status} /></div>
      </div>

      <Card>
        <CardHeader><CardTitle>Authors</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {submission.authors.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3 text-base">
              {a.isCorresponding && <Star className="h-3.5 w-3.5 shrink-0 text-accent" fill="currentColor" />}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{a.displayName}</div>
                <div className="truncate text-sm text-muted-foreground">{a.affiliation.institution}, {a.affiliation.department}</div>
              </div>
              {a.isCorresponding && <Badge variant="accent" className="shrink-0 sm:ml-auto">Corresponding</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Track & Keywords</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-base"><span className="text-muted-foreground">Track:</span> {submission.track}</p>
          <div className="flex flex-wrap gap-1.5">
            {submission.keywords.map((k) => <Badge key={k} variant="secondary">{k}</Badge>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Abstract</CardTitle></CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed text-muted-foreground">{submission.abstractText}</p>
        </CardContent>
      </Card>

      {submission.files.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Files</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {submission.files.map((f) => (
              <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-base">
                <span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-muted-foreground" /> <span className="truncate">{f.fileName}</span></span>
                <Button variant="outline" size="sm" className="shrink-0"><Download className="h-3.5 w-3.5" /> Download</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        {canSubmitFullPaper && (
          <Button asChild><Link to={`/author/submissions/${submission.id.replace("#", "")}/full-paper`}>Submit Full Paper</Link></Button>
        )}
      </div>
    </div>
  );
}
