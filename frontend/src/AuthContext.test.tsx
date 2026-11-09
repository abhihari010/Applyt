import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "./api";
import { AuthProvider } from "./AuthContext";
import { useAuth } from "./hooks/useAuth";
import { testUser } from "./test/authValue";

vi.mock("./api", () => ({
  authApi: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    register: vi.fn(),
    verifyEmail: vi.fn(),
  },
}));

const api = vi.mocked(authApi);
const respond = (data: unknown) => Promise.resolve({ data }) as never;

function Probe() {
  const { user, isLoading } = useAuth();
  return <p>{isLoading ? "loading" : (user?.email ?? "signed out")}</p>;
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

const useAuthInProvider = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("is signed out without a stored token and doesn't call the API", async () => {
    renderProvider();
    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(api.getCurrentUser).not.toHaveBeenCalled();
  });

  it("restores the session from a stored token", async () => {
    localStorage.setItem("app_token", "abc");
    api.getCurrentUser.mockReturnValue(respond(testUser));
    renderProvider();
    expect(await screen.findByText(testUser.email)).toBeInTheDocument();
  });

  it("discards a stored token the server rejects", async () => {
    localStorage.setItem("app_token", "expired");
    api.getCurrentUser.mockRejectedValue(new Error("401"));
    renderProvider();
    expect(await screen.findByText("signed out")).toBeInTheDocument();
    expect(localStorage.getItem("app_token")).toBeNull();
  });

  it("login stores the token and sets the user", async () => {
    api.login.mockReturnValue(respond({ token: "new", user: testUser }));
    api.getCurrentUser.mockReturnValue(respond(testUser));
    const { result } = useAuthInProvider();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.login(testUser.email, "secret"));

    expect(api.login).toHaveBeenCalledWith({ email: testUser.email, password: "secret" });
    expect(localStorage.getItem("app_token")).toBe("new");
    expect(result.current.user).toEqual(testUser);
  });

  it("a failed login stores nothing and passes the error on", async () => {
    api.login.mockRejectedValue(new Error("bad credentials"));
    const { result } = useAuthInProvider();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.login(testUser.email, "wrong")).rejects.toThrow("bad credentials");

    expect(localStorage.getItem("app_token")).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it("logout clears the token and the user", async () => {
    localStorage.setItem("app_token", "abc");
    api.getCurrentUser.mockReturnValue(respond(testUser));
    const { result } = useAuthInProvider();
    await waitFor(() => expect(result.current.user).toEqual(testUser));

    act(() => result.current.logout());

    expect(localStorage.getItem("app_token")).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it("registering doesn't sign the user in", async () => {
    api.register.mockReturnValue(respond({ message: "ok" }));
    const { result } = useAuthInProvider();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.register("Test User", testUser.email, "secret"));

    expect(localStorage.getItem("app_token")).toBeNull();
    expect(result.current.user).toBeNull();
  });
});

describe("useAuth", () => {
  it("throws outside an AuthProvider", () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow("useAuth must be used within AuthProvider");
    logged.mockRestore();
  });
});
