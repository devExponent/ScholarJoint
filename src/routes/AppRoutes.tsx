import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { ProfilePage } from "@/pages/shared/ProfilePage";

import { AuthorDashboard } from "@/pages/author/AuthorDashboard";
import { NewSubmissionPage } from "@/pages/author/NewSubmissionPage";
import { MySubmissionsPage } from "@/pages/author/MySubmissionsPage";
import { SubmissionDetailsPage } from "@/pages/author/SubmissionDetailsPage";
import { AuthorPaymentsPage } from "@/pages/author/AuthorPaymentsPage";

import { ReviewerDashboard } from "@/pages/reviewer/ReviewerDashboard";
import { AssignedPapersPage } from "@/pages/reviewer/AssignedPapersPage";
import { ReviewFormPage } from "@/pages/reviewer/ReviewFormPage";
import { CompletedReviewsPage } from "@/pages/reviewer/CompletedReviewsPage";

import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { ManageSubmissionsPage } from "@/pages/admin/ManageSubmissionsPage";
import { AdminSubmissionDetailsPage } from "@/pages/admin/AdminSubmissionDetailsPage";
import { ManageReviewersPage } from "@/pages/admin/ManageReviewersPage";
import { ManageConferencePage } from "@/pages/admin/ManageConferencePage";
import { ConferenceEditorPage } from "@/pages/admin/ConferenceEditorPage";
import { AdminPaymentsPage } from "@/pages/admin/AdminPaymentsPage";

function RootRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Author routes - accessible by author, reviewer, admin (role hierarchy) */}
          <Route
            path="/author"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <AuthorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/submit"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <NewSubmissionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/submissions"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <MySubmissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/submissions/:id"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <SubmissionDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/payments"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <AuthorPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/author/profile"
            element={
              <ProtectedRoute allowedRoles={["author"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Reviewer routes - accessible by reviewer, admin */}
          <Route
            path="/reviewer"
            element={
              <ProtectedRoute allowedRoles={["reviewer"]}>
                <ReviewerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviewer/assigned"
            element={
              <ProtectedRoute allowedRoles={["reviewer"]}>
                <AssignedPapersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviewer/review/:reviewId"
            element={
              <ProtectedRoute allowedRoles={["reviewer"]}>
                <ReviewFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviewer/completed"
            element={
              <ProtectedRoute allowedRoles={["reviewer"]}>
                <CompletedReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviewer/profile"
            element={
              <ProtectedRoute allowedRoles={["reviewer"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/conference"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageConferencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/conference/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ConferenceEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/conference/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ConferenceEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageSubmissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSubmissionDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviewers"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageReviewersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
