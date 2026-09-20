import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Inbox,
  MapPin,
  Power,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import {
  useActor,
  useMyProvider,
  useProviderJobs,
  useUserId,
} from "@/lib/coop";
import { formatRupees } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/provider")({
  head: () => ({
    meta: [
      { title: "Job desk — HomeEase providers" },
      {
        name: "description",
        content:
          "Incoming job requests, today's schedule and your earnings at a glance.",
      },
      { property: "og:title", content: "Job desk — HomeEase providers" },
      {
        property: "og:description",
        content: "Accept work, manage your schedule and see what you've earned.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProviderDashboard,
});

function ProviderDashboard() {
  const uid = useUserId();
  const queryClient = useQueryClient();
  const { isProvider } = useActor();
  const { data: provider, isLoading } = useMyProvider();
  const { data: jobs = [] } = useProviderJobs();
  const [busy, setBusy] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-24 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!isProvider || !provider) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">
          You're registered as a seeker
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Providers get a job desk, an availability switch and an earnings
          record. Add the provider role to unlock them.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/role">Add provider role</Link>
        </Button>
      </div>
    );
  }

  if (!provider.id) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Finish registering</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your skills, rate and documents so neighbours can hire you.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/provider/register">Complete provider registration</Link>
        </Button>
      </div>
    );
  }

  const mine = jobs.filter((job) => job.provider?.user_id === uid);
  const incoming = mine.filter((job) => job.status === "searching");
  const scheduled = mine.filter((job) =>
    ["requested", "accepted", "on_the_way"].includes(job.status),
  );
  const done = mine.filter((job) => job.status === "completed");
  const earned = done.reduce(
    (sum, job) => sum + Number(job.final_price ?? 0),
    0,
  );

  async function toggleAvailability() {
    setBusy(true);
    const { error } = await supabase
      .from("service_providers")
      .update({ available_now: !provider!.available_now })
      .eq("id", provider!.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      provider!.available_now ? "Marked as busy" : "You're open for work",
    );
  }

  async function updateStatus(id: string, status: string, message: string) {
    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(message);
    queryClient.invalidateQueries({ queryKey: ["coop"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="cc-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Job desk
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
            {provider.display_name}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {provider.area} · {formatRupees(provider.hourly_rate)}/hr
            {provider.verified && (
              <span className="ml-1 inline-flex items-center gap-1 text-success">
                <BadgeCheck className="size-3.5" />
                verified
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={provider.available_now ? "default" : "outline"}
            onClick={toggleAvailability}
            disabled={busy}
            className="rounded-full"
          >
            <Power className="size-4" />
            {provider.available_now ? "Available" : "Unavailable"}
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/provider/earnings">Earnings</Link>
          </Button>
        </div>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        <Stat icon={Inbox} label="New requests" value={String(incoming.length)} />
        <Stat
          icon={CalendarDays}
          label="Scheduled"
          value={String(scheduled.length)}
        />
        <Stat icon={CheckCircle2} label="Completed" value={String(done.length)} />
        <Stat icon={Star} label="Rating" value={Number(provider.rating).toFixed(1)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Requests for you
            </h2>
            {incoming.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing waiting. New jobs in {provider.category} appear here the
                moment a neighbour posts one.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {incoming.map((job) => (
                  <li
                    key={job.id}
                    className="rounded-2xl bg-background p-4 ring-1 ring-border"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {job.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {job.area ?? "no area"} ·{" "}
                          {job.preferred_date ?? "flexible"}{" "}
                          {job.preferred_time ?? ""}
                          {job.quoted_price
                            ? ` · budget ${formatRupees(job.quoted_price)}`
                            : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                        {job.status === "searching" ? "Open" : "Invited"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() =>
                          updateStatus(
                            job.id,
                            "accepted",
                            "Job accepted — the neighbour is notified.",
                          )
                        }
                      >
                        Take it
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() =>
                          updateStatus(job.id, "declined", "Declined.")
                        }
                      >
                        <X className="size-3.5" />
                        Decline
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Up next
            </h2>
            {scheduled.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Accepted jobs land here with the address and the neighbour's
                notes.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {scheduled.map((job) => (
                  <li key={job.id}>
                    <Link
                      to="/bookings/$id"
                      params={{ id: job.id }}
                      className="flex items-center gap-3 rounded-2xl bg-background p-4 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {job.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {job.area ?? "no area"} ·{" "}
                          {job.preferred_date ?? "flexible"} {job.preferred_time ?? ""}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold tracking-tight">
              This month
            </h2>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight">
              {formatRupees(earned)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              from {done.length} completed job{done.length === 1 ? "" : "s"} ·
              paid straight to you.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-full">
              <Link to="/provider/earnings">Open earnings</Link>
            </Button>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Keep your rating up
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Message the neighbour before you set out.</li>
              <li>Agree the total price before you close a job.</li>
              <li>Keep your availability switch honest.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({

  icon: Icon,
  label,
  value,
}: {
  icon: typeof Inbox;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-primary">
        <Icon className="size-4" />
      </span>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-tight">
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
