import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadWaClickReport } from "@/lib/track-fn";
import { SITE } from "@/lib/site";
import {
  defaultWaClickRange,
  waClickDetailCsv,
  waClickPresetRange,
  waClickProviderCsv,
  waClickReportError,
  type WaClickReport,
} from "@/lib/wa-click-report";

const TOKEN_KEY = "chaiquote-wa-report";

export const Route = createFileRoute("/ops_/wa-clicks")({
  component: WaClickReportPage,
  head: () => ({
    meta: [
      { title: `WhatsApp 點擊報告 · ${SITE.name}` },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "內部 WhatsApp 點擊報告，按電訊商同分日。" },
    ],
  }),
});

function downloadCsv(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function WaClickReportPage() {
  const initial = defaultWaClickRange();
  const [token, setToken] = useState("");
  const [from, setFrom] = useState(initial.from);
  const [until, setUntil] = useState(initial.until);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<WaClickReport | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(TOKEN_KEY);
      if (saved) setToken(saved);
    } catch {
      /* private mode */
    }
  }, []);

  function persistToken(value: string) {
    setToken(value);
    try {
      sessionStorage.setItem(TOKEN_KEY, value);
    } catch {
      /* ignore */
    }
  }

  async function load(nextFrom = from, nextUntil = until) {
    setBusy(true);
    setError("");
    try {
      const result = await loadWaClickReport({ data: { token, from: nextFrom, until: nextUntil } });
      if (!result.ok) {
        setReport(null);
        setError(waClickReportError(result.reason));
        return;
      }
      setReport(result.report);
    } catch {
      setReport(null);
      setError(waClickReportError("query-failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-xs font-medium tracking-wider text-subtle">STAFF ONLY · NOINDEX</p>
      <h1 className="mt-2 text-title font-semibold">WhatsApp 點擊報告</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        計客戶撳 WhatsApp（<code>wa_click</code>）嘅次數，按電訊商同分日。鎖匙同電訊新聞編輯枱一樣，用
        <code> INTEREST_TOKEN </code>
        或 <code>STATS_TOKEN</code>。預設最近 7 日（香港時間），最長 93 日。無綁定計劃嘅點擊（頁頭、頁尾）會歸入「未標示」。
        呢頁只係讀取報告，唔會改 Google Ads，亦唔會改 WhatsApp 跳轉。
      </p>

      <form
        className="mt-8 space-y-4 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
        onSubmit={(event) => {
          event.preventDefault();
          void load();
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
            placeholder="INTEREST_TOKEN 或 STATS_TOKEN"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            由
            <Input className="mt-1" type="date" value={from} onChange={(event) => setFrom(event.target.value)} required />
          </label>
          <label className="block text-sm font-medium">
            至
            <Input className="mt-1" type="date" value={until} onChange={(event) => setUntil(event.target.value)} required />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={busy}>
            {busy ? "查緊…" : "查詢"}
          </Button>
          {(
            [
              ["7d", "最近 7 日"],
              ["today", "今日"],
              ["yesterday", "昨日"],
            ] as const
          ).map(([preset, label]) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                const range = waClickPresetRange(preset);
                setFrom(range.from);
                setUntil(range.until);
                void load(range.from, range.until);
              }}
            >
              {label}
            </Button>
          ))}
        </div>
      </form>

      {error ? <p className="mt-4 text-sm text-hot">{error}</p> : null}

      {report ? (
        <section className="mt-8 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs tracking-wider text-muted">
                {report.from} 至 {report.until}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{report.matched} 次點擊</p>
              {report.truncated ? (
                <p className="mt-1 text-sm text-hot">
                  只計入最近 {report.total.toLocaleString("zh-HK")} 筆。更早嘅點擊未計入下面分項。
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadCsv(`wa-clicks-${report.from}-${report.until}.csv`, waClickProviderCsv(report))}
              >
                下載電訊商 CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => downloadCsv(`wa-clicks-detail-${report.from}-${report.until}.csv`, waClickDetailCsv(report))}
              >
                下載明細 CSV
              </Button>
            </div>
          </div>

          {report.total === 0 ? <p className="text-sm text-muted">呢段日期冇 WhatsApp 點擊。</p> : null}

          <CountTable
            title="按電訊商"
            columns={["電訊商", "點擊", "佔比"]}
            rows={report.byProvider.map((row) => [row.label, String(row.count), `${row.share}%`])}
          />
          <DayTable report={report} />
          <CountTable
            title="按計劃"
            empty="呢批點擊冇綁定計劃（例如頁頭、頁尾）。"
            columns={["計劃", "電訊商", "點擊"]}
            rows={report.byPlan.map((row) => [row.planId, row.providerLabel, String(row.count)])}
          />
          <CountTable
            title="按來源"
            columns={["來源", "點擊"]}
            rows={report.bySource.map((row) => [row.label, String(row.count)])}
          />
          <CountTable
            title="按類別"
            columns={["類別", "點擊"]}
            rows={report.byCategory.map((row) => [row.label, String(row.count)])}
          />
          <CountTable
            title="按樓宇類型"
            empty="呢批點擊冇樓宇類型。"
            columns={["樓宇類型", "點擊"]}
            rows={report.byHousing.map((row) => [row.label, String(row.count)])}
          />
        </section>
      ) : null}
    </div>
  );
}

function CountTable({
  title,
  columns,
  rows,
  empty,
}: {
  title: string;
  columns: string[];
  rows: string[][];
  empty?: string;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{empty ?? "冇資料。"}</p>
      ) : (
        <div className="mt-2 overflow-x-auto rounded-xl bg-card shadow-[var(--shadow-border)]">
          <table className="w-full text-left text-sm">
            <thead className="text-xs tracking-wider text-muted">
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-3 py-2 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.join("\0")} className="border-t border-border">
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className="px-3 py-2 tabular-nums">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DayTable({ report }: { report: WaClickReport }) {
  const rows = report.byDay.flatMap((day) =>
    day.providers.map((provider) => [day.day, provider.label, String(provider.count), String(day.count)]),
  );
  return (
    <CountTable title="按日期 × 電訊商" columns={["日期", "電訊商", "點擊", "當日合計"]} rows={rows} />
  );
}
