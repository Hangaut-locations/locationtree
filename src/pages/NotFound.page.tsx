import { Link } from "react-router-dom";

const links = [
  { label: "Home", to: "/" },
  { label: "Parties", to: "/parties" },
  { label: "Homes", to: "/homes" },
  { label: "Become a host", to: "/become-a-host" },
  { label: "Support", to: "/support" },
  { label: "Favorites", to: "/favorites" },
];

/** Soft hangout pin illustration — page not found, still friendly. */
const LostPinArt = () => (
  <svg
    viewBox="0 0 280 280"
    className="mx-auto h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72"
    aria-hidden="true"
  >
    <circle cx="140" cy="140" r="120" fill="#f3e8ff" />
    <ellipse cx="140" cy="230" rx="54" ry="12" fill="#e9d5ff" />
    <path
      d="M140 48c-36 0-66 28-66 64 0 48 66 108 66 108s66-60 66-108c0-36-30-64-66-64z"
      fill="#7c3aed"
    />
    <circle cx="140" cy="108" r="28" fill="#faf5ff" />
    <path
      d="M128 104h24M140 92v24"
      stroke="#a855f7"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <circle cx="198" cy="72" r="22" fill="#fff" stroke="#c4b5fd" strokeWidth="3" />
    <text
      x="198"
      y="78"
      textAnchor="middle"
      fontSize="22"
      fontWeight="700"
      fill="#6b21a8"
      fontFamily="system-ui,Segoe UI,sans-serif"
    >
      ?
    </text>
  </svg>
);

const NotFoundPage = () => (
  <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#faf5ff_55%,#f5f3ff_100%)] text-[#484848]">
    <header className="px-6 pb-2 pt-6 sm:px-10">
      <Link to="/" className="inline-flex items-center gap-2" aria-label="Hangaut home">
        <img
          src="/logo.png"
          alt="Hangaut"
          className="h-10 w-auto object-contain sm:h-12"
        />
      </Link>
    </header>

    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10 sm:px-10 md:flex-row md:items-start md:justify-between md:gap-16 md:py-16">
      <div className="max-w-md shrink-0">
        <h1 className="text-5xl font-bold tracking-tight text-[#222222] sm:text-6xl">
          Oops!
        </h1>
        <p className="mt-4 text-lg leading-snug text-[#484848] sm:text-xl">
          We can&apos;t seem to find the page you&apos;re looking for.
        </p>
        <p className="mt-3 text-sm text-[#767676]">Error code: 404</p>

        <div className="mt-10">
          <p className="text-sm font-semibold text-[#222222]">
            Here are some helpful links instead:
          </p>
          <ul className="mt-3 space-y-2">
            {links.map(({ label, to }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-base font-medium text-[#7c3aed] underline-offset-2 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center md:justify-end">
        <LostPinArt />
      </div>
    </main>
  </div>
);

export default NotFoundPage;
