import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  ChevronLeft,
  Clock,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { RequestForm } from "@/components/RequestForm";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import {
  useProvider,
  useProviderReviews,
} from "@/lib/coop";
import { categoryLabel, formatRupees } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/providers/$id")({
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Worker not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        They may have stopped taking work.
      </p>
      <Button asChild variant="outline" className="mt-6 rounded-full">
        <Link to="/providers">Back to the directory</Link>
      </Button>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Worker profile — CoopConnect" },
      {
        name: "description",
        content:
          "Skills, experience, hourly rate and real reviews from neighbours nearby.",
      },
      { property: "og:title", content: "Worker profile — CoopConnect" },
      {
        property: "og:description",
        content: "Check ratings and reviews before you hire someone local.",
      },
      { property: "og:type", content: "profile" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProviderProfilePage,
});

function ProviderProfilePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: provider, isLoading } = useProvider(id);
  const { data: reviews = [] } = useProviderReviews(id);
  const [hiring, setHiring] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-40 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!provider) throw notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate({ to: "/providers" })}
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All workers
      </button>

      <header className="cc-rise mt-4 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {provider.display_name}
              </h1>
              {provider.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <BadgeCheck className="size-3.5" />
                  Verified
                </span>
              )}
            </div>
            <p className="mt-1 font-semibold text-primary">
              {categoryLabel(provider.category)}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {provider.area}
            </p>
          </div>
          <Button
            size="lg"
            className="rounded-full px-6 font-semibold"
            onClick={() => setHiring((current) => !current)}
          >
            {hiring ? <X className="size-4" /> : "Hire"}
          </Button>
        </div>

        {provider.bio && (
          <p className="mt-4 max-w-[62ch] text-sm text-muted-foreground">
            {provider.bio}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {provider.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Panel
            icon={Sparkles}
            label="Rating"
            value={
              <>
                {Number(provider.rating).toFixed(1)}
                <span className="text-sm font-semibold text-muted-foreground">
                  /5
                </span>
              </>
            }
            sub={`${provider.rating_count} review${provider.rating_count === 1 ? "" : "s"}`}
          />
          <Panel
            icon={Clock}
            label="Rate"
            value={formatRupees(provider.hourly_rate)}
            sub="per hour"
          />
          <Panel
            icon={Briefcase}
            label="Experience"
            value={`${provider.experience_years} yr`}
            sub={provider.jobs_completed > 0 ? `${provider.jobs_completed} jobs done` : "new on CoopConnect"}
          />
          <Panel
            icon={ShieldCheck}
            label="Availability"
            value={provider.available_now ? "Open" : "Bookable"}
            sub={provider.availability || "No schedule note"}
          />
        </div>
      </header>

      {hiring && (
        <section className="mt-6 rounded-3xl border border-primary/30 bg-card p-6">
          <h2 className="font-display text-lg font-bold tracking-tight">
            Send {provider.display_name.split(" ")[0]} your job
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            They'll see it right away and can accept or decline. You only pay
            them directly once the work is done.
          </p>
          <div className="mt-5">
            <RequestForm category={provider.category} providerId={provider.id} />
          </div>
        </section>
      )}

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold tracking-tight">
          Reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No reviews yet — be the first neighbour to leave one.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl bg-background p-4 ring-1 ring-border"
              >
                <div className="flex items-center justify-between gap-3">
                  <StarRating value={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString([], {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-2 flex gap-2 text-sm">
                    <Quote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    {review.comment}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  A neighbour · via CoopConnect
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Panel({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Clock;
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-background p-4 ring-1 ring-border">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 font-display text-lg font-extrabold tracking-tight">
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
