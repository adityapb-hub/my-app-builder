import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, MapPin, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TUMAKURU_AREAS } from "@/lib/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About HomeEase — local home services in Tumakuru" },
      {
        name: "description",
        content:
          "HomeEase connects Tumakuru households with verified local electricians, plumbers, cleaners and tutors, at prices set by the workers themselves.",
      },
      { property: "og:title", content: "About HomeEase" },
      {
        property: "og:description",
        content:
          "Why HomeEase exists, how we verify providers and which Tumakuru areas we cover.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <header className="cc-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          About us
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Built in Tumakuru, for Tumakuru
        </h1>
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted-foreground">
          Finding a dependable electrician or plumber in town still runs on
          phone numbers passed between neighbours. HomeEase turns that word of
          mouth into something you can search: verified workers, honest price
          ranges, and a booking you can follow from request to completion.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card
          icon={ShieldCheck}
          title="Verified providers"
          body="Every provider uploads an ID proof and, where relevant, a trade certificate before appearing on the board. Ratings come only from completed jobs."
        />
        <Card
          icon={Wallet}
          title="No hidden commission"
          body="Workers set their own hourly rate and you see it before you book. Payment happens directly between you and the provider."
        />
        <Card
          icon={MapPin}
          title="Neighbourhood first"
          body="Providers list the areas they actually serve, so the person who arrives is genuinely nearby — not two towns away."
        />
        <Card
          icon={HeartHandshake}
          title="Community jobs"
          body="Apartments and layouts can post shared work — tank cleaning, plantation drives, festival setup — and split the cost between households."
        />
      </div>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold tracking-tight">
          Areas we cover
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TUMAKURU_AREAS.map((area) => (
            <span
              key={area}
              className="rounded-full bg-background px-3 py-1.5 text-sm font-medium ring-1 ring-border"
            >
              {area}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Outside these areas? Post your job anyway — providers on the ring road
          often travel further for scheduled work.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg" className="rounded-full px-6 font-semibold">
          <Link to="/services">Browse services</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-full px-6 font-semibold"
        >
          <Link to="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <span className="grid size-10 place-items-center rounded-xl bg-success-soft text-success">
        <Icon className="size-5" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  );
}
