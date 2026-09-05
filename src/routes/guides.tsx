import { createFileRoute, Link } from "@tanstack/react-router";
import { GUIDES } from "@/lib/guides";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/guides")({
  component: GuidesPage,
  head: () => ({ meta: [{ title: `選購教學 · ${SITE.name}` }] }),
});

function GuidesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-title font-semibold">點揀 plan</h1>
      <p className="mt-3 text-muted">轉台、村屋、光纖同 5G 家居——先睇呢幾篇，再決定簽邊張。</p>
      <ul className="mt-10 space-y-4">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link
              to="/guides/$slug"
              params={{ slug: guide.slug }}
              className="block rounded-xl bg-card p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <p className="text-xs text-subtle">{guide.minutes} 分鐘睇完</p>
              <h2 className="mt-2 text-lg font-semibold">{guide.title}</h2>
              <p className="mt-2 text-sm text-muted">{guide.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
