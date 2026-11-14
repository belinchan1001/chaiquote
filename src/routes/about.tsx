import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { usePageTitle } from "@/lib/i18n";
import { ABOUT_SEO, aboutJsonLd, canonicalUrl, shareHead } from "@/lib/canonical";
import { SITE } from "@/lib/site";
import { trackWaClick } from "@/lib/track-client";

/**
 * Signed-off About body, written here so the catalogue restore cannot
 * put the inventory paragraph back on the public page.
 * Contact stays on the site desk (6309 9966), not the last carrier desk.
 */
const linkClass = "text-accent underline-offset-4 hover:underline";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => shareHead(ABOUT_SEO, canonicalUrl("/about")),
});

function AboutPage() {
  usePageTitle(ABOUT_SEO.title);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <JsonLd data={aboutJsonLd()} />
      <h1 className="text-title font-semibold">關於我們</h1>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">我哋係邊個</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          齊Quote（chaiquote.hk）係香港獨立比較網站，唔係電訊商官網，亦無向電訊商收取佣金或廣告費。我哋將家居寬頻、5G 家居、流動通訊同商業寬頻計劃整理喺同一個地方，等你先格清價錢同條款，再決定。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">點解要有齊Quote</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          市面上合約、額外收費同報價渠道好散。同一個速率，公屋、居屋、私樓同村屋都可以係另一套計劃。我哋按樓類同計劃卡並列參考，方便你自己比較，而唔使四圍問。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">聯絡我們</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">WhatsApp、致電或電郵都可以。</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed">
          <li>
            WhatsApp／電話：
            <a
              href={`https://wa.me/${SITE.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
              onClick={() => trackWaClick({ source: "about", waPhone: SITE.whatsappE164 })}
            >
              {SITE.phoneDisplay}
            </a>
          </li>
          <li>
            電郵：
            <a href={`mailto:${SITE.leadEmail}`} className={linkClass}>
              {SITE.leadEmail}
            </a>
          </li>
          <li>
            留低電話：
            <Link to="/quote" className={linkClass}>
              填表問價
            </Link>
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          私隱政策見
          <Link to="/privacy" className={linkClass}>
            私隱政策
          </Link>
          。
        </p>
      </section>
    </div>
  );
}
