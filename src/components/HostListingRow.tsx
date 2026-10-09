import { EyeIcon, Pencil, Trash2 } from "lucide-react";
import type React from "react";

interface HostListingRowProps {
  image?: string;
  title: string;
  details: string;
  draft?: boolean;
  isPrivate?: boolean;
  kind: "party" | "property";
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const actionClass =
  "flex h-9 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold transition-colors cursor-pointer sm:h-8 sm:w-8 sm:px-0";

const HostListingRow: React.FC<HostListingRowProps> = ({
  image,
  title,
  details,
  draft,
  isPrivate,
  kind,
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-3xl border border-border bg-card p-4 sm:flex-nowrap">
    {image ? (
      <img
        src={image}
        alt={title}
        className="h-16 w-16 shrink-0 rounded-2xl object-cover"
      />
    ) : (
      <div className="h-16 w-16 shrink-0 rounded-2xl bg-muted" />
    )}
    <div className="min-w-0 flex-1">
      <div className="flex items-start gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-foreground sm:truncate">
          {title || (kind === "party" ? "Untitled party" : "Untitled property")}
        </p>
        {draft && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
            Draft
          </span>
        )}
        {isPrivate && (
          <span
            title="Hidden from search. Only people with the link can see it."
            className="shrink-0 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-900"
          >
            Private
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground sm:text-[11px]">
        {draft ? "Not published yet. Pick up where you left off." : details}
      </p>
    </div>
    <div className="flex w-full justify-end gap-2 border-t border-border pt-3 sm:w-auto sm:border-0 sm:pt-0">
      <button
        type="button"
        title={`View ${kind}`}
        onClick={onView}
        className={`${actionClass} text-foreground hover:bg-muted`}
        aria-label={`View ${kind}`}
      >
        <EyeIcon className="h-4 w-4" />
        <span className="sm:hidden">View</span>
      </button>
      {draft ? (
        <button
          type="button"
          title={`Finish ${kind}`}
          onClick={onEdit}
          className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-purple-950 px-4 text-xs font-semibold text-white transition-colors hover:bg-purple-900 cursor-pointer sm:h-8"
        >
          <Pencil className="h-4 w-4" />
          <span>Finish</span>
        </button>
      ) : (
        <button
          type="button"
          title={`Edit ${kind}`}
          onClick={onEdit}
          className={`${actionClass} text-foreground hover:bg-muted`}
          aria-label={`Edit ${kind}`}
        >
          <Pencil className="h-4 w-4" />
          <span className="sm:hidden">Edit</span>
        </button>
      )}
      <button
        type="button"
        title={`Delete ${kind}`}
        onClick={onDelete}
        className={`${actionClass} text-red-500 hover:bg-red-50`}
        aria-label={`Delete ${kind}`}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sm:hidden">Delete</span>
      </button>
    </div>
  </div>
);

export default HostListingRow;
