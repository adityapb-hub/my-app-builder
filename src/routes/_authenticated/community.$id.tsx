import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  MapPin,
  ThumbsUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  COMMUNITY_LABELS,
  useCommunityTasks,
  useMyProvider,
  useUserId,
} from "@/lib/coop";
import { formatRupees } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/community/$id")({
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Task not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been closed by the resident who posted it.
      </p>
      <Button asChild variant="outline" className="mt-6 rounded-full">
        <Link to="/community">Back to the board</Link>
      </Button>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Community task — CoopConnect" },
      {
        name: "description",
        content:
          "See who's joined a collective neighbourhood job, add your home, and keep it moving.",
      },
      { property: "og:title", content: "Community task — CoopConnect" },
      {
        property: "og:description",
        content: "Join, vote and track a collective job for your society.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityTaskDetail,
});

function CommunityTaskDetail() {
  const { id } = Route.useParams();
  const uid = useUserId();
  const { data: provider } = useMyProvider();
  const { data: tasks = [] } = useCommunityTasks();
  const [busy, setBusy] = useState(false);

  const task = tasks.find((item) => item.id === id);

  const { data: participantProfiles = [] } = useQuery({
    queryKey: ["coop", "participants", id],
    enabled: Boolean(task && task.participants.length > 0),
    queryFn: async () => {
      if (!task) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", task.participants);
      return data ?? [];
    },
  });

  if (!task) throw notFound();

  const joined = task.participants.includes(provider?.id ?? "__none__");
  const isOwner = task.created_by === uid;

  async function setStatus(status: string) {
    setBusy(true);
    const { error } = await supabase
      .from("community_tasks")
      .update({ status })
      .eq("id", task!.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Updated");
  }

  async function toggleJoin() {
    if (!provider) {
      toast("Publish your profile first", {
        description:
          "A home joins the task through a CoopConnect profile — it takes a minute.",
      });
      return;
    }
    const participants = joined
      ? task!.participants.filter((pid) => pid !== provider.id)
      : [...task!.participants, provider.id];
    const { error } = await supabase
      .from("community_tasks")
      .update({
        participants,
        status:
          task!.status === "open" && participants.length >= 3
            ? "voting"
            : task!.status === "voting" && participants.length >= 6
              ? "confirmed"
              : task!.status,
      })
      .eq("id", task!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(joined ? "You've stepped out" : "Your home is in");
  }

  async function upvote() {
    const { error } = await supabase
      .from("community_tasks")
      .update({ votes: task!.votes + 1 })
      .eq("id", task!.id);
    if (error) toast.error(error.message);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to="/community"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Community board
      </Link>

      <header className="cc-rise mt-4 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-ink">
            {COMMUNITY_LABELS[task.kind] ?? task.kind}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            {COMMUNITY_LABELS[task.status] ?? task.status}
          </span>
        </div>

        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
          {task.title}
        </h1>
        {task.description && (
          <p className="mt-2 max-w-[62ch] text-pretty text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {task.scheduled_at && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              {new Date(task.scheduled_at).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          )}
          {task.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {task.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" />
            {task.participants.length} homes joined
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ThumbsUp className="size-4" />
            {task.votes} votes
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <Button
            className="rounded-full px-6 font-semibold"
            variant={joined ? "outline" : "default"}
            onClick={toggleJoin}
          >
            {joined ? "Leave this task" : "Add my home"}
          </Button>
          <Button variant="outline" className="rounded-full" onClick={upvote}>
            <ThumbsUp className="size-4" />
            Upvote
          </Button>
          <p className="ml-auto text-sm">
            <span className="text-xs text-muted-foreground">split </span>
            <span className="font-display text-xl font-extrabold">
              {formatRupees(Number(task.per_house_cost))}
            </span>
            <span className="text-xs text-muted-foreground">/home</span>
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold tracking-tight">
            Who's in
          </h2>
          {participantProfiles.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No homes have joined yet. Be the first — three homes gets this
              moving.
            </p>
          ) : (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {participantProfiles.map((profile) => (
                <li
                  key={profile.id}
                  className="flex items-center gap-2 rounded-2xl bg-background px-3 py-2 text-sm ring-1 ring-border"
                >
                  <span className="grid size-7 place-items-center rounded-lg bg-success-soft text-[11px] font-bold text-success">
                    {(profile.full_name ?? "?")
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </span>
                  <span className="truncate">{profile.full_name ?? "Neighbour"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-4">
          {isOwner && (
            <section className="rounded-3xl border border-primary/30 bg-brand-soft p-5">
              <h2 className="font-display text-base font-bold tracking-tight text-brand-ink">
                You posted this
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Once enough homes are in, lock the date in with the worker.
              </p>
              <div className="mt-3 space-y-2">
                {task.status !== "confirmed" && task.status !== "completed" && (
                  <Button
                    className="w-full rounded-full"
                    disabled={busy}
                    onClick={() => setStatus("confirmed")}
                  >
                    <CheckCircle2 className="size-4" />
                    Confirm the job
                  </Button>
                )}
                {task.status === "confirmed" && (
                  <Button
                    className="w-full rounded-full"
                    disabled={busy}
                    onClick={() => setStatus("completed")}
                  >
                    Mark done
                  </Button>
                )}
                {task.status !== "cancelled" && task.status !== "completed" && (
                  <Button
                    variant="outline"
                    className="w-full rounded-full"
                    disabled={busy}
                    onClick={() => setStatus("cancelled")}
                  >
                    Cancel task
                  </Button>
                )}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-border bg-card p-5">
            <h2 className="font-display text-base font-bold tracking-tight">
              Cost split
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {task.participants.length || 1} homes ×{" "}
              {formatRupees(Number(task.per_house_cost))} ={" "}
              <span className="font-display font-bold text-foreground">
                {formatRupees(
                  Number(task.per_house_cost) * (task.participants.length || 1),
                )}
              </span>{" "}
              for the job.
            </p>
            <Link
              to="/services"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Find a worker for it
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
