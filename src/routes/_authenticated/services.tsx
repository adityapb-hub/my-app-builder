import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CATEGORIES } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/services")({
  head: () => ({
    meta: [
      { title: "Which service do you need? — CoopConnect" },
      {
        name: "description",
        content:
          "Choose from plumbing, electrical, cleaning, gardening, tutoring, appliance repair, elder care, painting, moving help and more.",
      },
      { property: "og:title", content: "Pick a service — CoopConnect" },
      {
        property: "og:description",
        content: "Ten household services, each with a clear starting price.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="cc-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Find help
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Which service do you need?
        </h1>
        <p className="mt-2 max-w-[52ch] text-muted-foreground">
          Not sure which one fits?{" "}
          <Link
            to="/assistant"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Describe it in your own words
          </Link>{" "}
          and the assistant will pick the category for you.
        </p>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category, index) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              to="/request/$category"
              params={{ category: category.id }}
              className="group cc-rise relative flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              style={{ animationDelay: `${index * 25}ms` }}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold tracking-tight">
                {category.label}
              </h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {category.blurb}
              </p>
              <p className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">
                  from{" "}
                  <span className="font-display font-bold text-foreground">
                    ₹{category.range[0]}
                  </span>
                  /hr
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  Request
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
