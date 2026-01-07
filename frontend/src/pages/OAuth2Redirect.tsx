// OAuth2 redirect handler page
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function OAuth2Redirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token and redirect to dashboard
      oauthLogin(token)
        .then(() => {
          navigate("/dashboard");
        })
        .catch(() => {
          navigate("/login?error=oauth_failed");
        });
    } else {
      // OAuth2 failed, redirect to login with error
      navigate("/login?error=oauth_failed");
    }
  }, [searchParams, navigate, oauthLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
