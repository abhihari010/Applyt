import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

function setup(props: Partial<ComponentProps<typeof ConfirmDeleteModal>> = {}) {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ConfirmDeleteModal
      isOpen
      onClose={onClose}
      onConfirm={onConfirm}
      loading={false}
      title="Delete application"
      message="This cannot be undone."
      {...props}
    />,
  );
  return { onClose, onConfirm };
}

const backdrop = () => document.querySelector(".backdrop-blur-sm")!;

describe("ConfirmDeleteModal", () => {
  it("renders nothing when closed", () => {
    setup({ isOpen: false });
    expect(screen.queryByText("Delete application")).not.toBeInTheDocument();
  });

  it("shows the title and message when open", () => {
    setup();
    expect(screen.getByText("Delete application")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("calls onConfirm from the delete button", () => {
    const { onConfirm, onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose from the cancel button", () => {
    const { onConfirm, onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("uses custom confirm text", () => {
    setup({ confirmButtonText: "Delete 3 applications" });
    expect(screen.getByRole("button", { name: "Delete 3 applications" })).toBeInTheDocument();
  });

  it("disables both buttons while the delete is running", () => {
    setup({ loading: true });
    expect(screen.getByRole("button", { name: "Deleting..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("stays open on a backdrop click while the delete is running", () => {
    const { onClose } = setup({ loading: true });
    fireEvent.click(backdrop());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on a backdrop click otherwise", () => {
    const { onClose } = setup();
    fireEvent.click(backdrop());
    expect(onClose).toHaveBeenCalledOnce();
  });
});
