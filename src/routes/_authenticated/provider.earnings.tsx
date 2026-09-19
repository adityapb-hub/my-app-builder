import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Banknote, CalendarCheck, Receipt, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMyProvider, useProviderJobs } from "@/lib/coop";
import { formatRupees } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/provider/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — CoopConnect providers" },
      {
        name: "description",
        content:
          "Your day, week and month totals with a full ledger of completed jobs.",
      },
      { property: "og:title", content: "Earnings — CoopConnect providers" },
      {
        property: "og:description",
        content: "See what you earned, job by job — no commission taken out.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EarningsPage,
});

function EarningsPage() {
  const { data: provider } = useMyProvider();
  const { data: jobs = [] } = useProviderJobs();

  const completed = useMemo(
    () =>
      jobs
        .filter(
          (job) =>
            job.status === "completed" &&
            job.provider?.user_id === provider?.user_id,
        )
        .sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        ),
    [jobs, provider?.user_id],
  );

  const totals = useMemo(() => {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    const sums = { today: 0, week: 0, month: 0, all: 0 };
    for (const job of completed) {
      const amount = Number(job.final_price ?? 0);
      const at = new Date(job.updated_at).getTime();
      sums.all += amount;
      if (at >= startOfDay) sums.today += amount;
      if (at >= now - 7 * 86400_000) sums.week += amount;
      if (at >= now - 30 * 86400_000) sums.month += amount;
    }
    return sums;
  }, [completed]);

  if (!provider) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">No earnings yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register as a provider to start logging jobs.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/provider/register">Register as a provider</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="cc-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Money
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Your earnings
        </h1>
        <p className="mt-2 max-w-[52ch] text-muted-foreground">
          Neighbours pay you directly, so there's nothing held back and no
          withdrawal to wait for. This is your record of what came in.
        </p>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Money icon={CalendarCheck} label="Today" value={totals.today} tone="primary" />
        <Money icon={TrendingUp} label="Last 7 days" value={totals.week} tone="success" />
        <Money icon={Banknote} label="Last 30 days" value={totals.month} tone="primary" />
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight">
              Job ledger
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {completed.length} completed · {formatRupees(totals.all)} earned all
              time
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => {
              const rows = [
                ["date", "job", "category", "area", "amount"],
                ...completed.map((job) => [
                  new Date(job.updated_at).toISOString().slice(0, 10),
                  job.title,
                  job.category,
                  job.area ?? "",
                  String(job.final_price ?? 0),
                ]),
              ];
              const csv = rows
                .map((row) =>
                  row
                    .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
                    .join(","),
                )
                .join("\n");
              const url = URL.createObjectURL(
                new Blob([csv], { type: "text/csv;charset=utf-8" }),
              );
              const link = document.createElement("a");
              link.href = url;
              link.download = "coopconnect-earnings.csv";
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Receipt className="size-3.5" />
            Download statement
          </Button>
        </div>

        {completed.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Completed jobs show up here with the price you agreed.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {completed.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{job.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {job.area ?? "no area"} ·{" "}
                    {new Date(job.updated_at).toLocaleDateString([], {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                <p className="font-display text-base font-bold">
                  {formatRupees(job.final_price)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Money({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Banknote;
  label: string;
  value: number;
  tone: "primary" | "success";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <span
        className={`grid size-9 place-items-center rounded-xl ${
          tone === "primary"
            ? "bg-brand-soft text-primary"
            : "bg-success-soft text-success"
        }`}
      >
        <Icon className="size-4" />
      </span>
      <p className="mt-3 font-display text-2xl font-extrabold tracking-tight">
        {formatRupees(value)}
      </p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
