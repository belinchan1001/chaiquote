import { createFileRoute } from "@tanstack/react-router";
import { BrandLockup, LogoMark } from "@/components/logo";
import { ProviderMark } from "@/components/provider-mark";
import { PROVIDERS } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { VOICE, COMPETITOR_VOICES, VOICE_GAP } from "@/lib/voice";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/brand")({
  component: BrandGuide,
  head: () => ({
    meta: [{ title: `品牌指引 · ${SITE.name}` }],
  }),
});

const COLORS = [
  { name: "電訊藍", token: "bg-primary", fg: "text-primary-foreground", hex: "#1557C4", use: "主色、標誌底、按鈕" },
  { name: "訊號青", token: "bg-accent", fg: "text-accent-foreground", hex: "#00A8C5", use: "引號疊色、重點" },
  { name: "墨水色", token: "bg-fg", fg: "text-primary-foreground", hex: "#0C2248", use: "標題、內文" },
  { name: "紙底", token: "bg-bg", fg: "text-fg", hex: "#EEF4FB", use: "頁面底" },
  { name: "卡片白", token: "bg-card", fg: "text-fg", hex: "#FFFFFF", use: "卡片、反白標誌底" },
] as const;

const DONT = [
  { title: "唔好拉闊", className: "scale-x-125 origin-left" },
  { title: "唔好旋轉", className: "rotate-12" },
  { title: "唔好改色", className: "hue-rotate-90" },
  { title: "唔好加陰影", className: "opacity-90" },
] as const;

function BrandGuide() {
  return (
    <div className="page-enter">
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <p className="text-xs font-medium tracking-wider text-accent">品牌指引</p>
          <h1 className="mt-3 text-title font-semibold">標誌同語氣</h1>
          <p className="mt-4 max-w-2xl text-lead text-muted">
            兩個重疊引號代表「報價」，青色疊層代表訊號。對外說話要直、實、信、近——{VOICE.oneLiner}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-lg font-semibold">語氣</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{VOICE.personality}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {VOICE.pillars.map((item) => (
            <article key={item.title} className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
              <p className="font-display text-xl font-semibold text-primary">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wider text-muted">我哋係</p>
            <ul className="mt-3 space-y-2 text-sm">
              {VOICE.weAre.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wider text-muted">我哋唔係</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {VOICE.weAreNot.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-6 overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">用呢句</th>
                <th className="px-5 py-3 font-medium">唔用呢句</th>
              </tr>
            </thead>
            <tbody>
              {VOICE.words.map((row) => (
                <tr key={row.use} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{row.use}</td>
                  <td className="px-5 py-3 text-muted">{row.avoid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {VOICE.examples.map((ex) => (
            <figure key={ex.good} className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
              <p className="text-xs font-medium text-hot">唔好咁寫</p>
              <p className="mt-2 text-sm text-muted">{ex.bad}</p>
              <p className="mt-4 text-xs font-medium text-accent">改成咁</p>
              <p className="mt-2 text-sm">{ex.good}</p>
            </figure>
          ))}
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {VOICE.surfaces.map((item) => (
            <div key={item.where} className="rounded-xl bg-surface p-5">
              <dt className="text-sm font-medium">{item.where}</dt>
              <dd className="mt-2 text-sm text-muted">{item.how}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-lg font-semibold">對手語氣</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">{VOICE_GAP}</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {COMPETITOR_VOICES.map((item) => (
              <article key={item.name} className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
                <p className="text-xs tracking-wider text-muted">{item.type}</p>
                <h3 className="mt-1 text-base font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm text-muted">{item.voice}</p>
                <blockquote className="mt-3 border-l-2 border-accent pl-3 text-sm">
                  <span className="text-xs text-subtle">典型講法</span>
                  <br />
                  「{item.quote}」
                </blockquote>
                <p className="mt-4 text-sm">
                  <span className="font-medium">可借：</span>
                  {item.steal}
                </p>
                <p className="mt-1 text-sm text-muted">
                  <span className="font-medium text-fg">唔抄：</span>
                  {item.drop}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-lg font-semibold">主標誌</h2>
        <p className="mt-2 text-sm text-muted">橫向組合：圖標 + 齊Quote。日常網站、文件、WhatsApp 預覽用呢個。</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="flex min-h-48 items-center justify-center rounded-xl bg-card p-8 shadow-[var(--shadow-border)]">
            <BrandLockup markClassName="size-16" className="gap-4 text-3xl" />
          </div>
          <div className="flex min-h-48 items-center justify-center rounded-xl bg-primary p-8">
            <BrandLockup variant="reverse" markClassName="size-16" className="gap-4 text-3xl" />
          </div>
        </div>
        <p className="mt-3 text-xs text-subtle">左：淺底全彩。右：藍底反白。</p>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-lg font-semibold">圖標單獨使用</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            App icon、favicon、頭像用正方形圖標。兩個引號方塊唔可以拆開、唔可以對調顏色。
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "全彩", variant: "color" as const, wrap: "bg-card" },
              { label: "反白", variant: "reverse" as const, wrap: "bg-primary" },
              { label: "單色墨", variant: "ink" as const, wrap: "bg-card" },
              { label: "最小 24px", variant: "color" as const, wrap: "bg-card", size: "size-6" },
            ].map((item) => (
              <figure key={item.label} className={cn("flex flex-col items-center gap-4 rounded-xl p-6", item.wrap)}>
                <LogoMark variant={item.variant} className={item.size ?? "size-16"} />
                <figcaption className={cn("text-xs", item.wrap === "bg-primary" ? "text-primary-foreground/80" : "text-muted")}>
                  {item.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-lg font-semibold">安全距離</h2>
        <p className="mt-2 text-sm text-muted">圖標四周最少留 1/4 邊長。字同其他圖案唔好貼實標誌。</p>
        <div className="mt-6 flex flex-wrap items-end gap-10">
          <div className="rounded-xl bg-card p-8 shadow-[var(--shadow-border)]">
            <div className="border border-dashed border-accent p-4">
              <LogoMark className="size-16" />
            </div>
            <p className="mt-3 text-center text-xs text-subtle">X = 圖標邊長 ÷ 4</p>
          </div>
          <div>
            <p className="text-sm font-medium">最小尺寸</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>圖標：24px</li>
              <li>橫向主標：高度 32px</li>
              <li>印刷：圖標 8mm</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-lg font-semibold">品牌色</h2>
          <p className="mt-2 text-sm text-muted">標誌只用藍、青、白、墨。熱賣紅同供應商色唔入標誌。</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {COLORS.map((c) => (
              <div key={c.hex} className="overflow-hidden rounded-xl shadow-[var(--shadow-border)]">
                <div className={cn("h-24", c.token, c.fg)} />
                <div className="bg-card p-3">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="mt-1 font-display text-xs tabular-nums text-muted">{c.hex}</p>
                  <p className="mt-1 text-xs text-subtle">{c.use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-lg font-semibold">字體</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wider text-muted">標題字 · Sora</p>
            <p className="mt-4 font-display text-4xl font-semibold tracking-tight">齊Quote</p>
            <p className="mt-3 text-sm text-muted">標誌英文 Quote、數字、大標題。字重 600，微收字距。</p>
          </div>
          <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wider text-muted">內文字 · 思源黑體</p>
            <p className="mt-4 text-3xl font-semibold">一次過比較全港月費</p>
            <p className="mt-3 text-sm text-muted">中文內文同介面。標誌「齊」跟呢套字，唔好改成楷書或圓體。</p>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-lg font-semibold">禁用</h2>
          <p className="mt-2 text-sm text-muted">以下改動會削弱識別，一律唔用。</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DONT.map((item) => (
              <figure key={item.title} className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-surface">
                  <BrandLockup className={cn("text-xl", item.className)} />
                </div>
                <figcaption className="mt-3 text-sm font-medium text-hot">{item.title}</figcaption>
              </figure>
            ))}
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>唔好加外光、斜角陰影、漸變底。</li>
            <li>唔好把青色改成熱賣紅，或把兩個引號改成同一色。</li>
            <li>深色相片上要用半透明藍遮罩，先放反白標誌。</li>
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-lg font-semibold">供應商識別</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          計劃卡上嘅供應商圖標係齊Quote 自訂色塊，方便分辨，並非電訊商官方商標。官方 logo 需另行授權先可以替換。
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PROVIDERS.map((p) => (
            <div key={p.id} className="rounded-xl bg-card p-4 shadow-[var(--shadow-border)]">
              <ProviderMark id={p.id} size="lg" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
