import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppTip } from "@/components/whatsapp-tip";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import type { MessageKey } from "@/lib/messages";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: `私隱政策 · ${SITE.name}` }] }),
});

const SECTIONS: { title: MessageKey; body: MessageKey }[] = [
  { title: "privacyController", body: "privacyControllerText" },
  { title: "privacyCollect", body: "privacyCollectText" },
  { title: "privacyUse", body: "privacyUseText" },
  { title: "privacyContactHow", body: "privacyContactHowText" },
  { title: "privacyThird", body: "privacyThirdText" },
  { title: "privacyKeep", body: "privacyKeepText" },
  { title: "privacyOverseas", body: "overseasNote" },
  { title: "privacyRights", body: "privacyRightsText" },
  { title: "privacyUpdate", body: "privacyUpdateText" },
];

function PrivacyPage() {
  const { t, updated } = useI18n();
  usePageTitle(`${t("privacyTitle")} · ${SITE.name}`);
  const vars = { phone: SITE.phoneDisplay, date: updated, name: SITE.name };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-title font-semibold">{t("privacyTitle")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">{t("privacyLead")}</p>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mt-8">
          <h2 className="text-lg font-semibold">{t(section.title)}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t(section.body, vars)}</p>
        </section>
      ))}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <QuoteLink showNumber />
        <Button asChild variant="outline">
          <Link to="/quote">{t("formQuote")}</Link>
        </Button>
      </div>
      <WhatsAppTip className="mt-3" />
    </div>
  );
}
