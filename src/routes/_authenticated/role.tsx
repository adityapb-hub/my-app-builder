import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Hammer, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useActor, useUserId } from "@/lib/coop";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/role")({
  head: () => ({
    meta: [
      { title: "Who are you? — CoopConnect" },
      {
        name: "description",
        content:
          "Choose whether you're on CoopConnect to hire someone or to offer your services.",
      },
      { property: "og:title", content: "Pick your side — CoopConnect" },
      {
        property: "og:description",
        content: "Service Seeker or Service Provider — you can be both.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RolePage,
});

const OPTIONS = [
  {
    role: "seeker" as const,
    icon: UserRound,
    title: "Service Seeker",
    line: "I want to hire someone.",
    detail:
      "Browse verified workers near you, see starting prices, and book in a few taps.",
  },
  {
    role: "provider" as const,
    icon: Hammer,
    title: "Service Provider",
    line: "I want to offer services.",
    detail:
      "Publish your skills and rate, take the jobs you want, and track earnings — no commission taken.",
  },
];

function RolePage() {
  const uid = useUserId();
  const { roles } = useActor();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function choose(role: "seeker" | "provider") {
    if (!uid) return;
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: uid, role });
    if (error) {
      if (error.code === "23505") {
        // Already holds this role — carry on.
      } else {
        toast.error(error.message);
        return;
      }
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
    navigate({
      to: role === "provider" ? "/provider/register" : "/services",
      replace: true,
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Step one
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
        Who are you?
      </h1>
      <p className="mt-2 max-w-[48ch] text-muted-foreground">
        Most neighbours are both — you hire a plumber one week and help your
        society organise the next. Pick what you came here to do first.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = roles.includes(option.role);
          return (
            <button
              key={option.role}
              type="button"
              onClick={() => choose(option.role)}
              className="group rounded-3xl border border-border bg-card p-6 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold tracking-tight">
                {option.title}
              </h2>
              <p className="mt-1 text-sm font-semibold text-primary">
                {option.line}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {option.detail}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {active ? "Continue as" : "Choose"} {option.title}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
