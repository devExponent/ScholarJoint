/**
 * SERVICE LAYER
 * ---------------------------------------------------------------
 * Every function here simulates a network call (delay + Promise).
 * Components never touch mock data directly - they call these functions.
 *
 * WHEN THE REAL BACKEND IS READY:
 * Replace the body of each function with a real `fetch(...)` call to
 * your API. Keep the function signature (name, params, return shape)
 * identical and nothing in the rest of the app needs to change.
 *
 * Example of what a "real" version looks like, left here as a template:
 *
 *   export async function getSubmissions(): Promise<Submission[]> {
 *     const res = await fetch(`${API_BASE_URL}/submissions`, {
 *       headers: { Authorization: `Bearer ${getToken()}` },
 *     });
 *     if (!res.ok) throw new Error("Failed to fetch submissions");
 *     return res.json();
 *   }
 * ---------------------------------------------------------------
 */

import type {
  User,
  Submission,
  Review,
  ConferenceSettings,
  Payment,
  NotificationItem,
  SubmissionStatus,
} from "@/types";
import {
  users as seedUsers,
  submissions as seedSubmissions,
  reviews as seedReviews,
  conferences as seedConferences,
  payments as seedPayments,
  notifications as seedNotifications,
} from "@/data/mockDb";

// Simulated "database" — persisted to localStorage so changes in one browser
// tab (e.g. Author submits a paper) are visible in another tab (e.g. Admin
// reviewing submissions) without a real backend. Cleared via clearMockData().
// NOTE: bump the version suffix (v1 -> v2 -> ...) whenever the shape of
// MockDb changes, so browsers with old cached data fall back to the fresh
// seed instead of crashing on a shape mismatch.
const STORAGE_KEY = "scholarjoint_mock_db_v2";

type MockDb = {
  users: User[];
  submissions: Submission[];
  reviews: Review[];
  conferences: ConferenceSettings[];
  payments: Payment[];
  notifications: NotificationItem[];
};

function seedDb(): MockDb {
  return {
    users: [...seedUsers],
    submissions: [...seedSubmissions],
    reviews: [...seedReviews],
    conferences: seedConferences.map((c) => ({ ...c })),
    payments: [...seedPayments],
    notifications: [...seedNotifications],
  };
}

function loadDb(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    // localStorage unavailable or corrupted data - fall back to seed
  }
  return seedDb();
}

let db: MockDb = loadDb();

// Call at the START of every exported function so this tab picks up
// changes another tab may have written since our last read.
function sync() {
  db = loadDb();
}

// Call at the END of every function that mutates data so other tabs
// can pick up the change on their next call.
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // storage full or unavailable - mutation still works for this tab only
  }
}

// Wipes all mock data back to the original seed. Handy during testing -
// run `window.__resetScholarjointMockData()` in the browser console.
export function resetMockData() {
  db = seedDb();
  persist();
}
if (typeof window !== "undefined") {
  (window as unknown as { __resetScholarjointMockData: () => void }).__resetScholarjointMockData = resetMockData;
}

// Simulated network latency so loading states are visible and realistic
function delay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- AUTH ----------
export async function login(email: string, _password: string): Promise<User> {
  sync();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("Invalid email or password.");
  return delay(user, 500);
}

export async function register(payload: Partial<User> & { email: string }): Promise<User> {
  sync();
  const exists = db.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) throw new Error("An account with this email already exists.");
  const newUser: User = {
    id: uid("u"),
    firstName: payload.firstName ?? "",
    lastName: payload.lastName ?? "",
    email: payload.email,
    role: payload.role ?? "author",
    institution: payload.institution ?? "",
    department: payload.department ?? "",
    country: payload.country ?? "",
    orcid: payload.orcid,
    phone: payload.phone,
    status: "active", // mock: skip email verification step
  };
  db.users.push(newUser);
  persist();
  return delay(newUser, 600);
}

// ---------- SUBMISSIONS ----------
export async function getSubmissions(filter?: { ownerId?: string; reviewerId?: string }): Promise<Submission[]> {
  sync();
  let result = db.submissions;
  if (filter?.ownerId) result = result.filter((s) => s.ownerId === filter.ownerId);
  if (filter?.reviewerId) result = result.filter((s) => s.reviewerIds.includes(filter.reviewerId!));
  return delay(result, 400);
}

export async function getSubmissionById(id: string): Promise<Submission | undefined> {
  sync();
  return delay(db.submissions.find((s) => s.id === id), 300);
}

export async function createSubmission(payload: Omit<Submission, "id" | "submittedAt" | "updatedAt">): Promise<Submission> {
  sync();
  const now = new Date().toISOString();
  const newSubmission: Submission = {
    ...payload,
    id: `#${1000 + db.submissions.length + Math.floor(Math.random() * 100)}`,
    submittedAt: now,
    updatedAt: now,
  };
  db.submissions.unshift(newSubmission);
  persist();
  return delay(newSubmission, 600);
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<Submission> {
  sync();
  const sub = db.submissions.find((s) => s.id === id);
  if (!sub) throw new Error("Submission not found");
  sub.status = status;
  sub.updatedAt = new Date().toISOString();
  persist();
  return delay(sub, 400);
}

export async function assignReviewers(submissionId: string, reviewerIds: string[]): Promise<Submission> {
  sync();
  const sub = db.submissions.find((s) => s.id === submissionId);
  if (!sub) throw new Error("Submission not found");
  const conference = db.conferences.find((c) => c.id === sub.conferenceId);
  sub.reviewerIds = Array.from(new Set([...sub.reviewerIds, ...reviewerIds]));
  reviewerIds.forEach((reviewerId) => {
    if (!db.reviews.some((r) => r.submissionId === submissionId && r.reviewerId === reviewerId)) {
      db.reviews.push({
        id: uid("rv"),
        submissionId,
        reviewerId,
        deadline: conference?.reviewDeadline ?? new Date().toISOString(),
        status: "not_started",
      });
    }
  });
  persist();
  return delay(sub, 500);
}

// ---------- REVIEWS ----------
export async function getReviews(filter?: { reviewerId?: string; submissionId?: string }): Promise<Review[]> {
  sync();
  let result = db.reviews;
  if (filter?.reviewerId) result = result.filter((r) => r.reviewerId === filter.reviewerId);
  if (filter?.submissionId) result = result.filter((r) => r.submissionId === filter.submissionId);
  return delay(result, 400);
}

export async function submitReview(reviewId: string, payload: Partial<Review>): Promise<Review> {
  sync();
  const review = db.reviews.find((r) => r.id === reviewId);
  if (!review) throw new Error("Review not found");
  Object.assign(review, payload);
  if (payload.status === "submitted") {
    review.submittedAt = new Date().toISOString();
  }
  persist();
  return delay(review, 500);
}

// ---------- USERS / REVIEWERS ----------
export async function getUsers(role?: User["role"]): Promise<User[]> {
  sync();
  const result = role ? db.users.filter((u) => u.role === role) : db.users;
  return delay(result, 300);
}

export async function inviteReviewer(payload: Partial<User> & { email: string }): Promise<User> {
  sync();
  const newReviewer: User = {
    id: uid("u"),
    firstName: payload.firstName ?? "",
    lastName: payload.lastName ?? "",
    email: payload.email,
    role: "reviewer",
    institution: payload.institution ?? "",
    department: payload.department ?? "",
    country: payload.country ?? "",
    expertise: payload.expertise ?? [],
    status: "active",
  };
  db.users.push(newReviewer);
  persist();
  return delay(newReviewer, 600);
}

// ---------- CONFERENCES ----------
export async function getConferences(): Promise<ConferenceSettings[]> {
  sync();
  return delay(db.conferences, 300);
}

// Conferences an Author can currently submit an abstract to: abstract
// deadline hasn't passed yet. Sorted soonest-deadline-first.
export async function getOpenConferences(): Promise<ConferenceSettings[]> {
  sync();
  const now = new Date();
  const open = db.conferences
    .filter((c) => new Date(c.abstractDeadline) > now)
    .sort((a, b) => new Date(a.abstractDeadline).getTime() - new Date(b.abstractDeadline).getTime());
  return delay(open, 300);
}

export async function getConferenceById(id: string): Promise<ConferenceSettings | undefined> {
  sync();
  return delay(db.conferences.find((c) => c.id === id), 300);
}

export async function createConference(payload: Omit<ConferenceSettings, "id">): Promise<ConferenceSettings> {
  sync();
  const newConference: ConferenceSettings = { ...payload, id: uid("conf") };
  db.conferences.push(newConference);
  persist();
  return delay(newConference, 500);
}

export async function updateConferenceSettings(id: string, payload: Omit<ConferenceSettings, "id">): Promise<ConferenceSettings> {
  sync();
  const index = db.conferences.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Conference not found");
  const updated: ConferenceSettings = { ...payload, id };
  db.conferences[index] = updated;
  persist();
  return delay(updated, 500);
}

// ---------- PAYMENTS ----------
export async function getPayments(): Promise<Payment[]> {
  sync();
  return delay(db.payments, 300);
}

export async function markPaymentPaid(paymentId: string): Promise<Payment> {
  sync();
  const payment = db.payments.find((p) => p.id === paymentId);
  if (!payment) throw new Error("Payment not found");
  payment.status = "paid";
  payment.paidAt = new Date().toISOString();
  persist();
  return delay(payment, 400);
}

// ---------- NOTIFICATIONS ----------
export async function getNotifications(): Promise<NotificationItem[]> {
  sync();
  return delay(db.notifications, 200);
}
