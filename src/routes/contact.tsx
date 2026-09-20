import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact HomeEase — Tumakuru support" },
      {
        name: "description",
        content:
          "Reach the HomeEase support desk in Tumakuru for booking help, provider onboarding or complaints.",
      },
      { property: "og:title", content: "Contact HomeEase" },
      {
        property: "og:description",
        content: "Support, provider onboarding and complaints for Tumakuru households.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <header className="cc-rise max-w-[56ch]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Contact
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Talk to the HomeEase desk
        </h1>
        <p className="mt-3 text-muted-foreground">
          Booking trouble, provider onboarding or a complaint about a job — send
          it here and we'll come back to you.
        </p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <form
          className="space-y-4 rounded-3xl border border-border bg-card p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
            toast.success("Message noted — we'll be in touch soon.");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-semibold">Your name</Label>
              <Input required className="mt-1.5 bg-background" placeholder="Anjali R" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Mobile number</Label>
              <Input
                required
                className="mt-1.5 bg-background"
                placeholder="+91 98450 00000"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Area in Tumakuru</Label>
            <Input className="mt-1.5 bg-background" placeholder="Ashok Nagar" />
          </div>
          <div>
            <Label className="text-sm font-semibold">How can we help?</Label>
            <Textarea
              required
              rows={5}
              className="mt-1.5 bg-background"
              placeholder="Tell us what happened, and the booking it relates to."
            />
          </div>
          <Button type="submit" size="lg" className="rounded-full px-6 font-semibold">
            Send message
          </Button>
          {sent ? (
            <p className="text-sm font-medium text-success">
              Thanks — your message is with the support desk.
            </p>
          ) : null}
        </form>

        <aside className="space-y-3">
          <Row
            icon={Phone}
            label="Support line"
            value="+91 81234 56780"
            note="Mon–Sun, 7am–10pm"
          />
          <Row
            icon={Mail}
            label="Email"
            value="help@homeease.in"
            note="Replies within one working day"
          />
          <Row
            icon={MapPin}
            label="Office"
            value="B H Road, near Gubbi Gate, Tumakuru 572101"
            note="Walk-in: Mon–Fri, 10am–5pm"
          />
          <Row
            icon={MessageSquareText}
            label="Provider onboarding"
            value="+91 81234 56781"
            note="For workers joining the board"
          />
          <p className="px-1 text-xs text-muted-foreground">
            These contact details are sample data for the prototype — share your
            real ones and we'll swap them in.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>
    </div>
  );
}
