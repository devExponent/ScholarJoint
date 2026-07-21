import * as React from "react";
import { Link } from "react-router-dom";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/shared/StatCard";
import { SubmissionStatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Submission, NotificationItem } from "@/types";
import { FileText, CheckCircle2, XCircle, CreditCard, Plus } from "lucide-react";

export function AuthorDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    Promise.all([api.getSubmissions({ ownerId: user.id }), api.getNotifications()]).then(
      ([subs, notifs]) => {
        setSubmissions(subs);
        setNotifications(notifs);
        setIsLoading(false);
      }
    );
  }, [user]);

  const abstracts = submissions.filter((s) => s.type === "abstract").length;
  const fullPapers = submissions.filter((s) => s.type === "full_paper").length;
  const accepted = submissions.filter((s) => s.status === "accepted" || s.status === "abstract_accepted").length;
  const unpaid = submissions.filter((s) => s.paymentStatus === "unpaid").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">Welcome, {user?.firstName}</h1>
          <p className="text-base text-muted-foreground">Here's an overview of your submissions.</p>
        </div>
        <Button asChild>
          <Link to="/author/submit"><Plus className="h-4 w-4" /> New Submission</Link>
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <StatCard label="Abstracts Submitted" value={isLoading ? "-" : abstracts} icon={FileText} />
        <StatCard label="Full Papers Submitted" value={isLoading ? "-" : fullPapers} icon={CheckCircle2} accent />
        <StatCard label="Accepted" value={isLoading ? "-" : accepted} icon={CheckCircle2} />
        <StatCard label="Unpaid Fees" value={isLoading ? "-" : unpaid} icon={CreditCard} accent />
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        <Card className="2xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {submissions.slice(0, 5).map((s) => (
              <Link
                key={s.id}
                to={`/author/submissions/${s.id.replace("#", "")}`}
                className="flex items-center gap-3 justify-between rounded-md border border-border p-3 text-base transition-colors hover:bg-secondary/40"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{s.title}</div>
                  <div className="truncate text-sm text-muted-foreground">{s.id} · {s.track}</div>
                </div>
                <div className="shrink-0"><SubmissionStatusBadge status={s.status} /></div>
              </Link>
            ))}
            {!isLoading && submissions.length === 0 && (
              <p className="py-6 text-center text-base text-muted-foreground">
                No submissions yet. <Link to="/author/submit" className="text-primary hover:underline">Submit your first abstract.</Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-2 text-base">
                {n.read ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
                <span className={n.read ? "text-muted-foreground" : ""}>{n.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
