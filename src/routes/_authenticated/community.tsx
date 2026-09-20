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
  setTaskMembership,
  setTaskVote,
  useCommunityTasks,
  useProfile,
  useUserId,
  type CommunityTask,
} from "@/lib/coop";
import { COMMUNITY_KINDS, communityKindLabel, formatRupees } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

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
  const { data: profile } = useProfile();
  const { data: tasks = [], isLoading } = useCommunityTasks();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("apartment_cleaning");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("120");
  const [seats, setSeats] = useState("6");
  const [when, setWhen] = useState("");
  const [apartment, setApartment] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (!uid) return;
    if (!title.trim()) {
      toast.error("Give the task a short name.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("community_tasks").insert({
      title: title.trim(),
      category,
      description: description.trim() || null,
      cost_per_household: Number(cost || 0),
      seats_needed: Number(seats || 0),
      event_date: when || null,
      apartment_name: apartment.trim() || null,
      location: location.trim() || null,
      creator_id: uid,
      creator_name: profile?.full_name ?? "A neighbour",
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
    setApartment("");
    setLocation("");
    setWhen("");
  }

  async function toggleJoin(task: CommunityTask) {
    if (!uid) return;
    const error = await setTaskMembership(task.id, uid, !task.joined);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
    toast.success(
      task.joined ? "You've stepped out" : "You're in — cost splits across homes",
    );
  }

  async function toggleVote(task: CommunityTask) {
    if (!uid) return;
    const error = await setTaskVote(task.id, uid, !task.voted);
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {COMMUNITY_KINDS.map((kind) => (
                  <option key={kind.id} value={kind.id}>
                    {kind.label}
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

          <div className="grid gap-4 sm:grid-cols-4">
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
              <Label className="text-sm font-semibold">Homes needed</Label>
              <Input
                type="number"
                min={1}
                className="mt-1.5 bg-background"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">When</Label>
              <Input
                type="date"
                className="mt-1.5 bg-background"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Building</Label>
              <Input
                className="mt-1.5 bg-background"
                placeholder="Sugam Apartments"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold">Where to meet</Label>
            <Input
              className="mt-1.5 bg-background"
              placeholder="Gate 2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
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
          <h2 className="font-display text-lg font-bold">Nothing posted yet</h2>
          <p className="mx-auto mt-1 max-w-[40ch] text-sm text-muted-foreground">
            Start the one your society keeps putting off — tank cleaning, waste
            pickup, a sapling day.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-3xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-ink">
                  {communityKindLabel(task.category)}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  {COMMUNITY_LABELS[task.status] ?? task.status}
                </span>
                {task.joined && (
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
                  {task.joined_count} of {task.seats_needed} homes
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="size-3.5" />
                  {task.votes} votes
                </span>
                {task.event_date && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="size-3.5" />
                    {new Date(task.event_date).toLocaleDateString([], {
                      dateStyle: "medium",
                    })}
                  </span>
                )}
                {(task.apartment_name || task.location) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {[task.apartment_name, task.location]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-sm">
                  <span className="text-xs text-muted-foreground">from </span>
                  <span className="font-display text-lg font-extrabold">
                    {formatRupees(Number(task.cost_per_household))}
                  </span>
                  <span className="text-xs text-muted-foreground">/home</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={task.voted ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => toggleVote(task)}
                  >
                    <ThumbsUp className="size-3.5" />
                    {task.votes}
                  </Button>
                  <Button
                    size="sm"
                    variant={task.joined ? "outline" : "default"}
                    className="rounded-full"
                    onClick={() => toggleJoin(task)}
                  >
                    {task.joined ? "Leave" : "Join"}
                  </Button>
                  <Button asChild size="sm" variant="ghost" className="rounded-full">
                    <Link to="/community/$id" params={{ id: task.id }}>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
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
