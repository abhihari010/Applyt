import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../api";
import NewApplication from "./NewApplication";

vi.mock("../api", () => ({ default: { post: vi.fn() } }));
vi.mock("../components/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <>{children}</>,
  PageHeader: () => null,
}));

const post = vi.mocked(apiClient.post);

function renderPage() {
  const { container } = render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/applications/new"]}>
        <Routes>
          <Route path="/applications/new" element={<NewApplication />} />
          <Route path="/applications/:id" element={<p>Detail page</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return container.querySelector("form")!;
}

async function fillRequired() {
  await userEvent.type(screen.getByPlaceholderText("Company"), "Acme");
  await userEvent.type(screen.getByPlaceholderText("Role"), "Engineer");
}

describe("NewApplication", () => {
  beforeEach(() => {
    post.mockReset();
  });

  it("offers every status, including Accepted", () => {
    renderPage();
    const options = screen.getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(
      expect.arrayContaining(["Saved", "Applied", "OA", "Interview", "Offer", "Accepted", "Rejected"]),
    );
  });

  it("rejects a company and role that are only spaces", async () => {
    const form = renderPage();
    await userEvent.type(screen.getByPlaceholderText("Company"), "  ");
    await userEvent.type(screen.getByPlaceholderText("Role"), "  ");
    fireEvent.submit(form);
    expect(screen.getByText("Company is required")).toBeInTheDocument();
    expect(screen.getByText("Role is required")).toBeInTheDocument();
    expect(post).not.toHaveBeenCalled();
  });

  it("clears a field's error once the user types in it", async () => {
    const form = renderPage();
    fireEvent.submit(form);
    expect(screen.getByText("Company is required")).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText("Company"), "A");
    expect(screen.queryByText("Company is required")).not.toBeInTheDocument();
  });

  it("creates the application and opens it", async () => {
    post.mockResolvedValue({ data: { id: "42" } });
    const form = renderPage();
    await fillRequired();
    fireEvent.submit(form);
    expect(await screen.findByText("Detail page")).toBeInTheDocument();
    expect(post).toHaveBeenCalledWith(
      "/apps",
      expect.objectContaining({ company: "Acme", role: "Engineer", status: "SAVED", priority: "MEDIUM" }),
    );
  });

  it("shows the server's error next to the field it belongs to", async () => {
    post.mockRejectedValue({
      response: { data: { errors: { jobUrl: "Job URL must start with http:// or https://" } } },
    });
    const form = renderPage();
    await fillRequired();
    await userEvent.type(screen.getByPlaceholderText("Job URL"), "javascript:alert(1)");
    fireEvent.submit(form);
    expect(
      await screen.findByText("Job URL must start with http:// or https://"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Detail page")).not.toBeInTheDocument();
  });

  it("shows a server error that isn't about one field", async () => {
    post.mockRejectedValue({ response: { data: { message: "Something broke" } } });
    const form = renderPage();
    await fillRequired();
    fireEvent.submit(form);
    expect(await screen.findByText("Something broke")).toBeInTheDocument();
  });
});
