export type Role = "admin" | "reviewer" | "author";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  institution: string;
  department: string;
  country: string;
  orcid?: string;
  phone?: string;
  expertise?: string[]; // reviewers
  status: "active" | "inactive" | "pending_verification";
}

export interface Affiliation {
  institution: string;
  department: string;
  city?: string;
  country: string;
}

export interface CoAuthor {
  id: string;
  givenName: string;
  familyName: string;
  displayName: string;
  title?: string;
  affiliation: Affiliation;
  email: string;
  isCorresponding?: boolean;
}

export type SubmissionStatus =
  | "abstract_submitted"
  | "abstract_accepted"
  | "abstract_rejected"
  | "revision_requested"
  | "fullpaper_submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "awaiting_payment"
  | "paid";

export type SubmissionType = "abstract" | "full_paper";

export interface SubmissionFile {
  id: string;
  fileName: string;
  uploadedAt: string;
  sizeKb: number;
}

export interface Submission {
  id: string; // e.g. "#1012"
  conferenceId: string;
  title: string;
  track: string;
  type: SubmissionType;
  status: SubmissionStatus;
  keywords: string[];
  abstractText: string;
  authors: CoAuthor[]; // includes primary author first
  correspondingEmail: string;
  files: SubmissionFile[];
  submittedAt: string;
  updatedAt: string;
  reviewerIds: string[];
  ownerId: string; // maps to User.id of submitter
  paymentStatus: "unpaid" | "pending" | "paid" | "not_applicable";
  feeAmount?: number;
}

export type ReviewRecommendation = "accept" | "minor_revision" | "major_revision" | "reject";
export type ReviewStatus = "not_started" | "in_progress" | "submitted";

export interface Review {
  id: string;
  submissionId: string;
  reviewerId: string;
  deadline: string;
  status: ReviewStatus;
  recommendation?: ReviewRecommendation;
  ratings?: {
    originality: number;
    clarity: number;
    contribution: number;
    technicalQuality: number;
  };
  commentsToAuthor?: string;
  confidentialComments?: string;
  submittedAt?: string;
  sharedWithAuthor?: boolean;
}

export interface Track {
  id: string;
  name: string;
  description: string;
}

export interface ConferenceSettings {
  id: string;
  title: string;
  description: string;
  abstractDeadline: string;
  fullPaperDeadline: string;
  reviewDeadline: string;
  cameraReadyDeadline: string;
  regularFee: number;
  earlyBirdFee?: number;
  lateFee?: number;
  tracks: Track[];
  maxAbstractWords: number;
  allowedFileTypes: string[];
  maxFileSizeMb: number;
}

export interface Payment {
  id: string;
  submissionId: string;
  authorName: string;
  amount: number;
  status: "paid" | "unpaid" | "pending";
  transactionId?: string;
  paidAt?: string;
}

export interface NotificationItem {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}
