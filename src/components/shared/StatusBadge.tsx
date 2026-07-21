import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus, ReviewStatus } from "@/types";

const submissionStatusMap: Record<SubmissionStatus, { label: string; variant: "default" | "secondary" | "accent" | "success" | "warning" | "destructive" | "outline" }> = {
  abstract_submitted: { label: "Pending", variant: "secondary" },
  abstract_accepted: { label: "Abstract Accepted", variant: "success" },
  abstract_rejected: { label: "Abstract Rejected", variant: "destructive" },
  revision_requested: { label: "Revision Requested", variant: "warning" },
  fullpaper_submitted: { label: "Full Paper Submitted", variant: "accent" },
  under_review: { label: "Under Review", variant: "accent" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  awaiting_payment: { label: "Awaiting Payment", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
};

const reviewStatusMap: Record<ReviewStatus, { label: string; variant: "default" | "secondary" | "accent" | "success" | "warning" | "destructive" | "outline" }> = {
  not_started: { label: "Not Started", variant: "secondary" },
  in_progress: { label: "In Progress", variant: "warning" },
  submitted: { label: "Submitted", variant: "success" },
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const cfg = submissionStatusMap[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const cfg = reviewStatusMap[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
