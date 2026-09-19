import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { categoryIcon, categoryLabel, formatRupees } from "@/lib/catalog";
import type { Provider } from "@/lib/coop";

export function ProviderCard({
  provider,
  action = "link",
}: {
  provider: Provider;
  action?: "link" | "hire";
}) {
  const Icon = categoryIcon(provider.category);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
      <div className="flex gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand-soft text-sm font-bold text-brand-ink">
          {provider.display_name
            .split(" ")
            .slice(0, 2)
            .map((part) => part[0])
            .join("")}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-[17px] font-bold tracking-tight">
              {provider.display_name}
            </h3>
            {provider.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                <BadgeCheck className="size-3" />
                Verified
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                provider.available_now
                  ? "bg-success-soft text-success"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  provider.available_now ? "bg-success" : "bg-muted-foreground"
                }`}
              />
              {provider.available_now ? "Available now" : "Book ahead"}
            </span>
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Icon className="size-3.5" />
              {categoryLabel(provider.category)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-current text-warning" />
              {Number(provider.rating).toFixed(1)}
              <span className="text-muted-foreground">
                ({provider.rating_count})
              </span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {provider.area} · {Number(provider.distance_km).toFixed(1)} km
            </span>
          </p>

          {provider.bio && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {provider.bio}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="text-sm">
          <span className="text-xs text-muted-foreground">from </span>
          <span className="font-display text-[17px] font-bold">
            {formatRupees(Number(provider.hourly_rate))}
          </span>
          <span className="text-xs text-muted-foreground">/hr</span>
        </p>
        {action === "link" ? (
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link
              to="/providers/$id"
              params={{ id: provider.id }}
              search={{ from: "browse" }}
            >
              View profile
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" className="rounded-full">
            <Link
              to="/providers/$id"
              params={{ id: provider.id }}
              search={{ from: "hire" }}
            >
              Hire
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}
