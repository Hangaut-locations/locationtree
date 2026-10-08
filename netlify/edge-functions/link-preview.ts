import { linkPreview } from "../../server/linkPreview.ts";

declare const Netlify: { env: { get(name: string): string | undefined } };

export default async (request: Request, context: { next: () => Promise<Response> }) =>
  (await linkPreview(request, () => context.next(), Netlify.env.get("VITE_BASE_URL"))) ?? undefined;

export const config = { path: ["/parties/*", "/homes/*"] };
