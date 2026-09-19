import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarClock,
  ImagePlus,
  LoaderCircle,
  MapPin,
  Send,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUserId } from "@/lib/coop";
import { categoryLabel } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

const MAX_PHOTOS = 4;
const MAX_BYTES = 10 * 1024 * 1024;

function readDraft(): { title: string; description: string } {
  if (typeof window === "undefined") return { title: "", description: "" };
  try {
    const raw = window.sessionStorage.getItem("cc-draft-request");
    if (!raw) return { title: "", description: "" };
    window.sessionStorage.removeItem("cc-draft-request");
    const draft = JSON.parse(raw) as {
      description?: string;
      summary?: string;
    };
    return {
      title: draft.summary ?? "",
      description: draft.description ?? "",
    };
  } catch {
    return { title: "", description: "" };
  }
}

export function RequestForm({
  category,
  providerId,
}: {
  category: string;
  providerId?: string;
}) {
  const uid = useUserId();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const draft = readDraft();
  const [title, setTitle] = useState(draft.title);
  const [description, setDescription] = useState(draft.description);
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [area, setArea] = useState(profile?.area ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} isn't an image.`);
        return false;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is over 10 MB.`);
        return false;
      }
      return true;
    });
    setPhotos((current) => [...current, ...incoming].slice(0, MAX_PHOTOS));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!uid) return;
    if (!title.trim()) {
      toast.error("Give the job a short name, like “Kitchen sink clog”.");
      return;
    }

    setBusy(true);
    try {
      const photoUrls: string[] = [];
      for (const file of photos) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${uid}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("coop-media")
          .upload(path, file);
        if (error) throw error;
        photoUrls.push(path);
      }

      const { data, error } = await supabase
        .from("service_requests")
        .insert({
          customer_id: uid,
          provider_id: providerId ?? null,
          category,
          title: title.trim(),
          description: description.trim() || null,
          photo_urls: photoUrls,
          preferred_date: preferredDate || null,
          preferred_time: preferredTime || null,
          area: area.trim() || null,
          address: address.trim() || null,
          status: providerId ? "requested" : "searching",
        })
        .select("id")
        .single();

      if (error) throw error;
      navigate({ to: "/bookings/$id", params: { id: data.id } });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't send that request.",
      );
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="title" className="text-sm font-semibold">
          Job in one line
        </Label>
        <Input
          id="title"
          placeholder="Kitchen sink clog"
          className="mt-1.5 bg-background"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Category: <span className="font-semibold">{categoryLabel(category)}</span>
        </p>
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-semibold">
          What's going on?
        </Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Draining slowly and there's a smell near the pipe. Two-bedroom flat, second floor."
          className="mt-1.5 bg-background"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="preferredDate" className="text-sm font-semibold">
            Preferred date
          </Label>
          <Input
            id="preferredDate"
            type="date"
            className="mt-1.5 bg-background"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="preferredTime" className="text-sm font-semibold">
            Preferred time
          </Label>
          <Input
            id="preferredTime"
            type="time"
            className="mt-1.5 bg-background"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="area" className="text-sm font-semibold">
            Area / society
          </Label>
          <Input
            id="area"
            placeholder="Salt Lake, Sector 2"
            className="mt-1.5 bg-background"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="address" className="text-sm font-semibold">
            Address (shared on accept)
          </Label>
          <Input
            id="address"
            placeholder="Flat 4B, Sugam, Gate 2"
            className="mt-1.5 bg-background"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold">Photos (optional)</Label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {photos.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1.5 pl-3 pr-1.5 text-xs"
            >
              {file.name}
              <button
                type="button"
                onClick={() =>
                  setPhotos((current) => current.filter((_, i) => i !== index))
                }
                className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
              <ImagePlus className="size-3.5" />
              Add photo
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  addPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/60 px-4 py-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5" />
          No card needed — pay the worker directly after the job.
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          Your address is shared only when a worker accepts.
        </span>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={busy}
        className="w-full rounded-full text-[15px] font-semibold sm:w-auto sm:px-8"
      >
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {providerId ? "Send booking request" : "Post request"}
      </Button>
    </form>
  );
}
