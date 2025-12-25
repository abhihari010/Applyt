import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export default function RequireAuth({
  children,
}: {
  children: React.ReactElement;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
