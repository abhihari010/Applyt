import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "../api";
import ForgotPassword from "./ForgotPassword";

vi.mock("../components/Nav", () => ({ default: () => null }));
vi.mock("../api", () => ({ authApi: { forgotPassword: vi.fn() } }));

const forgotPassword = vi.mocked(authApi.forgotPassword);

async function submit(email: string) {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );
  await userEvent.type(screen.getByLabelText("Email address"), email);
  await userEvent.click(screen.getByRole("button", { name: "Send reset link" }));
}

describe("ForgotPassword", () => {
  beforeEach(() => {
    forgotPassword.mockReset();
  });

  it("sends the email and shows a confirmation", async () => {
    forgotPassword.mockResolvedValue({} as never);
    await submit("test@example.com");
    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(forgotPassword).toHaveBeenCalledWith({ email: "test@example.com" });
  });

  it("shows the server's error and keeps the form", async () => {
    forgotPassword.mockRejectedValue({ response: { data: { message: "Too many requests" } } });
    await submit("test@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests");
    expect(screen.queryByText("Check your email")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveValue("test@example.com");
  });

  it("has a fallback error message", async () => {
    forgotPassword.mockRejectedValue(new Error("Network Error"));
    await submit("test@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to send reset email");
  });
});
