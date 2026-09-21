import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getAdLanding } from "@/lib/ad-landings";

export const Route = createFileRoute("/go/$dest")({
  beforeLoad: ({ params }) => {
    const landing = getAdLanding(params.dest);
    if (!landing) throw notFound();
    throw redirect({
      to: "/plans",
      search: landing.search,
    });
  },
  component: () => null,
});
