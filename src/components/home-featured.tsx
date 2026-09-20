import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { getPlan } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";

const FEATURED_IDS = [
  "hkbn-ftth-1000-36m-98",
  "hgc-ftth-1000-public-36m",
  "cmhk-home5g-350-48-88",
  "three-45g-10-58",
] as const;

export function HomeFeatured() {
  const featured = FEATURED_IDS.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const { t } = useI18n();

  return (
    <section className="home-below-fold bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div>
          <h2 className="home-section-title">{t("featuredTitle")}</h2>
          <p className="home-section-lead">{t("featuredLead")}</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {featured.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
        <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
          <Link to="/plans" search={{ cat: "broadband" }}>
            {t("seeAllPlans")}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
