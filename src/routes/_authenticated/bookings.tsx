import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  STATUS_LABELS,
  useActor,
  useMyBookings,
  useProviderJobs,
} from "@/lib/coop";
import { formatRupees } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — CoopConnect" },
      {
        name: "description",
        content:
          "Track every service request you've sent or accepted, with status, worker and price.",
      },
      { property: "og:title", content: "My bookings — CoopConnect" },
      {
        property: "og:description",
        content: "Every request and job in one list, with live status.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const { isProvider } = useActor();
  const { data: bookings = [], isLoading } = useMyBookings();
  const { data: jobs = [] } = useProviderJobs();

  const mine = bookings.filter(
    (booking) => !jobs.some((job) => job.id === booking.id),
  );
  const rows = isProvider ? [...jobs, ...mine] : bookings;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="cc-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            History
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
            My bookings
          </h1>
          <p className="mt-2 max-w-[52ch] text-muted-foreground">
            {isProvider
              ? "Requests sent to you and open jobs in your trade, newest first."
              : "Everything you've asked for, newest first."}
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full px-6 font-semibold">
          <Link to="/services">
            <Plus className="size-4" />
            New request
          </Link>
        </Button>
      </header>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <CalendarDays className="size-5" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold">Nothing yet</h2>
          <p className="mx-auto mt-1 max-w-[38ch] text-sm text-muted-foreground">
            Describe a problem once and we'll put it in front of workers nearby.
          </p>
          <Button asChild size="sm" className="mt-4 rounded-full">
            <Link to="/services">Find help</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((booking) => (
            <li key={booking.id}>
              <Link
                to="/bookings/$id"
                params={{ id: booking.id }}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {booking.title}
                    </p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {booking.provider?.display_name ?? "Waiting for a worker"} ·{" "}
                    {booking.area ?? "no area"} ·{" "}
                    {booking.preferred_date
                      ? new Date(`${booking.preferred_date}T00:00:00`).toLocaleDateString(
                          [],
                          { dateStyle: "medium" },
                        )
                      : new Date(booking.created_at).toLocaleDateString([], {
                          dateStyle: "medium",
                        })}
                  </p>
                </div>
                {booking.final_price != null && (
                  <p className="shrink-0 text-right text-sm font-semibold">
                    {formatRupees(booking.final_price)}
                  </p>
                )}
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
