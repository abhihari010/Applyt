import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const checkboxClass = "h-5 w-5 shrink-0 cursor-pointer accent-red-700";

/**
 * Multi-select delete for a list. Render `bar` above the list and
 * `checkbox(item, label)` in each row.
 * `items` must be what the user can currently reach: a selection hidden by a
 * filter is excluded, so nothing gets deleted that isn't in the current view.
 */
export function useBulkDelete<T extends { id: string }>({
  items,
  noun,
  deleteOne,
  onDeleted,
}: {
  items: T[];
  noun: string;
  deleteOne: (item: T) => Promise<unknown>;
  onDeleted: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = items.filter((item) => selectedIds.has(item.id));
  const allSelected = items.length > 0 && selected.length === items.length;
  const label = `${selected.length} ${noun}${selected.length === 1 ? "" : "s"}`;

  // ponytail: one request per item, add a batch endpoint if lists get into the thousands
  const mutation = useMutation({
    mutationFn: async (targets: T[]) => {
      const results = await Promise.allSettled(
        targets.map((item) => deleteOne(item)),
      );
      return targets.filter((_, i) => results[i].status === "rejected");
    },
    onSuccess: (failed, targets) => {
      onDeleted();
      setConfirmOpen(false);
      // Failures stay selected so the user can retry them.
      setSelectedIds(new Set(failed.map((item) => item.id)));
      setError(
        failed.length > 0
          ? `Could not delete ${failed.length} of ${targets.length}. Anything that failed is still selected, so you can try again.`
          : null,
      );
    },
  });

  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (!next.delete(id)) next.add(id);
    setSelectedIds(next);
  };

  const checkbox = (item: T, ariaLabel: string) => (
    <input
      type="checkbox"
      className={checkboxClass}
      aria-label={ariaLabel}
      checked={selectedIds.has(item.id)}
      onChange={() => toggle(item.id)}
      onClick={(e) => e.stopPropagation()}
    />
  );

  const bar = items.length > 0 && (
    <div className="mb-4 flex min-h-11 flex-wrap items-center gap-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-700">
        <input
          type="checkbox"
          className={checkboxClass}
          checked={allSelected}
          onChange={() =>
            setSelectedIds(
              new Set(allSelected ? [] : items.map((item) => item.id)),
            )
          }
        />
        Select all ({items.length})
      </label>
      {selected.length > 0 && (
        <button
          type="button"
          className="btn-danger"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete {selected.length} selected
        </button>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <ConfirmDeleteModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => mutation.mutate(selected)}
        loading={mutation.isPending}
        title={`Delete ${label}`}
        message={`Are you sure you want to delete ${label}? This action cannot be undone.`}
      />
    </div>
  );

  return { bar, checkbox };
}
