import { EyeIcon, Pencil, Trash2 } from "lucide-react";
import type React from "react";

interface HostListingRowProps {
  image?: string;
  title: string;
  details: string;
  badge?: React.ReactNode;
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
  badge,
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
          {title}
        </p>
        {badge}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground sm:text-[11px]">
        {details}
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
