import { DollarSign, Globe } from "lucide-react";
import type React from "react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import type { CurrencyCode } from "../lib/currency";

interface FooterProps {
  currency: CurrencyCode;
  onCurrencyClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currency,
  onCurrencyClick,
}) => {
  return (
    <footer className="w-full border-t border-border bg-muted/30 pt-12 pb-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Sitemap Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-border/60">
          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-950 dark:text-purple-300">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm  text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Safety information
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Cancellation options
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Our COVID-19 Response
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Supporting people with disabilities
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Report a neighborhood concern
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-950 dark:text-purple-300">
              Community
            </h3>
            <ul className="space-y-2.5 text-sm  text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Hangout.org: disaster relief housing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Support Afghan refugees
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Celebrating diversity & belonging
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Combating discrimination
                </a>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-950 dark:text-purple-300">
              Hosting
            </h3>
            <ul className="space-y-2.5 text-sm  text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Try hosting
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  AirCover for Hosts
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Explore hosting resources
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Visit our community forum
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  How to host responsibly
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-950 dark:text-purple-300">
              About
            </h3>
            <ul className="space-y-2.5 text-sm  text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Newsroom
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Learn about new features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Letter from our founders
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Investors
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground hover:underline transition-colors text-xs"
                >
                  Hangout Luxe
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 text-sm  text-muted-foreground">
          {/* Copyright & Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center">
            <span>© 2026 Hangout, Inc.</span>
            <span>·</span>
            <a
              href="#"
              className="hover:text-foreground hover:underline transition-colors text-xs"
            >
              Privacy
            </a>
            <span>·</span>
            <a
              href="#"
              className="hover:text-foreground hover:underline transition-colors text-xs"
            >
              Terms
            </a>
            <span>·</span>
            <a
              href="#"
              className="hover:text-foreground hover:underline transition-colors text-xs"
            >
              Sitemap
            </a>
          </div>

          {/* Socials & Language / Currency */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Lang & Currency selection mockup */}
            <div className="flex items-center gap-4">
              <button
                onClick={onCurrencyClick}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer focus:outline-none"
                aria-label="Choose currency"
              >
                <Globe className="h-4 w-4" />
                <span>English (US)</span>
              </button>
              <button
                onClick={onCurrencyClick}
                className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer focus:outline-none"
                aria-label="Choose currency"
              >
                <DollarSign className="h-4 w-4" />
                <span>{currency}</span>
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hover:text-foreground social-icon-link"
                aria-label="Facebook"
              >
                <SiFacebook className="h-4 w-4" />
              </a>
              <a
                href="https://x.com/hangauthere"
                className="hover:text-foreground social-icon-link"
                aria-label="Twitter"
                target="_blank"
              >
                <SiX className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="hover:text-foreground social-icon-link"
                aria-label="Instagram"
              >
                <SiInstagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
