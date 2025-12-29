import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import NewApplication from "./pages/NewApplication";
import Board from "./pages/Board";
import Analytics from "./pages/Analytics";
import ApplicationDetail from "./pages/ApplicationDetail";
import RequireAuth from "./RequireAuth";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
