import React, { createContext, useState, useEffect, ReactNode } from "react";
import { authApi, session, User } from "./api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  oauthLogin: (code: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(session.exists());

  useEffect(() => {
    // Remove the token older versions kept in localStorage, where any XSS could read it.
    localStorage.removeItem("app_token");

    if (!session.exists()) {
      return;
    }
    authApi
      .getCurrentUser()
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const startSession = (newUser: User) => {
    session.mark();
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    startSession(response.data.user);
  };

  const oauthLogin = async (code: string) => {
    const response = await authApi.exchangeOAuthCode(code);
    startSession(response.data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    // Register returns only a message, no session yet
    await authApi.register({ name, email, password });
    // User will be redirected to verify email page
  };

  const logout = () => {
    session.clear();
    setUser(null);
    // Update the UI right away. The server call revokes the session and clears its cookies.
    authApi.logout().catch(() => undefined);
  };

  const verifyEmail = async (emailToken: string) => {
    await authApi.verifyEmail(emailToken);
    // Email verified, user can now login
  };

  const refreshUser = async () => {
    if (session.exists()) {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        oauthLogin,
        register,
        verifyEmail,
        logout,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
