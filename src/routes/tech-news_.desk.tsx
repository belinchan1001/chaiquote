import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { draftTechNews, publishTechNews } from "@/lib/tech-news-ask";
import { TECH_NEWS_CATEGORIES, techNewsCopy, type TechNewsArticle, type TechNewsCategoryId } from "@/lib/tech-news";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { SITE } from "@/lib/site";

const TOKEN_KEY = "chaiquote-news-desk";

export const Route = createFileRoute("/tech-news_/desk")({
  component: TechNewsDesk,
  head: () => ({
    meta: [
      { title: `電訊新聞編輯枱 · ${SITE.name}` },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
});

function TechNewsDesk() {
  usePageTitle(`電訊新聞編輯枱 · ${SITE.name}`);
  const { locale } = useI18n();
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [category, setCategory] = useState<TechNewsCategoryId>("telecom");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [busy, setBusy] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");
  const [article, setArticle] = useState<TechNewsArticle | null>(null);
  const [publishedSlug, setPublishedSlug] = useState("");
  const copy = useMemo(() => (article ? techNewsCopy(article, locale) : null), [article, locale]);

  function persistToken(value: string) {
    setToken(value);
    try {
      sessionStorage.setItem(TOKEN_KEY, value);
    } catch {
      /* ignore */
    }
  }

  async function onDraft() {
    setBusy("draft");
    setError("");
    setPublishedSlug("");
    try {
      const result = await draftTechNews({
        data: { token, category, sourceUrl, sourceText },
      });
      if (!result.ok) {
        setArticle(null);
        setError(result.message);
        return;
      }
      setArticle(result.article);
    } catch {
      setError("出稿失敗，請稍後再試。");
    } finally {
      setBusy(null);
    }
  }

  async function onPublish() {
    if (!article) return;
    setBusy("publish");
    setError("");
    try {
      const result = await publishTechNews({ data: { token, article } });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setPublishedSlug(result.slug);
    } catch {
      setError("上架失敗。可以複製稿件，喺對話確認後由編輯寫入。");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="text-sm text-muted">
        <Link to="/tech-news" className="hover:text-fg">
          電訊新聞
        </Link>
        <span aria-hidden="true"> / </span>
        <span>編輯枱</span>
      </nav>
      <p className="mt-6 text-xs font-medium tracking-wider text-subtle">STAFF ONLY · NOINDEX</p>
      <h1 className="mt-2 text-title font-semibold">電訊新聞編輯枱</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        貼官方連結或原文，AI
        按記者規範出稿。你要睇過，撳確認先會上線。價錢、日期、規格只跟來源；無寫死就唔估。
      </p>

      <form
        className="mt-8 space-y-4 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
        onSubmit={(event) => {
          event.preventDefault();
          void onDraft();
        }}
      >
        <label className="block text-sm font-medium">
          編輯鎖匙
          <Input
            className="mt-1"
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => persistToken(event.target.value)}
            placeholder="INTEREST_TOKEN 或 TECH_NEWS_DESK_KEY"
          />
        </label>
        <label className="block text-sm font-medium">
          專區
          <select
            className="mt-1 flex h-11 w-full rounded-md bg-bg px-3 text-base shadow-[var(--shadow-border)]"
            value={category}
            onChange={(event) => setCategory(event.target.value as TechNewsCategoryId)}
          >
            {TECH_NEWS_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          來源網址（可選）
          <Input
            className="mt-1"
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://"
          />
        </label>
        <label className="block text-sm font-medium">
          原文（無連結就必填）
          <textarea
            className="mt-1 min-h-40 w-full rounded-md bg-bg px-3 py-3 text-base text-fg shadow-[var(--shadow-border)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder="貼官方新聞稿、電訊商公告或要改寫嘅原文。"
          />
        </label>
        <Button type="submit" disabled={busy !== null}>
          {busy === "draft" ? "出緊稿…" : "出稿預覽"}
        </Button>
      </form>

      {error ? <p className="mt-4 text-sm text-hot">{error}</p> : null}

      {copy && article ? (
        <section className="mt-10">
          <p className="text-xs text-subtle">
            預覽 · {article.published} · {article.minutes} 分鐘 · {article.slug}
          </p>
          <h2 className="mt-2 text-title font-semibold">{copy.h1}</h2>
          <p className="mt-3 text-muted">{copy.excerpt}</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
            {copy.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {copy.body.map((section) => (
            <div key={section.heading} className="mt-6">
              <h3 className="font-semibold">{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
          <p className="mt-6 text-sm text-muted">{copy.editorNote}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button" disabled={busy !== null || Boolean(publishedSlug)} onClick={() => void onPublish()}>
              {busy === "publish" ? "上架緊…" : publishedSlug ? "已上架" : "確認上架"}
            </Button>
            {publishedSlug ? (
              <Button asChild variant="outline">
                <Link to="/tech-news/$slug" params={{ slug: publishedSlug }}>
                  開已上架頁
                </Link>
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
