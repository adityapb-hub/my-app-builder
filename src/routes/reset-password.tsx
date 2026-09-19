import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — CoopConnect" },
      {
        name: "description",
        content: "Choose a new password for your CoopConnect account.",
      },
      { property: "og:title", content: "Set a new password — CoopConnect" },
      {
        property: "og:description",
        content: "Choose a new password to get back into your account.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The recovery link puts type=recovery in the URL hash; only then is a
    // password change allowed.
    const isRecovery = window.location.hash.includes("type=recovery");
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setReady(true);
      else if (!isRecovery) {
        toast.error("Open this page from the reset link in your email.");
      }
    })();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 6) {
      toast.error("Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("The two passwords don't match.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-3xl border border-border bg-card p-6">
        <span className="grid size-11 place-items-center rounded-2xl bg-success-soft text-success">
          <ShieldCheck className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ready
            ? "You're signed in from the reset link. Pick something new."
            : "Waiting for the reset link…"}
        </p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <Label htmlFor="password" className="text-sm font-semibold">
              New password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="mt-1.5 bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm" className="text-sm font-semibold">
              Confirm password
            </Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className="mt-1.5 bg-background"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            disabled={busy || !ready}
            className="w-full rounded-full font-semibold"
          >
            {busy && <LoaderCircle className="size-4 animate-spin" />}
            Save new password
          </Button>
        </form>
      </div>
    </div>
  );
}
