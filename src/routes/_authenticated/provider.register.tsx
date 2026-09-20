import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMyProvider, useProfile, useUserId } from "@/lib/coop";
import { CATEGORIES } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/provider/register")({
  head: () => ({
    meta: [
      { title: "Register as a provider — CoopConnect" },
      {
        name: "description",
        content:
          "Publish your skills, set your own hourly rate and upload your ID so neighbours can hire you directly.",
      },
      { property: "og:title", content: "Register as a provider — CoopConnect" },
      {
        property: "og:description",
        content: "Set your rate, list your skills, keep 100% of what you earn.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProviderRegister,
});

function ProviderRegister() {
  const uid = useUserId();
  const navigate = useNavigate();
  const { data: existing, isLoading: loadingExisting } = useMyProvider();
  const { data: profile } = useProfile();

  const [displayName, setDisplayName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<string>(
    CATEGORIES[0]?.id ?? "plumbing",
  );
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [services, setServices] = useState("");
  const [languages, setLanguages] = useState("Bengali, Hindi, English");
  const [experience, setExperience] = useState("3");
  const [rate, setRate] = useState("350");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  if (loadingExisting) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="h-40 animate-pulse rounded-3xl border border-border bg-card" />
      </div>
    );
  }

  if (existing) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">
          You're already on the board
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your provider profile is live as {existing.display_name}.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/provider">Open job desk</Link>
        </Button>
      </div>
    );
  }

  async function upload(file: File, kind: string) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `${uid}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("coop-media")
      .upload(path, file);
    if (error) throw error;
    return path;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!uid) return;
    if (!displayName.trim() || !phone.trim()) {
      toast.error("Add your name and phone number so workers can be contacted.");
      return;
    }
    if (!idFile) {
      toast.error("Upload an ID document — it keeps the board trustworthy.");
      return;
    }

    setBusy(true);
    try {
      const idPath = await upload(idFile, "id");
      const certPath = certFile ? await upload(certFile, "certificate") : null;

      const { error } = await supabase.from("providers").insert({
        user_id: uid,
        display_name: displayName.trim(),
        phone: phone.trim(),
        category,
        area: area.trim() || "Kolkata",
        bio: bio.trim() || "Local professional taking on nearby jobs.",
        services: services
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        languages: languages
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        years_experience: Number(experience || 0),
        hourly_rate: Number(rate || 0),
        id_document_path: idPath,
        certificate_path: certPath,
      });
      if (error) throw error;

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: uid, role: "provider" });
      if (roleError && roleError.code !== "23505") {
        // Profile is created; role grant is non-fatal for this session.
      }

      toast.success("You're on the board. Requests will start coming in.");
      navigate({ to: "/provider", replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't save your profile.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header className="cc-rise">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Service provider
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
          Set up your profile
        </h1>
        <p className="mt-2 max-w-[52ch] text-muted-foreground">
          You set the rate. Neighbours see it before they ask. CoopConnect
          doesn't take a cut.
        </p>
      </header>

      <form onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name on the board">
            <Input
              className="bg-background"
              placeholder="Rajesh Kumar"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              className="bg-background"
              placeholder="+91 98300 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Main service">
            <select
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Area you cover">
            <Input
              className="bg-background"
              placeholder="Salt Lake, Sector 2"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Years of experience">
            <Input
              type="number"
              min={0}
              className="bg-background"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />
          </Field>
          <Field label="Your rate (₹/hr)">
            <Input
              type="number"
              min={0}
              step={50}
              className="bg-background"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </Field>
          <Field label="Languages">
            <Input
              className="bg-background"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Services you handle (comma separated)">
          <Input
            className="bg-background"
            placeholder="Sink repair, Pipe replacement, Geyser fitting"
            value={services}
            onChange={(e) => setServices(e.target.value)}
          />
        </Field>

        <Field label="About you">
          <Textarea
            rows={3}
            className="bg-background"
            placeholder="I've been plumbing in Salt Lake for 12 years. I carry basic spares and quote before I start."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <UploadField
            label="ID document"
            hint="Aadhaar, voter ID or passport. Only visible to the verification team."
            file={idFile}
            onPick={setIdFile}
          />
          <UploadField
            label="Certificate (optional)"
            hint="ITI, trade licence or any training you've done."
            file={certFile}
            onPick={setCertFile}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={busy}
          className="w-full rounded-full text-[15px] font-semibold"
        >
          {busy && <LoaderCircle className="size-4 animate-spin" />}
          Publish my profile
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function UploadField({
  label,
  hint,
  file,
  onPick,
}: {
  label: string;
  hint: string;
  file: File | null;
  onPick: (file: File | null) => void;
}) {
  return (
    <label className="block cursor-pointer rounded-2xl border border-dashed border-border bg-background p-4 transition-colors hover:border-primary/50">
      <span className="flex items-center gap-2 text-sm font-semibold">
        <Upload className="size-4 text-primary" />
        {label}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      <span className="mt-2 block truncate text-xs font-medium text-primary">
        {file ? file.name : "Tap to choose a file"}
      </span>
      <input
        type="file"
        className="hidden"
        accept="image/*,application/pdf"
        onChange={(e) => {
          const picked = e.target.files?.[0] ?? null;
          if (picked && picked.size > 10 * 1024 * 1024) {
            toast.error(`${picked.name} is over 10 MB.`);
            return;
          }
          onPick(picked);
          e.target.value = "";
        }}
      />
    </label>
  );
}
