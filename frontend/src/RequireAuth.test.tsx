import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AuthContext } from "./AuthContext";
import RequireAuth from "./RequireAuth";
import { authValue, testUser } from "./test/authValue";

function renderGuarded(overrides = {}) {
  render(
    <AuthContext.Provider value={authValue(overrides)}>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <p>Private page</p>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("RequireAuth", () => {
  it("waits while the session is being checked, without redirecting", () => {
    renderGuarded({ isLoading: true });
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
    expect(screen.queryByText("Private page")).not.toBeInTheDocument();
  });

  it("sends a signed-out visitor to login", () => {
    renderGuarded();
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Private page")).not.toBeInTheDocument();
  });

  it("shows the page to a signed-in user", () => {
    renderGuarded({ user: testUser });
    expect(screen.getByText("Private page")).toBeInTheDocument();
  });
});
