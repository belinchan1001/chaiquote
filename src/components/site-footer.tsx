import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { DISCLAIMER, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <Logo onPrimary />
          <p className="mt-3 text-sm text-primary-foreground/70">{SITE.tagline}</p>
          <p className="mt-4 text-sm">
            <a
              href={`https://wa.me/${SITE.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              WhatsApp {SITE.phoneDisplay}
            </a>
          </p>
          <p className="mt-2 text-xs text-primary-foreground/55">價錢更新：{SITE.updated}</p>
        </div>
        <div>
          <p className="text-xs tracking-wider text-primary-foreground/55">格價</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/plans" search={{ cat: "broadband" }} className="hover:underline">
                光纖寬頻
              </Link>
            </li>
            <li>
              <Link to="/plans" search={{ cat: "mobile" }} className="hover:underline">
                手機月費
              </Link>
            </li>
            <li>
              <Link to="/plans" search={{ cat: "business" }} className="hover:underline">
                商業寬頻
              </Link>
            </li>
            <li>
              <Link to="/plans" search={{ cat: "home5g" }} className="hover:underline">
                5G 家居寬頻
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-wider text-primary-foreground/55">幫手</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/guides" className="hover:underline">
                點揀 plan
              </Link>
            </li>
            <li>
              <Link to="/quote" className="hover:underline">
                留低電話
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                關於我們
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 px-4 py-6">
        <p className="mx-auto max-w-6xl text-xs leading-relaxed text-primary-foreground/55">
          {DISCLAIMER.join(" ")}
        </p>
      </div>
    </footer>
  );
}
