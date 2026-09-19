import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  ImageIcon,
  LoaderCircle,
  Sparkles,
  X,
} from "lucide-react";

import { ChatPanel } from "@/components/ChatPanel";
import { ProviderCard } from "@/components/ProviderCard";
import { ReviewPanel } from "@/components/ReviewPanel";
import { TrackingPanel } from "@/components/TrackingPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  STATUS_LABELS,
  useBooking,
  useProviders,
  useReview,
  useUserId,
} from "@/lib/coop";
import { categoryLabel, formatRupees } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Booking not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been removed, or it belongs to someone else.
      </p>
      <Button asChild variant="outline" className="mt-6 rounded-full">
        <Link to="/bookings">Back to bookings</Link>
      </Button>
    </div>
  ),
  head: () => ({
    meta: [
      { title: "Booking — CoopConnect" },
      {
        name: "description",
        content:
          "Confirm details, follow the worker's route, chat, and leave a review.",
      },
      { property: "og:title", content: "Booking — CoopConnect" },
      {
        property: "og:description",
        content: "Route, chat and review for your service request.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingDetail,
});

const STEPS = ["searching", "requested", "accepted", "on_the_way", "completed"];

function BookingDetail() {
  const { id } = Route.useParams();
  const uid = useUserId();
  const queryClient = useQueryClient();
  const { data: booking, isLoading } = useBooking(id);
  const { data: providers = [] } = useProviders();
  const { data: existingReview } = useReview(id);
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="h-32 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (!booking) throw notFound();

  const isSeeker = booking.customer_id === uid;
  const isProvider = !!booking.provider && booking.provider.user_id === uid;
  const worker = booking.provider;
  const stepIndex = STEPS.indexOf(booking.status);

  async function patch(values: Record<string, unknown>, label: string, success?: string) {
    setBusy(label);
    const { error } = await supabase
      .from("service_requests")
      .update(values)
      .eq("id", booking!.id);
    setBusy(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
    if (success) toast.success(success);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to="/bookings"
        className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All bookings
      </Link>

      <header className="cc-rise mt-4 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {categoryLabel(booking.category)}
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
              {booking.title}
            </h1>
            {booking.description && (
              <p className="mt-1 max-w-[58ch] text-sm text-muted-foreground">
                {booking.description}
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              {worker ? worker.display_name : "No worker yet"} ·{" "}
              {booking.area ?? "area to be shared"} ·{" "}
              {booking.preferred_date
                ? `${new Date(`${booking.preferred_date}T00:00:00`).toLocaleDateString([], { dateStyle: "medium" })}${booking.preferred_time ? ` at ${booking.preferred_time}` : ""}`
                : "Anytime"}
            </p>
            {booking.photo_urls.length > 0 && (
              <PhotoStrip paths={booking.photo_urls} />
            )}
          </div>
          <span className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">
            {STATUS_LABELS[booking.status]}
          </span>
        </div>

        <ol className="mt-6 flex items-center gap-1">
          {STEPS.map((step, index) => {
            const done = stepIndex >= index && stepIndex >= 0;
            return (
              <li key={step} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    done ? "bg-primary" : "bg-secondary"
                  }`}
                />
                <p
                  className={`mt-2 text-[10px] uppercase tracking-[0.12em] ${
                    done
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </p>
              </li>
            );
          })}
        </ol>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {booking.status === "completed" ? (
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="size-5" />
                <h2 className="font-display text-lg font-bold tracking-tight">
                  Job completed
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Final price:{" "}
                <span className="font-display text-lg font-extrabold text-foreground">
                  {formatRupees(booking.final_price ?? booking.quoted_price)}
                </span>
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                Paid directly to the worker — CoopConnect took nothing.
              </p>
            </section>
          ) : worker ? (
            <TrackingPanel booking={booking} />
          ) : (
            <section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <h2 className="font-display text-base font-bold">
                Still looking for the right worker
              </h2>
              <p className="mx-auto mt-1 max-w-[38ch] text-sm text-muted-foreground">
                Send this to someone nearby from the list on the right — they can
                accept in one tap.
              </p>
            </section>
          )}

          {worker && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Messages
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Only you and {worker.display_name.split(" ")[0]} can read this
                thread.
              </p>
              <div className="mt-3">
                <ChatPanel requestId={booking.id} otherName={worker.display_name} />
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          {isSeeker && !worker && booking.status === "searching" && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Invite a worker
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                They see the job, your area and your price expectation — then
                accept or decline.
              </p>
              <div className="mt-4 space-y-3">
                {providers
                  .filter((provider) => provider.category === booking.category)
                  .slice(0, 3)
                  .map((provider) => (
                    <div key={provider.id} className="space-y-2">
                      <ProviderCard provider={provider} action="link" />
                      <Button
                        size="sm"
                        className="w-full rounded-full"
                        disabled={busy === provider.id}
                        onClick={() =>
                          patch(
                            { provider_id: provider.id, status: "requested" },
                            provider.id,
                            `Request sent to ${provider.display_name}`,
                          )
                        }
                      >
                        {busy === provider.id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          "Send request"
                        )}
                      </Button>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {isProvider && booking.status === "requested" && (
            <section className="rounded-2xl border border-primary/40 bg-brand-soft p-6">
              <h2 className="font-display text-lg font-bold tracking-tight text-brand-ink">
                New job request
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                From a neighbour · {booking.area ?? "area pending"}
                {booking.quoted_price
                  ? ` · budget ${formatRupees(booking.quoted_price)}`
                  : ""}
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 rounded-full"
                  disabled={busy !== null}
                  onClick={() =>
                    patch(
                      { status: "accepted" },
                      "accept",
                      "Job accepted — the neighbour is notified",
                    )
                  }
                >
                  <CheckCircle2 className="size-4" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  disabled={busy !== null}
                  onClick={() => patch({ status: "declined" }, "decline")}
                >
                  <X className="size-4" />
                  Decline
                </Button>
              </div>
            </section>
          )}

          {isProvider && booking.status === "accepted" && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Head out when you're ready
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The neighbour sees you're on the way.
              </p>
              <Button
                className="mt-4 w-full rounded-full"
                disabled={busy !== null}
                onClick={() => patch({ status: "on_the_way" }, "travel", "Marked on the way")}
              >
                Start trip
              </Button>
            </section>
          )}

          {isProvider &&
            (booking.status === "accepted" || booking.status === "on_the_way") && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-bold tracking-tight">
                  Close the job
                </h2>
                <Label htmlFor="price" className="mt-3 block text-xs font-semibold">
                  Final price (₹)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={50}
                  placeholder={String(worker?.hourly_rate ?? 300)}
                  className="mt-1.5 bg-background"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Your rate is {formatRupees(Number(worker?.hourly_rate ?? 0))}/hr —
                  agree the total with the neighbour before you close it.
                </p>
                <Button
                  className="mt-3 w-full rounded-full"
                  disabled={busy !== null || !price}
                  onClick={async () => {
                    setBusy("complete");
                    const { error } = await supabase
                      .from("service_requests")
                      .update({
                        status: "completed",
                        final_price: Number(price),
                      })
                      .eq("id", booking.id);
                    if (error) {
                      setBusy(null);
                      toast.error(error.message);
                      return;
                    }
                    if (worker) {
                      await supabase
                        .from("service_providers")
                        .update({ jobs_completed: worker.jobs_completed + 1 })
                        .eq("id", worker.id);
                    }
                    setBusy(null);
                    queryClient.invalidateQueries({ queryKey: ["coop"] });
                    toast.success("Job closed. Nice work.");
                  }}
                >
                  Mark completed
                </Button>
              </section>
            )}

          {isSeeker &&
            ["searching", "requested", "accepted", "on_the_way"].includes(
              booking.status,
            ) && (
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-bold tracking-tight">
                  Need to change plans?
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.status === "requested"
                    ? `Waiting for ${worker?.display_name ?? "the worker"} to respond.`
                    : "You can cancel until the job is marked complete."}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 w-full rounded-full"
                  disabled={busy !== null}
                  onClick={() => patch({ status: "cancelled" }, "cancel", "Booking cancelled")}
                >
                  Cancel booking
                </Button>
              </section>
            )}

          {isSeeker && booking.status === "completed" && !existingReview && worker && (
            <ReviewPanel
              requestId={booking.id}
              providerId={worker.id}
              providerName={worker.display_name}
            />
          )}

          {existingReview && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Your review
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {existingReview.rating} ★ ·{" "}
                {existingReview.comment || "No comment"}
              </p>
            </section>
          )}

          <Link
            to="/assistant"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary">
              <Sparkles className="size-4" />
            </span>
            <span className="text-sm">
              <span className="block font-semibold">Something else broken?</span>
              <span className="text-muted-foreground">
                Ask the assistant for a price estimate.
              </span>
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}

function PhotoStrip({ paths }: { paths: string[] }) {
  async function open(path: string) {
    const { data, error } = await supabase.storage
      .from("coop-media")
      .createSignedUrl(path, 300);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <ImageIcon className="size-3.5" />
        {paths.length} photo{paths.length > 1 ? "s" : ""}
      </span>
      {paths.map((path) => (
        <button
          key={path}
          type="button"
          onClick={() => open(path)}
          className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
        >
          Open
        </button>
      ))}
    </div>
  );
}
