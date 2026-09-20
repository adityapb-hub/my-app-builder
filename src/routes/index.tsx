import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Handshake, ShieldCheck, Tags, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "HomeEase — Connecting Communities with Trusted Local Services",
      },
      {
        name: "description",
        content:
          "Hire verified local workers at clear prices, or post a collective job your whole society can join and split. Plumbing, electrical, cleaning, gardening, tutoring, elder care and more.",
      },
      {
        property: "og:title",
        content: "HomeEase — Connecting Communities with Trusted Local Services",
      },
      {
        property: "og:description",
        content:
          "Book trusted neighbourhood workers, manage jobs as a provider, and organise community tasks together.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-background">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 cc-grid-bg opacity-60" />
        <div className="pointer-events-none absolute -top-24 -left-24 size-[420px] rounded-full bg-brand-soft blur-[110px]" />
        <div className="pointer-events-none absolute top-10 -right-20 size-[360px] rounded-full bg-success-soft blur-[110px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="cc-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="size-1.5 rounded-full bg-success cc-live" />
              Serving Tumakuru neighbourhoods
            </span>

            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.03] tracking-tight text-balance sm:text-6xl">
              Your society's
              <br />
              <span className="text-primary">trusted list</span>, at last.
            </h1>

            <p className="mt-5 max-w-[46ch] text-pretty text-[17px] leading-relaxed text-muted-foreground">
              Connecting communities with trusted local services — book verified
              workers at transparent prices, or rally your building for a
              collective job and split the bill.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7 text-[15px] font-semibold">
                <Link to="/auth">
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-6 text-[15px] font-semibold"
              >
                <Link to="/providers">Browse workers</Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Offering services?{" "}
              <Link
                to="/provider/register"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Register as a provider
              </Link>
            </p>
          </div>

          <div className="cc-rise relative" style={{ animationDelay: "80ms" }}>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Kitchen sink clog
                </p>
                <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                  Available now
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <PreviewRow
                  name="Rajesh Kumar"
                  meta="Plumbing · 2.5 km · since 2011"
                  price="₹300/hr"
                  rating="4.8"
                  tone="primary"
                />
                <PreviewRow
                  name="Imran Ali"
                  meta="Electrical · 1.8 km · licensed"
                  price="₹350/hr"
                  rating="4.9"
                  tone="success"
                />
                <PreviewRow
                  name="Meera Iyer"
                  meta="Elder care · 1.2 km · trained"
                  price="₹600/hr"
                  rating="5.0"
                  tone="primary"
                />
              </div>

              <div className="mt-5 rounded-2xl bg-background p-4 ring-1 ring-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Apartment cleaning drive
                  </span>
                  <span className="font-semibold">18 / 24 homes</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  ₹120 per household · Saturday 3 Oct
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            What people book
          </h2>
          <Link
            to="/providers"
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            See all workers
          </Link>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to="/providers"
                search={{ category: category.id }}
                className="group rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-[18px]" />
                </span>
                <p className="mt-3 text-sm font-semibold">{category.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {category.blurb} · from ₹{category.range[0]}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-3">
          <Pillar
            icon={Tags}
            title="Clear prices, no middlemen"
            body="Workers set their own rates and you see them before you book. No commission quietly taken out of the job."
          />
          <Pillar
            icon={ShieldCheck}
            title="Verified, rated, local"
            body="ID-checked workers with ratings from real neighbours, sorted by how close they actually are."
          />
          <Pillar
            icon={Users}
            title="Built for communities"
            body="Post a collective job — tank cleaning, a puja pandal, a plantation drive — and let households join and split."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-8 rounded-3xl border border-border bg-card p-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Handshake className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                Three sides, one board
              </span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
              Pick the side you're on.
            </h2>
            <p className="mt-2 max-w-[52ch] text-muted-foreground">
              Need someone in? Choose Service Seeker. Fixing things for a living?
              Choose Service Provider and get a job desk with requests, schedule
              and earnings.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full px-7 text-[15px] font-semibold">
            <Link to="/auth">
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function PreviewRow({
  name,
  meta,
  price,
  rating,
  tone,
}: {
  name: string;
  meta: string;
  price: string;
  rating: string;
  tone: "primary" | "success";
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-background p-3 ring-1 ring-border">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${
          tone === "primary"
            ? "bg-brand-soft text-brand-ink"
            : "bg-success-soft text-success"
        }`}
      >
        {name
          .split(" ")
          .slice(0, 2)
          .map((part) => part[0])
          .join("")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{price}</p>
        <p className="text-xs text-muted-foreground">★ {rating}</p>
      </div>
    </div>
  );
}

function Pillar({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Tags;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <span className="grid size-10 place-items-center rounded-xl bg-success-soft text-success">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
