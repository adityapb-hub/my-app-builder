import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { ProviderCard } from "@/components/ProviderCard";
import { Input } from "@/components/ui/input";
import { useProviders } from "@/lib/coop";
import { CATEGORIES } from "@/lib/catalog";

type Search = { category?: string };

export const Route = createFileRoute("/_authenticated/providers")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    category:
      typeof search.category === "string" && search.category
        ? search.category
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nearby workers — CoopConnect" },
      {
        name: "description",
        content:
          "Compare verified local service providers by distance, rating and starting price.",
      },
      { property: "og:title", content: "Nearby workers — CoopConnect" },
      {
        property: "og:description",
        content: "Verified local workers, sorted by distance and rating.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProvidersPage,
});

type Sort = "nearby" | "top" | "price";

function ProvidersPage() {
  const { category } = Route.useSearch();
  const { data: providers = [], isLoading } = useProviders();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("nearby");
  const [active, setActive] = useState<string>(category ?? "all");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return providers
      .filter((provider) => active === "all" || provider.category === active)
      .filter(
        (provider) =>
          !term ||
          provider.display_name.toLowerCase().includes(term) ||
          provider.area.toLowerCase().includes(term) ||
          provider.bio.toLowerCase().includes(term),
      )
      .sort((a, b) => {
        if (sort === "top") return Number(b.rating) - Number(a.rating);
        if (sort === "price") return Number(a.hourly_rate) - Number(b.hourly_rate);
        return Number(a.distance_km) - Number(b.distance_km);
      });
  }, [providers, active, query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="cc-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Find help
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Workers near you
        </h1>
        <p className="mt-2 max-w-[54ch] text-muted-foreground">
          Every profile shows a starting price and ratings from neighbours who
          actually hired them. Nobody pays CoopConnect a cut.
        </p>
      </header>

      <div className="sticky top-[68px] z-10 -mx-4 mt-6 bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, area or skill"
              className="rounded-full bg-card pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary p-1">
            {(
              [
                ["nearby", "Nearest"],
                ["top", "Top rated"],
                ["price", "Lowest price"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSort(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  sort === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <Chip label="All" active={active === "all"} onClick={() => setActive("all")} />
          {CATEGORIES.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              active={active === item.id}
              onClick={() => setActive(item.id)}
            />
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[132px] animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <SlidersHorizontal className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">
            No workers match that yet
          </h2>
          <p className="mx-auto mt-1 max-w-[38ch] text-sm text-muted-foreground">
            Try another category or clear the search. New providers join every
            week.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {visible.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
