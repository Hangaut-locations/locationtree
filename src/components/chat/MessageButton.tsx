import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import useAppContext from "../hooks/useAppContext";
import { startChat, type ChatListingType } from "../../lib/chat";
import { getErrorMessage, type ApiError } from "../../lib/errors";
import { linkKey } from "../../lib/privateLink";

const MessageButton = ({
  userId,
  listingType,
  listingId,
  label = "Message",
  className = "rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted disabled:opacity-60",
}: {
  userId: string;
  listingType: ChatListingType;
  listingId: string;
  label?: string;
  className?: string;
}) => {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const [busy, setBusy] = useState(false);
  if (user?._id === userId) return null;

  return (
    <button
      type="button"
      disabled={busy}
      className={className}
      onClick={async () => {
        if (!user) {
          setIsAuthModal(true);
          return;
        }
        setBusy(true);
        try {
          const chat = await startChat({
            userId,
            listingType,
            listingId,
            key: linkKey(),
          });
          navigate(`/messages/${chat._id}`);
        } catch (err) {
          toast.error(getErrorMessage(err as ApiError, "Couldn't open the chat"));
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "Opening..." : label}
    </button>
  );
};

export default MessageButton;
