import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PlanCard } from "@/components/plan-card";
import { SearchPanel } from "@/components/search-panel";
import { Button } from "@/components/ui/button";
import { ESTATES } from "@/lib/estates";
import { PLANS, formatFee, getPlan, minMonthlyFee, minVillageBroadbandFee } from "@/lib/plans";
import { FAQ, SITE } from "@/lib/site";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: `${SITE.name} · ${SITE.tagline}` }],
  }),
});

const FEATURED_IDS = [
  "hkbn-ftth-1000-36m-98",
  "hgc-ftth-1000-public-36m",
  "cmhk-home5g-350-48-88",
  "three-45g-44",
] as const;

const CATEGORIES = [
  { to: "/plans", search: { cat: "broadband" as const }, src: "/images/cat-broadband.jpg", label: "光纖寬頻", text: "1000M 至 10000M，公屋／居屋／私樓／村屋" },
  { to: "/plans", search: { cat: "home5g" as const }, src: "/images/cat-home5g.jpg", label: "5G 家居", text: "唔使拉線，速度 100M–1000M，視現場環境而定" },
  { to: "/plans", search: { cat: "mobile" as const }, src: "/images/cat-mobile.jpg", label: "手機月費", text: "4G／5G，大灣區數據都篩到" },
  { to: "/plans", search: { cat: "business" as const }, src: "/images/cat-business.jpg", label: "商業寬頻", text: "店舖同寫字樓，1000M 起" },
] as const;

function Home() {
  const featured = FEATURED_IDS.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const fiberFrom = minMonthlyFee("broadband");
  const home5gFrom = minMonthlyFee("home5g");
  const mobileFrom = minMonthlyFee("mobile");
  const villageFrom = minVillageBroadbandFee();

  return (
    <div>
      <section className="relative overflow-hidden">
        <img
          src="/images/hero-home.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/25" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div className="page-enter text-primary-foreground">
            <p className="text-xs font-medium tracking-widest text-primary-foreground/75">
              香港 · 資料更新 {SITE.updated}
            </p>
            <h1 className="mt-3 font-display text-display font-semibold leading-none tracking-tight">
              搵寬頻唔使四圍問，
              <br />
              呢度一次過幫你睇晒。
            </h1>
            <p className="mt-5 max-w-lg text-lead text-primary-foreground/80">
              輸入你住邊，即時比較各大電訊商最新月費與優惠。
            </p>
            <div className="mt-8 hidden gap-6 text-sm text-primary-foreground/75 sm:flex">
              <p>
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">8</span> 間電訊商
              </p>
              <p>
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">{PLANS.length}</span> 個參考計劃
              </p>
              <p>
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">{ESTATES.length}</span> 個屋苑
              </p>
            </div>
          </div>
          <SearchPanel />
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "光纖寬頻", value: `${formatFee(fiberFrom)} 起` },
            { label: "5G 家居", value: `${formatFee(home5gFrom)} 起` },
            { label: "手機月費", value: `${formatFee(mobileFrom)} 起` },
            { label: "村屋光纖", value: `${formatFee(villageFrom)} 起` },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium tracking-wider text-muted">{item.label}</p>
              <p className="mt-1 font-display text-lg font-semibold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              className="group overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <img src={item.src} alt={item.label} loading="lazy" decoding="async" className="h-40 w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10" />
              <div className="p-5">
                <p className="font-medium">
                  {item.label}
                  <ArrowRight className="ml-1 inline size-4 opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </p>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-title font-semibold">入門價一覽</h2>
              <p className="mt-2 text-sm text-muted">四條常見起步計劃。實際覆蓋及月費以申請時確認為準。</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/plans" search={{ cat: "broadband" }}>
                睇晒計劃
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {featured.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-title font-semibold">常見問題</h2>
          <div className="mt-6 divide-y divide-border">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium">
                  {item.q}
                  <span className="text-subtle transition-transform duration-150 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
