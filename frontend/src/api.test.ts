import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";

let sent: InternalAxiosRequestConfig | undefined;

function respondWith(status: number) {
  api.defaults.adapter = async (config) => {
    sent = config;
    if (status >= 400) {
      throw new AxiosError("failed", "ERR", config, null, {
        status,
        statusText: "",
        data: {},
        headers: {},
        config,
      });
    }
    return { status, statusText: "OK", data: {}, headers: {}, config };
  };
}

const onPage = (pathname: string) => {
  const location = { pathname, href: pathname };
  vi.stubGlobal("location", location);
  return location;
};

describe("api client", () => {
  beforeEach(() => {
    sent = undefined;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the stored token as a Bearer header", async () => {
    localStorage.setItem("app_token", "abc");
    respondWith(200);
    await api.get("/apps");
    expect(sent?.headers.Authorization).toBe("Bearer abc");
  });

  it("sends no Authorization header when signed out", async () => {
    respondWith(200);
    await api.get("/apps");
    expect(sent?.headers.Authorization).toBeUndefined();
  });

  it("clears the token and goes to login on a 401", async () => {
    const location = onPage("/dashboard");
    localStorage.setItem("app_token", "expired");
    respondWith(401);

    await expect(api.get("/apps")).rejects.toThrow();

    expect(localStorage.getItem("app_token")).toBeNull();
    expect(location.href).toBe("/login");
  });

  it.each(["/login", "/signup"])("doesn't redirect a failed sign-in on %s", async (path) => {
    const location = onPage(path);
    respondWith(401);

    await expect(api.post("/auth/login")).rejects.toThrow();

    expect(location.href).toBe(path);
  });

  it("keeps the token on other errors", async () => {
    const location = onPage("/dashboard");
    localStorage.setItem("app_token", "abc");
    respondWith(500);

    await expect(api.get("/apps")).rejects.toThrow();

    expect(localStorage.getItem("app_token")).toBe("abc");
    expect(location.href).toBe("/dashboard");
  });
});
