import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarClock,
  LoaderCircle,
  MapPin,
  ThumbsUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  COMMUNITY_LABELS,
  useCommunityTasks,
  useMyProvider,
  useUserId,
  type CommunityTask,
} from "@/lib/coop";
import { categoryLabel, formatRupees } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

const KINDS = [
  "apartment_cleaning",
  "garbage_collection",
  "tree_plantation",
  "water_tank",
  "festival",
  "other",
];

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Community board — CoopConnect" },
      {
        name: "description",
        content:
          "Post a collective job for your society — cleaning drives, garbage collection, tree plantation, water tank maintenance — and let households join and split the cost.",
      },
      { property: "og:title", content: "Community board — CoopConnect" },
      {
        property: "og:description",
        content: "Collective neighbourhood jobs that households join and split.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const uid = useUserId();
  const queryClient = useQueryClient();
  const { data: provider } = useMyProvider();
  const { data: tasks = [], isLoading } = useCommunityTasks();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState(KINDS[0]);
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("120");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Give the task a short name.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("community_tasks").insert({
      title: title.trim(),
      kind,
      description: description.trim() || null,
      per_house_cost: Number(cost || 0),
      scheduled_at: when ? new Date(when).toISOString() : null,
      location: location.trim() || null,
      created_by: uid,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
    toast.success("Posted to the community board.");
    setOpen(false);
    setTitle("");
    setDescription("");
    setLocation("");
    setWhen("");
  }

  async function toggleJoin(task: CommunityTask) {
    const joined = task.participants.includes(provider?.id ?? "__none__");
    const participants = joined
      ? task.participants.filter((id) => id !== provider?.id)
      : [...task.participants, provider?.id];
    const next = participants.filter(Boolean);
    const { error } = await supabase
      .from("community_tasks")
      .update({
        participants: next,
        status:
          task.status === "open" && next.length >= 3
            ? "voting"
            : task.status === "voting" && next.length >= 6
              ? "confirmed"
              : task.status,
      })
      .eq("id", task.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
    toast.success(joined ? "You've stepped out" : "You're in — cost splits across homes");
  }

  async function upvote(task: CommunityTask) {
    const { error } = await supabase
      .from("community_tasks")
      .update({ votes: task.votes + 1 })
      .eq("id", task.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="cc-rise flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Community
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
            The society board
          </h1>
          <p className="mt-2 max-w-[54ch] text-muted-foreground">
            Jobs that make more sense together: one tank cleaning for the whole
            building, a plantation drive, the festival pandal. Post it, let
            households join, split the bill.
          </p>
        </div>
        <Button
          size="lg"
          className="rounded-full px-6 font-semibold"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close form" : "Post a task"}
        </Button>
      </header>

      {open && (
        <form
          onSubmit={create}
          className="cc-slide-in mt-6 space-y-4 rounded-3xl border border-border bg-card p-6"
        >
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <Label className="text-sm font-semibold">Task name</Label>
              <Input
                className="mt-1.5 bg-background"
                placeholder="Staircase & lift lobby cleaning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Type</Label>
              <select
                className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                {KINDS.map((value) => (
                  <option key={value} value={value}>
                    {COMMUNITY_LABELS[value] ?? value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Details</Label>
            <Textarea
              rows={3}
              className="mt-1.5 bg-background"
              placeholder="Two sweepers plus a mop for 6 floors. We meet at the main gate."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="text-sm font-semibold">Cost per home (₹)</Label>
              <Input
                type="number"
                min={0}
                className="mt-1.5 bg-background"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">When</Label>
              <Input
                type="datetime-local"
                className="mt-1.5 bg-background"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Where</Label>
              <Input
                className="mt-1.5 bg-background"
                placeholder="Sugam, Gate 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="rounded-full px-6 font-semibold"
          >
            {busy && <LoaderCircle className="size-4 animate-spin" />}
            Post to the board
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-3xl border border-border bg-card"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="font-display text-lg font-bold">
            Nothing posted yet
          </h2>
          <p className="mx-auto mt-1 max-w-[40ch] text-sm text-muted-foreground">
            Start the one your society keeps putting off — tank cleaning, waste
            pickup, a sapling day.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {tasks.map((task) => {
            const joined = task.participants.includes(provider?.id ?? "__none__");
            return (
              <article
                key={task.id}
                className="rounded-3xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-ink">
                    {COMMUNITY_LABELS[task.kind] ?? task.kind}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {COMMUNITY_LABELS[task.status] ?? task.status}
                  </span>
                  {joined && (
                    <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                      You're in
                    </span>
                  )}
                </div>

                <h2 className="mt-3 font-display text-xl font-bold tracking-tight">
                  {task.title}
                </h2>
                {task.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" />
                    {task.participants.length} homes
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="size-3.5" />
                    {task.votes} votes
                  </span>
                  {task.scheduled_at && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="size-3.5" />
                      {new Date(task.scheduled_at).toLocaleDateString([], {
                        dateStyle: "medium",
                      })}
                    </span>
                  )}
                  {task.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {task.location}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-sm">
                    <span className="text-xs text-muted-foreground">from </span>
                    <span className="font-display text-lg font-extrabold">
                      {formatRupees(Number(task.per_house_cost))}
                    </span>
                    <span className="text-xs text-muted-foreground">/home</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => upvote(task)}
                    >
                      <ThumbsUp className="size-3.5" />
                      {task.votes}
                    </Button>
                    <Button
                      size="sm"
                      variant={joined ? "outline" : "default"}
                      className="rounded-full"
                      onClick={() => toggleJoin(task)}
                    >
                      {joined ? "Leave" : "Join"}
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="rounded-full">
                      <Link to="/community/$id" params={{ id: task.id }}>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Looking for a worker for just your home?{" "}
        <Link
          to="/services"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Book a service
        </Link>{" "}
        instead.
      </p>
    </div>
  );
}
