import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import RequireAuth from "./RequireAuth";

const Homepage = lazy(() => import("./pages/Homepage"));
const Features = lazy(() => import("./pages/Features"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const OAuth2Redirect = lazy(() => import("./pages/OAuth2Redirect"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Applications = lazy(() => import("./pages/Applications"));
const NewApplication = lazy(() => import("./pages/NewApplication"));
const ApplicationDetail = lazy(() => import("./pages/ApplicationDetail"));
const Board = lazy(() => import("./pages/Board"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const OpenJobs = lazy(() => import("./pages/OpenJobs"));
const ImportApplications = lazy(() => import("./pages/ImportApplications"));

function RouteLoader() {
  return (
    <div className="app-page flex min-h-[100dvh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white/80 p-5 shadow-soft backdrop-blur">
        <div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-neutral-200" />
        <div className="mb-3 h-8 w-48 max-w-full animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-3 w-full animate-pulse rounded-full bg-neutral-200" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth2/redirect" element={<OAuth2Redirect />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
