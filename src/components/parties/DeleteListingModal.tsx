import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useState } from "react";
import { adminCaller } from "../../interceptors/http";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteListingModalProps {
  listingId: string;
  /** API collection the listing belongs to. */
  resource?: "parties" | "property";
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteListingModal: React.FC<DeleteListingModalProps> = ({
  isOpen,
  onClose,
  listingId,
  resource = "parties",
}) => {
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);

    adminCaller
      .delete(`/${resource}/${listingId}`)
      .then(() => {
        qc.invalidateQueries({
          queryKey: [resource === "parties" ? "my-parties" : "my-properties"],
        });
        toast.success("Listing deleted successfully");
        onClose();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error deleting listing");
      })
      .finally(() => setLoading(false));
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Dialog matches the compact square layout shown in the screenshot */}
      <DialogContent className="max-w-lg w-[90vw] h-full sm:h-auto rounded-none sm:rounded-lg border border-border bg-card p-0 shadow-2xl animate-in fade-in sm:zoom-in-95 duration-200 top-0 left-0 sm:top-1/2 sm:left-1/2 translate-x-0 translate-y-0 sm:-translate-x-1/2 sm:-translate-y-1/2 overflow-hidden">
        {/* Title Header */}
        <div className="flex items-center justify-center border-b border-border/60 py-5">
          <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
            Delete listing?
          </DialogTitle>
        </div>

        {/* Content Body */}
        <div className="pb-5 px-5 w-full h-max">
          <p>
            Are you sure you want to delete this listing, this action will
            remove it entirely from the system. Please proceed with caution!
          </p>

          {/* Footer actions aligned to design screenshot */}
          <div className="w-full flex justify-end items-center gap-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-bold bg-gray-100 hover:bg-gray-200 text-[#222] rounded-full w-full py-3 px-5 transition-all duration-200 ease cursor-pointer"
            >
              No
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="rounded-full w-full disabled:opacity-45 bg-red-600 hover:bg-red-700 dark:bg-red-800 dark:hover:bg-red-750 text-white font-semibold py-3 px-5 text-sm transition-all duration-200 ease cursor-pointer"
            >
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
