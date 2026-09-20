import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
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
  setTaskMembership,
  setTaskVote,
  useCommunityTasks,
  useUserId,
} from "@/lib/coop";
import { communityKindLabel, formatRupees } from "@/lib/catalog";
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
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading } = useCommunityTasks();
  const [busy, setBusy] = useState(false);

  const task = tasks.find((item) => item.id === id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="h-32 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!task) throw notFound();

  const isOwner = task.creator_id === uid;
  const homes = task.joined_count || 1;

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
    queryClient.invalidateQueries({ queryKey: ["coop"] });
    toast.success("Updated");
  }

  async function toggleJoin() {
    if (!uid) return;
    const error = await setTaskMembership(task!.id, uid, !task!.joined);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
    toast.success(task!.joined ? "You've stepped out" : "Your home is in");
  }

  async function toggleVote() {
    if (!uid) return;
    const error = await setTaskVote(task!.id, uid, !task!.voted);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
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
            {communityKindLabel(task.category)}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            {COMMUNITY_LABELS[task.status] ?? task.status}
          </span>
        </div>

        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight">
          {task.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Posted by {task.creator_name}
        </p>
        {task.description && (
          <p className="mt-2 max-w-[62ch] text-pretty text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {task.event_date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-4" />
              {new Date(task.event_date).toLocaleDateString([], {
                dateStyle: "medium",
              })}
            </span>
          )}
          {(task.apartment_name || task.location) && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {[task.apartment_name, task.location].filter(Boolean).join(" · ")}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" />
            {task.joined_count} of {task.seats_needed} homes joined
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ThumbsUp className="size-4" />
            {task.votes} votes
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <Button
            className="rounded-full px-6 font-semibold"
            variant={task.joined ? "outline" : "default"}
            onClick={toggleJoin}
          >
            {task.joined ? "Leave this task" : "Add my home"}
          </Button>
          <Button
            variant={task.voted ? "default" : "outline"}
            className="rounded-full"
            onClick={toggleVote}
          >
            <ThumbsUp className="size-4" />
            {task.voted ? "Voted" : "Upvote"}
          </Button>
          <p className="ml-auto text-sm">
            <span className="text-xs text-muted-foreground">split </span>
            <span className="font-display text-xl font-extrabold">
              {formatRupees(Number(task.cost_per_household))}
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
          <p className="mt-2 text-sm text-muted-foreground">
            {task.joined_count === 0
              ? "No homes have joined yet. Be the first — a few homes gets this moving."
              : `${task.joined_count} home${task.joined_count === 1 ? "" : "s"} joined so far. Names stay private until the organiser shares them.`}
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, Math.round((task.joined_count / Math.max(1, task.seats_needed)) * 100))}%`,
              }}
            />
          </div>
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
              {homes} home{homes === 1 ? "" : "s"} ×{" "}
              {formatRupees(Number(task.cost_per_household))} ={" "}
              <span className="font-display font-bold text-foreground">
                {formatRupees(Number(task.cost_per_household) * homes)}
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
