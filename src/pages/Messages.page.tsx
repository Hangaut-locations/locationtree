import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ChatThread from "../components/chat/ChatThread";
import useAuth from "../components/hooks/useAuth";
import useAppContext from "../components/hooks/useAppContext";
import { chatName, chatPreview, listChats } from "../lib/chat";

const whenLabel = (iso: string) => {
  const date = new Date(iso);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const MessagesPage = () => {
  const { id } = useParams();
  const { data: user, isLoading: userLoading } = useAuth();
  const { setIsAuthModal } = useAppContext();
  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: listChats,
    enabled: Boolean(user),
  });

  return (
    <AppLayout footer={!id}>
      {id ? (
        <ChatThread conversationId={id} />
      ) : (
        <div className="mx-auto max-w-lg px-4 py-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          {!user && !userLoading && (
            <button
              type="button"
              onClick={() => setIsAuthModal(true)}
              className="mt-6 w-full rounded-2xl border border-dashed border-border p-4 text-sm font-semibold"
            >
              Log in to see your messages
            </button>
          )}
          {user && isLoading && (
            <p className="mt-6 text-sm text-muted-foreground">Loading...</p>
          )}
          {user && chats?.length === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              No messages yet. Open a place or party and message the host, or
              someone who liked or reviewed it.
            </p>
          )}
          <ul className="mt-4 divide-y divide-border">
            {chats?.map((chat) => (
              <li key={chat._id}>
                <Link
                  to={`/messages/${chat._id}`}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-800">
                    {chatName(chat.person).slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-bold">
                        {chatName(chat.person)}
                      </span>
                      {chat.lastMessage && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {whenLabel(chat.lastMessage.at)}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-muted-foreground">
                        {chatPreview(chat.lastMessage)}
                      </span>
                      {chat.unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1.5 text-[10px] font-bold text-white">
                          {chat.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppLayout>
  );
};

export default MessagesPage;
