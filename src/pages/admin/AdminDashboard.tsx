import * as React from "react";
import * as api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Submission, NotificationItem, User } from "@/types";
import { FileText, CheckCircle2, Users, CreditCard } from "lucide-react";

export function AdminDashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [reviewers, setReviewers] = React.useState<User[]>([]);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      api.getSubmissions(),
      api.getUsers("reviewer"),
      api.getNotifications(),
    ]).then(([subs, revs, notifs]) => {
      setSubmissions(subs);
      setReviewers(revs);
      setNotifications(notifs);
      setIsLoading(false);
    });
  }, []);

  const abstracts = submissions.filter((s) => s.type === "abstract").length;
  const fullPapers = submissions.filter((s) => s.type === "full_paper").length;
  const acceptedRejected = submissions.filter(
    (s) => s.status === "accepted" || s.status === "rejected",
  ).length;
  const pendingPayments = submissions.filter(
    (s) => s.paymentStatus === "unpaid" || s.paymentStatus === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold">
        Welcome, {user?.firstName}
      </h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <StatCard
          label="Abstracts Submitted"
          value={isLoading ? "-" : abstracts}
          icon={FileText}
        />
        <StatCard
          label="Full Papers Submitted"
          value={isLoading ? "-" : fullPapers}
          icon={FileText}
          accent
        />
        <StatCard
          label="Accepted/Rejected"
          value={isLoading ? "-" : acceptedRejected}
          icon={CheckCircle2}
        />
        <StatCard
          label="Reviewers Invited"
          value={isLoading ? "-" : reviewers.length}
          icon={Users}
        />
        <StatCard
          label="Pending Payments"
          value={isLoading ? "-" : pendingPayments}
          icon={CreditCard}
          accent
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-base"
            >
              <span
                className={cn(
                  "min-w-0",
                  n.read ? "text-muted-foreground" : "font-medium",
                )}
              >
                {n.message}
              </span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
