import { useState, type MouseEvent } from "react";
import { Check, Copy, Mail, MessageSquare, Share } from "lucide-react";
import { FaFacebook, FaTelegram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";

type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  kind: "party" | "place";
  title: string;
  image?: string;
  details?: string;
};

const copyText = async (text: string, container: HTMLElement) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // clipboard api only works on https / localhost. the textarea has to sit inside the popup or focusing it closes the popup
    const input = document.createElement("textarea");
    input.value = text;
    input.className = "sr-only";
    container.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
};

const ShareModal = ({ open, onClose, kind, title, image, details }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const message =
    kind === "party" ? `Join me at ${title} on Hangaut` : `Check out ${title} on Hangaut`;
  const text = encodeURIComponent(message);
  const link = encodeURIComponent(url);
  const canUseShareSheet = typeof navigator.share === "function";

  const copyLink = async (event: MouseEvent<HTMLButtonElement>) => {
    await copyText(url, event.currentTarget.parentElement ?? document.body);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSheet = () =>
    navigator.share({ title, text: message, url }).catch(() => undefined);

  const options = [
    { label: "WhatsApp", icon: <FaWhatsapp className="text-[#25D366]" />, href: `https://wa.me/?text=${text}%20${link}` },
    { label: "Facebook", icon: <FaFacebook className="text-[#1877F2]" />, href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
    { label: "X", icon: <FaXTwitter />, href: `https://twitter.com/intent/tweet?text=${text}&url=${link}` },
    { label: "Telegram", icon: <FaTelegram className="text-[#26A5E4]" />, href: `https://t.me/share/url?url=${link}&text=${text}` },
    { label: "Email", icon: <Mail />, href: `mailto:?subject=${encodeURIComponent(title)}&body=${text}%0A%0A${link}` },
    { label: "Messages", icon: <MessageSquare />, href: `sms:?&body=${text}%20${link}` },
  ];

  const optionClass =
    "flex items-center gap-3 rounded-xl border border-border px-4 py-3.5 text-sm font-semibold transition hover:bg-muted [&>svg]:h-5 [&>svg]:w-5";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-[calc(100%-2rem)] grid-cols-[minmax(0,1fr)] gap-0 rounded-3xl bg-card p-6 sm:max-w-lg sm:p-8">
        <DialogTitle className="text-xl font-bold">
          Share this {kind}
        </DialogTitle>

        <div className="mt-5 flex items-center gap-4">
          {image ? (
            <img src={image} alt={title} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="h-16 w-16 shrink-0 rounded-xl bg-muted" />
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold">{title}</p>
            {details && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">{details}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-border p-1.5 pl-4">
          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{url}</span>
          <button
            type="button"
            onClick={copyLink}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-purple-500 px-3.5 py-2 text-sm font-bold text-white transition hover:bg-purple-600"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {options.map((option) => (
            <a
              key={option.label}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className={optionClass}
            >
              {option.icon}
              {option.label}
            </a>
          ))}
          {canUseShareSheet && (
            <button type="button" onClick={shareSheet} className={`${optionClass} col-span-2 justify-center`}>
              <Share />
              More options
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
