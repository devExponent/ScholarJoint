import * as React from "react";
import { Link } from "react-router-dom";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/shared/StatCard";
import { ReviewStatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Review, Submission } from "@/types";
import { ClipboardList, Clock, CheckSquare, AlertTriangle } from "lucide-react";

export function ReviewerDashboard() {
  const { user } = useAuth();
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [submissionsById, setSubmissionsById] = React.useState<Record<string, Submission>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    api.getReviews({ reviewerId: user.id }).then(async (revs) => {
      setReviews(revs);
      const subs = await api.getSubmissions();
      const map: Record<string, Submission> = {};
      subs.forEach((s) => { map[s.id] = s; });
      setSubmissionsById(map);
      setIsLoading(false);
    });
  }, [user]);

  const pending = reviews.filter((r) => r.status !== "submitted").length;
  const completed = reviews.filter((r) => r.status === "submitted").length;
  const now = new Date();
  const overdue = reviews.filter((r) => r.status !== "submitted" && new Date(r.deadline) < now).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">Welcome, {user?.firstName}</h1>
        <p className="text-base text-muted-foreground">Here's your review activity.</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <StatCard label="Total Assigned" value={isLoading ? "-" : reviews.length} icon={ClipboardList} />
        <StatCard label="Pending Review" value={isLoading ? "-" : pending} icon={Clock} accent />
        <StatCard label="Completed" value={isLoading ? "-" : completed} icon={CheckSquare} />
        <StatCard label="Overdue" value={isLoading ? "-" : overdue} icon={AlertTriangle} accent />
      </div>

      <Card>
        <CardHeader><CardTitle>Assigned Papers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {reviews.map((r) => {
            const sub = submissionsById[r.submissionId];
            if (!sub) return null;
            return (
              <Link key={r.id} to="/reviewer/assigned" className="flex items-center gap-3 justify-between rounded-md border border-border p-3 text-base transition-colors hover:bg-secondary/40">
                <div className="min-w-0">
                  <div className="truncate font-medium">{sub.title}</div>
                  <div className="truncate text-sm text-muted-foreground">{sub.id} · Deadline {new Date(r.deadline).toLocaleDateString()}</div>
                </div>
                <div className="shrink-0"><ReviewStatusBadge status={r.status} /></div>
              </Link>
            );
          })}
          {!isLoading && reviews.length === 0 && (
            <p className="py-6 text-center text-base text-muted-foreground">No papers assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
