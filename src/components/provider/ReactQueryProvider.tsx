"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useState } from "react";
import { SESSION_ENDED_EVENT } from "../../lib/session";

const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    const onSessionEnded = () =>
      queryClient.resetQueries({ queryKey: ["profile"] });
    window.addEventListener(SESSION_ENDED_EVENT, onSessionEnded);
    return () =>
      window.removeEventListener(SESSION_ENDED_EVENT, onSessionEnded);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
