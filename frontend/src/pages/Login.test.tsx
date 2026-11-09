import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AuthContext } from "../AuthContext";
import { authValue } from "../test/authValue";
import Login from "./Login";

vi.mock("../components/Nav", () => ({ default: () => null }));

function renderLogin(login = vi.fn()) {
  const { container } = render(
    <AuthContext.Provider value={authValue({ login })}>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<p>Dashboard</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  return { login, form: container.querySelector("form")! };
}

async function fillIn(email: string, password: string) {
  await userEvent.type(screen.getByPlaceholderText("you@company.com"), email);
  await userEvent.type(screen.getByPlaceholderText("Enter your password"), password);
}

describe("Login", () => {
  it("requires an email and password before calling the API", () => {
    const { login, form } = renderLogin();
    fireEvent.submit(form);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("rejects a malformed email", async () => {
    const { login, form } = renderLogin();
    await fillIn("not-an-email", "secret");
    fireEvent.submit(form);
    expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("signs in and goes to the dashboard", async () => {
    const { login, form } = renderLogin(vi.fn().mockResolvedValue(undefined));
    await fillIn("test@example.com", "secret");
    fireEvent.submit(form);
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith("test@example.com", "secret");
  });

  it("shows the server's error and stays on the page", async () => {
    const failure = { response: { status: 401, data: { error: "Invalid credentials" } } };
    const { form } = renderLogin(vi.fn().mockRejectedValue(failure));
    await fillIn("test@example.com", "wrong");
    fireEvent.submit(form);
    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("explains rate limiting", async () => {
    const { form } = renderLogin(vi.fn().mockRejectedValue({ response: { status: 429, data: {} } }));
    await fillIn("test@example.com", "secret");
    fireEvent.submit(form);
    expect(
      await screen.findByText("Too many login attempts. Please try again in a few minutes."),
    ).toBeInTheDocument();
  });

  it("has a fallback message when the server is unreachable", async () => {
    const { form } = renderLogin(vi.fn().mockRejectedValue(new Error("Network Error")));
    await fillIn("test@example.com", "secret");
    fireEvent.submit(form);
    expect(await screen.findByText("Invalid credentials. Please try again.")).toBeInTheDocument();
  });
});
