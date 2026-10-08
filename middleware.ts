import { next } from "@vercel/functions";
import { linkPreview } from "./server/linkPreview.ts";

export const config = { matcher: ["/parties/:id", "/homes/:id"] };

export default async function middleware(request: Request) {
  const preview = await linkPreview(
    request,
    () => fetch(new URL("/index.html", request.url)),
    process.env.VITE_BASE_URL,
  );
  return preview ?? next();
}
