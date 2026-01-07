import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuth2Redirect from "./pages/OAuth2Redirect";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import NewApplication from "./pages/NewApplication";
import Board from "./pages/Board";
import Analytics from "./pages/Analytics";
import ApplicationDetail from "./pages/ApplicationDetail";
import RequireAuth from "./RequireAuth";
import Settings from "./pages/Settings";
import OpenJobs from "./pages/OpenJobs";
import ImportApplications from "./pages/ImportApplications";
import VerifyEmail from "./pages/VerifyEmail";
import Homepage from "./pages/Homepage";
import Features from "./pages/Features";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Navigate to="/dashboard" replace />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/applications"
            element={
              <RequireAuth>
                <Applications />
              </RequireAuth>
            }
          />
          <Route
            path="/applications/new"
            element={
              <RequireAuth>
                <NewApplication />
              </RequireAuth>
            }
          />
          <Route
            path="/applications/:id"
            element={
              <RequireAuth>
                <ApplicationDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/board"
            element={
              <RequireAuth>
                <Board />
              </RequireAuth>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireAuth>
                <Analytics />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/open-jobs"
            element={
              <RequireAuth>
                <OpenJobs />
              </RequireAuth>
            }
          />
          <Route
            path="/applications/import"
            element={
              <RequireAuth>
                <ImportApplications />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
