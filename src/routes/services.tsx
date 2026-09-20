import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Star } from "lucide-react";

import { CATEGORIES, formatRupees } from "@/lib/catalog";
import { useProviders } from "@/lib/coop";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services in Tumakuru — HomeEase" },
      {
        name: "description",
        content:
          "Electricians, plumbers, carpenters, cleaners, AC and appliance repair, painters, tutors and gardeners across Tumakuru — with price ranges, arrival times and ratings.",
      },
      { property: "og:title", content: "Services in Tumakuru — HomeEase" },
      {
        property: "og:description",
        content:
          "Browse every HomeEase service with transparent prices and verified local providers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: providers = [] } = useProviders();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="cc-rise max-w-[58ch]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Services
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Reliable help, right at your doorstep
        </h1>
        <p className="mt-3 text-muted-foreground">
          Every HomeEase service comes with a clear price range, a realistic
          arrival window and providers rated by people in your own Tumakuru
          neighbourhood.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const pool = providers.filter((p) => p.category === category.id);
          const rated = pool.filter((p) => Number(p.rating) > 0);
          const avg =
            rated.length > 0
              ? rated.reduce((sum, p) => sum + Number(p.rating), 0) /
                rated.length
              : 0;

          return (
            <Link
              key={category.id}
              to="/request/$category"
              params={{ category: category.id }}
              className="group flex flex-col rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                {category.emergency ? (
                  <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
                    24×7 emergency
                  </span>
                ) : null}
              </div>

              <h2 className="mt-4 font-display text-lg font-bold tracking-tight">
                {category.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {category.blurb}
              </p>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-background p-3 ring-1 ring-border">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Price range
                  </dt>
                  <dd className="mt-0.5 font-semibold">
                    {formatRupees(category.range[0])} –{" "}
                    {formatRupees(category.range[1])}
                  </dd>
                </div>
                <div className="rounded-xl bg-background p-3 ring-1 ring-border">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Arrives in
                  </dt>
                  <dd className="mt-0.5 flex items-center gap-1 font-semibold">
                    <Clock className="size-3.5 text-primary" />
                    {category.eta}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span>
                  {pool.length} provider{pool.length === 1 ? "" : "s"} available
                </span>
                {avg > 0 ? (
                  <span className="flex items-center gap-1 text-foreground">
                    <Star className="size-3.5 fill-warning text-warning" />
                    {avg.toFixed(1)}
                  </span>
                ) : null}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
