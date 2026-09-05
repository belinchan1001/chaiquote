import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { ProviderMark } from "@/components/provider-mark";
import { PLANS, PROVIDERS } from "@/lib/plans";
import { DISCLAIMER, SITE } from "@/lib/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({ meta: [{ title: `關於我們 · ${SITE.name}` }] }),
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-title font-semibold">關於我們</h1>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">我們是誰</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          我們是一個專注於香港市場的獨立電訊服務比較平台，旨在為廣大用戶提供公開、透明且客觀的家居寬頻與流動通訊計劃資訊。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">我們的理念</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          面對市場上繁複的合約條款與隱藏收費，我們透過系統化整理各大營運商的最新方案，協助用戶在最短時間內挑選最符合預算與需求的電訊服務。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">獨立聲明</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          本平台並非任何單一電訊營運商之附屬機構，所有資料均以提供中立參考為核心原則。資料更新：{SITE.updated}。現時收錄 {PROVIDERS.length} 間供應商、{PLANS.length} 個參考計劃。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">現時覆蓋之供應商</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PROVIDERS.map((p) => (
            <li key={p.id} className="rounded-lg bg-surface px-3 py-3">
              <ProviderMark id={p.id} />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          標誌用法見{" "}
          <Link to="/brand" className="text-accent underline-offset-4 hover:underline">
            品牌指引
          </Link>
          。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">免責聲明</h2>
        {DISCLAIMER.map((p) => (
          <p key={p} className="mt-3 text-sm leading-relaxed text-muted">
            {p}
          </p>
        ))}
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <QuoteLink showNumber />
        <Button asChild variant="outline">
          <Link to="/quote">填表問價</Link>
        </Button>
      </div>
    </div>
  );
}
