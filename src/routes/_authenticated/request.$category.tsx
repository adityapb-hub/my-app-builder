import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ChevronLeft, Sparkles } from "lucide-react";

import { ProviderCard } from "@/components/ProviderCard";
import { RequestForm } from "@/components/RequestForm";
import { useProviders } from "@/lib/coop";
import { categoryLabel, isKnownCategory } from "@/lib/catalog";

export const Route = createFileRoute(
  "/_authenticated/request/$category",
)({
  beforeLoad: ({ params }) => {
    if (!isKnownCategory(params.category)) throw redirect({ to: "/services" });
  },
  head: () => ({
    meta: [
      { title: "Service details — CoopConnect" },
      {
        name: "description",
        content:
          "Describe the problem, add photos, pick a time and share your location to get local workers moving.",
      },
      { property: "og:title", content: "Service details — CoopConnect" },
      {
        property: "og:description",
        content: "Describe the job, add photos, choose a time and location.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RequestDetails,
});

function RequestDetails() {
  const { category } = Route.useParams();
  const { data: providers = [] } = useProviders();
  const nearby = providers
    .filter((provider) => provider.category === category)
    .sort((a, b) => Number(b.rating) - Number(a.rating));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        to="/services"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All services
      </Link>

      <header className="cc-rise mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {categoryLabel(category)}
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Tell us what's going on
        </h1>
        <p className="mt-2 max-w-[52ch] text-muted-foreground">
          Plain words are better than perfect ones. Photos help a worker quote
          without a guess.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="cc-rise rounded-3xl border border-border bg-card p-6">
          <RequestForm category={category} />
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Workers near you
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Post first, then invite whoever fits — or let the best-rated
              worker claim it.
            </p>
            <div className="mt-4 space-y-3">
              {nearby.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No {categoryLabel(category).toLowerCase()} workers listed in
                  your area yet. Your request still goes out to the board.
                </p>
              ) : (
                nearby.slice(0, 4).map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))
              )}
            </div>
          </section>

          <Link
            to="/assistant"
            className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-brand-soft p-4 transition-colors hover:border-primary/60"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="text-sm">
              <span className="block font-semibold text-brand-ink">
                Not sure what to write?
              </span>
              <span className="text-muted-foreground">
                The assistant turns a sentence into a job post.
              </span>
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
