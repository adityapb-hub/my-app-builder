import { lazy, Suspense, useMemo } from "react";
import { ClientOnly } from "next-themes";
import { Info, MapPin, Navigation } from "lucide-react";

import type { Booking } from "@/lib/coop";

const LiveMap = lazy(() => import("@/components/LiveMap"));

const BASE: [number, number] = [22.5726, 88.3639];

function offsetFrom(seed: string, spread: number): [number, number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 99991;
  }
  const a = ((hash % 1000) / 1000 - 0.5) * spread;
  const b = (((hash >> 7) % 1000) / 1000 - 0.5) * spread;
  return [Number((BASE[0] + a).toFixed(6)), Number((BASE[1] + b).toFixed(6))];
}

function haversineKm(a: [number, number], b: [number, number]) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * CoopConnect does not stream a worker's GPS position — it publishes the area
 * they work from, so the map draws the route between that area and the job.
 */
export function TrackingPanel({ booking }: { booking: Booking }) {
  const worker = booking.provider;

  const to = useMemo(
    () => offsetFrom(`${booking.area ?? "kolkata"}|${booking.address ?? ""}`, 0.09),
    [booking.area, booking.address],
  );
  const from = useMemo(
    () => offsetFrom(`${worker?.area ?? "kolkata"}|${worker?.id ?? ""}`, 0.09),
    [worker?.area, worker?.id],
  );

  const distance = Math.max(0.4, haversineKm(from, to));
  const minutes = Math.max(3, Math.round((distance / 16) * 60));
  const underway = booking.status === "on_the_way";

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
            <span className="size-1.5 rounded-full bg-success cc-live" />
            {underway ? "On the way" : "Assigned"}
          </span>
          <p className="font-display text-lg font-extrabold tracking-tight">
            {underway ? `Arriving in ~${minutes} min` : `About ${minutes} min away`}
          </p>
        </div>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Navigation className="size-3.5" />
          {distance.toFixed(1)} km apart
        </p>
      </div>

      <div className="relative h-[280px] bg-secondary">
        <ClientOnly fallback={<div className="h-full w-full animate-pulse" />}>
          <Suspense
            fallback={
              <div className="grid h-full w-full place-items-center text-xs text-muted-foreground">
                Loading map…
              </div>
            }
          >
            <LiveMap from={from} to={to} />
          </Suspense>
        </ClientOnly>
      </div>

      <div className="space-y-1.5 border-t border-border px-4 py-3">
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {booking.address ?? booking.area ?? "Address shared when the job is accepted"}
        </p>
        <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Info className="size-3" />
          Approximate route between {worker?.area ?? "the worker"}'s area and your
          job — CoopConnect doesn't track a live GPS feed.
        </p>
      </div>
    </div>
  );
}
