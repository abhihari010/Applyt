import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { authApi, User } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("app_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi
        .getCurrentUser()
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("app_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      setUser(null);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem("app_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password });
    const { token: newToken, user: newUser } = response.data;
    localStorage.setItem("app_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("app_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
