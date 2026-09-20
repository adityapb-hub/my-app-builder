import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  CalendarCheck,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORIES, categoryLabel, formatRupees } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUS_LABELS,
  useActor,
  useCommunityTasks,
  useProviders,
  refreshAll,
} from "@/lib/coop";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — HomeEase" },
      {
        name: "description",
        content:
          "HomeEase admin console: users, providers, bookings, services and complaints.",
      },
      { property: "og:title", content: "Admin panel — HomeEase" },
      {
        property: "og:description",
        content: "Approve providers and oversee bookings across Tumakuru.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPanel,
});

const TABS = [
  { id: "users", label: "Users", icon: Users },
  { id: "providers", label: "Providers", icon: Wrench },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "services", label: "Services", icon: BadgeCheck },
  { id: "reports", label: "Reports", icon: ShieldAlert },
] as const;

function AdminPanel() {
  const { hasRole, loading } = useActor();
  const isAdmin = hasRole("admin");
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("users");

  const queryClient = useQueryClient();
  const { data: providers = [] } = useProviders();
  const { data: tasks = [] } = useCommunityTasks();

  const { data: users = [] } = useQuery({
    queryKey: ["coop", "admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone, area, city, created_at")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["coop", "admin-bookings"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*, provider:service_providers(display_name)")
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as {
        id: string;
        title: string;
        category: string;
        area: string | null;
        status: string;
        final_price: number | null;
        created_at: string;
        provider: { display_name: string } | null;
      }[];
    },
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="h-40 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This console is limited to HomeEase staff accounts.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/dashboard">Back to your dashboard</Link>
        </Button>
      </div>
    );
  }

  async function toggleApproval(id: string, verified: boolean) {
    const { error } = await supabase
      .from("service_providers")
      .update({ verified })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(verified ? "Provider approved." : "Approval withdrawn.");
    refreshAll(queryClient);
  }

  const pending = providers.filter((p) => !p.verified);
  const revenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + Number(b.final_price ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="cc-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Admin
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          HomeEase control room
        </h1>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Users" value={String(users.length)} />
        <Stat label="Providers" value={String(providers.length)} />
        <Stat label="Bookings" value={String(bookings.length)} />
        <Stat label="Completed value" value={formatRupees(revenue)} />
      </div>

      <nav className="mt-8 flex flex-wrap gap-2">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        {tab === "users" && (
          <Table
            head={["Name", "Phone", "Area", "Joined"]}
            rows={users.map((u) => [
              u.full_name || "Unnamed",
              u.phone ?? "—",
              `${u.area ?? "—"}, ${u.city}`,
              new Date(u.created_at).toLocaleDateString("en-IN"),
            ])}
            empty="No registered users yet."
          />
        )}

        {tab === "providers" && (
          <div>
            {pending.length > 0 ? (
              <p className="mb-4 rounded-xl bg-brand-soft px-4 py-2.5 text-sm font-medium text-brand-ink">
                {pending.length} provider{pending.length === 1 ? "" : "s"}
                {" "}awaiting approval.
              </p>
            ) : null}
            <ul className="space-y-2.5">
              {providers.map((provider) => (
                <li
                  key={provider.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl bg-background p-4 ring-1 ring-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {provider.display_name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {categoryLabel(provider.category)} ·{" "}
                      {provider.area ?? "Tumakuru"} · ★{" "}
                      {Number(provider.rating).toFixed(1)} ·{" "}
                      {formatRupees(Number(provider.hourly_rate))}/hr
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      provider.verified
                        ? "bg-success-soft text-success"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {provider.verified ? "Approved" : "Pending"}
                  </span>
                  <Button
                    size="sm"
                    variant={provider.verified ? "outline" : "default"}
                    className="rounded-full"
                    onClick={() =>
                      toggleApproval(provider.id, !provider.verified)
                    }
                  >
                    {provider.verified ? "Withdraw" : "Approve"}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "bookings" && (
          <Table
            head={["Job", "Service", "Provider", "Area", "Status"]}
            rows={bookings.map((b) => [
              b.title,
              categoryLabel(b.category),
              b.provider?.display_name ?? "Unassigned",
              b.area ?? "—",
              STATUS_LABELS[b.status] ?? b.status,
            ])}
            empty="No bookings placed yet."
          />
        )}

        {tab === "services" && (
          <Table
            head={["Service", "Price range", "Arrival", "Providers"]}
            rows={CATEGORIES.map((c) => [
              c.label,
              `${formatRupees(c.range[0])} – ${formatRupees(c.range[1])}`,
              c.eta,
              String(providers.filter((p) => p.category === c.id).length),
            ])}
            empty=""
          />
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            <Table
              head={["Community task", "Homes joined", "Votes", "Status"]}
              rows={tasks.map((t) => [
                t.title,
                String(t.joined_count),
                String(t.votes),
                t.status,
              ])}
              empty="No community tasks posted yet."
            />
            <p className="rounded-2xl bg-background p-4 text-sm text-muted-foreground ring-1 ring-border">
              Complaints arrive through the contact desk. Anything logged there
              is handled by the support team — a dedicated complaints inbox can
              be wired in whenever you want it.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-display text-2xl font-extrabold tracking-tight">
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Table({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: string[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {head.map((cell) => (
              <th
                key={cell}
                className="py-2 pr-4 text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border/60 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-2.5 pr-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
