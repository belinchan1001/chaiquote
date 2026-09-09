import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";
import { PWA } from "@/lib/pwa";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  const { t, updated } = useI18n();
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <Logo onPrimary />
          <p className="mt-3 text-sm text-primary-foreground/70">{t("tagline")}</p>
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
          <p className="mt-2 text-xs leading-relaxed text-primary-foreground/55">
            {t("whatsappTip", { phone: SITE.phoneDisplay })}
          </p>
          <p className="mt-2 text-xs text-primary-foreground/55">
            {t("updatedPrefix")}
            {updated}
          </p>
          <div className="mt-5 space-y-2 text-xs leading-relaxed text-primary-foreground/70">
            <p className="tracking-wider text-primary-foreground/55">加到主畫面／安裝</p>
            <p>{PWA.androidTip}</p>
            <p>{PWA.iosTip}</p>
            <p className="text-primary-foreground/55">{PWA.disclaimer}</p>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-wider text-primary-foreground/55">{t("footerCompare")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/plans" search={{ cat: "broadband" }} className="hover:underline">
                {t("navFibre")}
              </Link>
            </li>
            <li>
              <Link to="/plans" search={{ cat: "mobile" }} className="hover:underline">
                {t("navMobile")}
              </Link>
            </li>
            <li>
              <Link to="/plans" search={{ cat: "business" }} className="hover:underline">
                {t("navBusiness")}
              </Link>
            </li>
            <li>
              <Link to="/plans" search={{ cat: "home5g" }} className="hover:underline">
                {t("footerHome5g")}
              </Link>
            </li>
            <li>
              <Link to="/estates" className="hover:underline">
                屋苑寬頻格價
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-wider text-primary-foreground/55">{t("footerHelp")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/guides" className="hover:underline">
                {t("footerGuides")}
              </Link>
            </li>
            <li>
              <Link to="/quote" className="hover:underline">
                {t("footerQuote")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                {t("navAbout")}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline">
                {t("footerPrivacy")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 px-4 py-6">
        <p className="mx-auto max-w-6xl text-xs leading-relaxed text-primary-foreground/55">
          {t("referencePrice")} {t("disclaimer1")} {t("disclaimer2")} {t("disclaimer3")}
        </p>
      </div>
    </footer>
  );
}
