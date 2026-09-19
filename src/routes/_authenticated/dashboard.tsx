import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  HandCoins,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORIES, formatRupees } from "@/lib/catalog";
import {
  STATUS_LABELS,
  useActor,
  useCommunityTasks,
  useMyBookings,
  useMyProvider,
  useProviderJobs,
} from "@/lib/coop";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your desk — CoopConnect" },
      {
        name: "description",
        content:
          "Your CoopConnect home: active bookings, jobs, earnings and community tasks.",
      },
      { property: "og:title", content: "Your desk — CoopConnect" },
      {
        property: "og:description",
        content: "Active bookings, jobs and community tasks in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const OPEN = ["searching", "requested", "accepted", "on_the_way"];

function Dashboard() {
  const { isProvider, isSeeker, roles } = useActor();
  const { data: bookings = [] } = useMyBookings();
  const { data: provider } = useMyProvider();
  const { data: jobs = [] } = useProviderJobs();
  const { data: tasks = [] } = useCommunityTasks();

  const active = bookings.filter((booking) => OPEN.includes(booking.status));
  const openJobs = jobs.filter((job) => job.status === "searching");
  const earned = jobs
    .filter((job) => job.status === "completed")
    .reduce((sum, job) => sum + Number(job.final_price ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="cc-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Your desk
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
            {greeting()}
          </h1>
          <p className="mt-2 max-w-[52ch] text-muted-foreground">
            {isProvider
              ? "Here's what's on the board today."
              : "Pick a service, or see what your neighbours are organising."}
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full px-6 font-semibold">
          <Link to="/services">
            Book something
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      {roles.length === 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-brand-soft p-5">
          <p className="text-sm font-medium text-brand-ink">
            Tell us who you are so we can show the right screen.
          </p>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/role">Pick your role</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Active bookings
              </h2>
              <Link
                to="/bookings"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                All bookings
              </Link>
            </div>

            {active.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="font-display text-base font-bold">
                  Nothing running right now
                </p>
                <p className="mx-auto mt-1 max-w-[36ch] text-sm text-muted-foreground">
                  Describe a problem in plain words and we'll line up workers
                  near you.
                </p>
                <Button asChild size="sm" className="mt-4 rounded-full">
                  <Link to="/assistant">
                    <Sparkles className="size-4" />
                    Ask the assistant
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {active.slice(0, 3).map((booking) => (
                  <li key={booking.id}>
                    <Link
                      to="/bookings/$id"
                      params={{ id: booking.id }}
                      className="flex items-center gap-3 rounded-2xl bg-background p-4 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-sm"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary">
                        <CalendarDays className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {booking.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {booking.provider?.display_name ?? "Finding a worker…"}{" "}
                          · {booking.area ?? "No area yet"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {isProvider && (
            <section className="mt-4 rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold tracking-tight">
                  Provider snapshot
                </h2>
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to="/provider">Open job desk</Link>
                </Button>
              </div>
              {!provider ? (
                <div className="mt-4 rounded-2xl border border-dashed border-border p-6">
                  <p className="text-sm font-semibold">
                    Your provider profile isn't published yet
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your skills, rate and documents to start receiving
                    requests.
                  </p>
                  <Button asChild size="sm" className="mt-3 rounded-full">
                    <Link to="/provider/register">Finish registration</Link>
                  </Button>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MiniStat
                    icon={Sparkles}
                    label="Open jobs"
                    value={String(openJobs.length)}
                  />
                  <MiniStat
                    icon={CalendarDays}
                    label="Scheduled"
                    value={String(
                      jobs.filter((job) => job.status === "accepted").length,
                    )}
                  />
                  <MiniStat
                    icon={Star}
                    label="Rating"
                    value={Number(provider.rating).toFixed(1)}
                  />
                  <MiniStat
                    icon={HandCoins}
                    label="Earned"
                    value={formatRupees(earned)}
                  />
                </div>
              )}
            </section>
          )}
        </div>

        <div className="space-y-4">
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h2 className="font-display text-lg font-bold tracking-tight">
                Community board
              </h2>
            </div>
            {tasks.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No community tasks posted yet — start one for your society.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {tasks.slice(0, 3).map((task) => (
                  <li key={task.id}>
                    <Link
                      to="/community/$id"
                      params={{ id: task.id }}
                      className="block rounded-2xl bg-background p-3 ring-1 ring-border transition-colors hover:border-primary/40"
                    >
                      <p className="truncate text-sm font-semibold">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {task.joined_count} homes ·{" "}
                        {formatRupees(Number(task.cost_per_household))} per home
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" size="sm" className="mt-4 w-full rounded-full">
              <Link to="/community">Open the board</Link>
            </Button>
          </section>

          {isSeeker && (
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Popular services
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {CATEGORIES.slice(0, 6).map((category) => {
                  const Icon = category.icon;
                  return (
                    <Link
                      key={category.id}
                      to="/request/$category"
                      params={{ category: category.id }}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Icon className="size-3.5 shrink-0" />
                      <span className="truncate">{category.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-background p-3 ring-1 ring-border">
      <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-primary">
        <Icon className="size-4" />
      </span>
      <p className="mt-2 font-display text-xl font-extrabold tracking-tight">
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
