import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DetailsTab from "./DetailsTab";

function renderWithUrl(jobUrl?: string) {
  render(
    <DetailsTab
      application={{ jobUrl, location: "Remote" }}
      isEditing={false}
      editForm={{}}
      setEditForm={vi.fn()}
    />,
  );
}

describe("DetailsTab job link", () => {
  it.each(["https://acme.test/jobs/1", "http://acme.test", "HTTPS://acme.test"])(
    "links to %s",
    (url) => {
      renderWithUrl(url);
      expect(screen.getByRole("link")).toHaveAttribute("href", url);
    },
  );

  it.each(["javascript:alert(1)", "data:text/html,x", "file:///etc/passwd"])(
    "never links to %s",
    (url) => {
      renderWithUrl(url);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    },
  );

  it("shows no link without a URL", () => {
    renderWithUrl(undefined);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
