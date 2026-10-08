// Link previews for WhatsApp, Facebook, X etc. Their bots don't run our JS, so for
// /parties/:id and /homes/:id we put the listing's title, photo and description
// into the page before it's sent. Real visitors get the normal page untouched.

const DEFAULT_API = "https://hangaut-locationapi.onrender.com";

const PREVIEW_BOTS =
  /facebookexternalhit|facebot|whatsapp|twitterbot|telegrambot|slackbot|linkedinbot|discordbot|pinterest|skypeuripreview|applebot|googlebot|bingbot|redditbot|snapchat|embedly|iframely/i;

const ROUTES = [
  { pattern: /^\/parties\/([a-f0-9]{24})\/?$/i, endpoint: "parties" },
  { pattern: /^\/homes\/([a-f0-9]{24})\/?$/i, endpoint: "property" },
];

type Listing = {
  title?: string;
  description?: string;
  location?: string;
  images?: string[];
  start_date?: string;
};

type Preview = {
  title: string;
  description: string;
  image?: string;
  url: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const shorten = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;

const partyDay = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Africa/Lagos",
      })
    : "";

export const isPreviewBot = (userAgent: string | null) =>
  PREVIEW_BOTS.test(userAgent ?? "");

export const getPreview = async (
  url: URL,
  apiBase = DEFAULT_API,
): Promise<Preview | null> => {
  const route = ROUTES.find((r) => r.pattern.test(url.pathname));
  const id = route && url.pathname.match(route.pattern)?.[1];
  if (!route || !id) return null;

  // the api can be slow to wake up, bots give up after a few seconds anyway
  const res = await fetch(`${apiBase}/${route.endpoint}/${id}`, {
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) return null;
  const body = await res.json();
  const listing: Listing | undefined = body?.data ?? body;
  if (!listing?.title) return null;

  const details = [partyDay(listing.start_date), listing.location]
    .filter(Boolean)
    .join(" · ");
  const description = [details, listing.description?.trim()]
    .filter(Boolean)
    .join(". ");

  return {
    title: `${listing.title} | Hangaut`,
    description: shorten(description || "Find it on Hangaut", 200),
    image: listing.images?.find(Boolean),
    url: url.toString(),
  };
};

export const withPreview = (html: string, preview: Preview) => {
  const tags = [
    `<meta name="description" content="${escapeHtml(preview.description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Hangaut" />`,
    `<meta property="og:title" content="${escapeHtml(preview.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(preview.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(preview.url)}" />`,
    preview.image &&
      `<meta property="og:image" content="${escapeHtml(preview.image)}" />`,
    `<meta name="twitter:card" content="${preview.image ? "summary_large_image" : "summary"}" />`,
  ].filter(Boolean);

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(preview.title)}</title>`)
    .replace(/\s*<meta (?:name="description"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>/g, "")
    .replace("</head>", `    ${tags.join("\n    ")}\n  </head>`);
};

/** Returns the page with the listing's preview tags for bots, or null to serve the page as normal. */
export const linkPreview = async (
  request: Request,
  loadPage: () => Promise<Response>,
  apiBase?: string,
): Promise<Response | null> => {
  if (!isPreviewBot(request.headers.get("user-agent"))) return null;
  try {
    const preview = await getPreview(new URL(request.url), apiBase || undefined);
    if (!preview) return null;
    const page = await loadPage();
    if (!page.ok) return null;
    return new Response(withPreview(await page.text(), preview), {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  } catch {
    return null;
  }
};
