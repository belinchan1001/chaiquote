import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { newsWhatsAppHref, shareOrCopyNews } from "@/lib/news-share";

export function NewsShareBar({ title, url }: { title: string; url: string }) {
  const { t, locale } = useI18n();
  const isEn = locale === "en";
  const [cue, setCue] = useState<"idle" | "copied" | "failed">("idle");

  async function onShare() {
    const result = await shareOrCopyNews(title, url);
    if (result === "aborted") return;
    if (result === "shared" || result === "copied") {
      setCue("copied");
      window.setTimeout(() => setCue("idle"), 2000);
      return;
    }
    setCue("failed");
    window.setTimeout(() => setCue("idle"), 2000);
  }

  const label = cue === "copied" ? t("shareCopied") : cue === "failed" ? t("shareFailed") : t("share");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onShare} aria-label={label}>
        <Share2 />
        {label}
      </Button>
      <Button variant="whatsapp" size="sm" asChild>
        <a href={newsWhatsAppHref(title, url)} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      </Button>
      <span className="sr-only">{isEn ? "Share this story" : "分享呢篇新聞"}</span>
    </div>
  );
}
