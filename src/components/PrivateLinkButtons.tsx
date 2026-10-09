import { useState, type MouseEvent } from "react";
import { Check, Link2, RefreshCw } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminCaller } from "../interceptors/http";
import { copyText } from "../lib/clipboard";
import { getErrorMessage, type ApiError } from "../lib/errors";
import { listingLink } from "../lib/privateLink";

interface PrivateLinkButtonsProps {
  kind: "party" | "property";
  id: string;
  privateKey?: string;
  className: string;
}

const PrivateLinkButtons: React.FC<PrivateLinkButtonsProps> = ({
  kind,
  id,
  privateKey,
  className,
}) => {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const copyLink = async (event: MouseEvent<HTMLButtonElement>) => {
    if (!privateKey) return;
    await copyText(listingLink(kind, id, privateKey), event.currentTarget);
    setCopied(true);
    toast.success("Private link copied. Send it to your guests.");
    setTimeout(() => setCopied(false), 2000);
  };

  const { mutate: resetLink, isPending } = useMutation({
    mutationFn: () =>
      adminCaller.post(
        `/${kind === "party" ? "parties" : "property"}/${id}/private-link`,
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [kind === "party" ? "my-parties" : "my-properties"],
      });
      toast.success("New link made. The old link doesn't work anymore.");
    },
    onError: (err: ApiError) =>
      toast.error(getErrorMessage(err, "Couldn't make a new link, try again")),
  });

  const confirmReset = () => {
    if (
      window.confirm(
        "Make a new private link? Anyone with the old link won't be able to open it anymore.",
      )
    ) {
      resetLink();
    }
  };

  return (
    <>
      <button
        type="button"
        title="Copy private link"
        onClick={copyLink}
        disabled={!privateKey}
        className={`${className} text-foreground hover:bg-muted disabled:opacity-50`}
        aria-label="Copy private link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        <span className="sm:hidden">Copy link</span>
      </button>
      <button
        type="button"
        title="Make a new private link"
        onClick={confirmReset}
        disabled={isPending}
        className={`${className} text-foreground hover:bg-muted disabled:opacity-50`}
        aria-label="Make a new private link"
      >
        <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
        <span className="sm:hidden">New link</span>
      </button>
    </>
  );
};

export default PrivateLinkButtons;
