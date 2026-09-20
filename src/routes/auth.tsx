import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Handshake, Phone, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/coop";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or register — HomeEase" },
      {
        name: "description",
        content:
          "Sign in to HomeEase with email, a password, or your Google account to book local services or offer your own.",
      },
      { property: "og:title", content: "Sign in to HomeEase" },
      {
        property: "og:description",
        content: "Email, password or Google — then pick your side of the board.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const navigate = useNavigate();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) navigate({ to: "/dashboard", replace: true });
  }, [session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and a password.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSentTo(email.trim());
          return;
        }
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "That didn't work. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Google sign-in failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email.trim()) {
      toast.error("Type your email first, then tap forgot password.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reset link sent. Check your inbox.");
  }

  if (sentTo) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-success-soft text-success">
          <ShieldCheck className="size-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
          Confirm your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-foreground">{sentTo}</span>. Open
          it and come back — you'll land right in your dashboard.
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-full"
          onClick={() => setSentTo(null)}
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
      <div className="hidden lg:block">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-ink">
          <Handshake className="size-3.5" />
          HomeEase
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-balance">
          Welcome to your neighbourhood board.
        </h1>
        <p className="mt-4 max-w-[42ch] text-pretty text-muted-foreground">
          One account for both sides of the street: book a trusted worker when
          something breaks, and pick up jobs from neighbours when you're free.
        </p>
        <ul className="mt-8 space-y-3 text-sm">
          {[
            "Transparent starting prices before you commit",
            "ID-checked workers with neighbour ratings",
            "Community jobs that households join and split",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                <ShieldCheck className="size-3" />
              </span>
              <span className="text-muted-foreground">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex rounded-full bg-secondary p-1">
          {(["login", "register"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                mode === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {value === "login" ? "Log in" : "Register"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <Label htmlFor="fullName" className="text-sm font-semibold">
                Full name
              </Label>
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Aditya Pb"
                className="mt-1.5 bg-background"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1.5 bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold">
                Password
              </Label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="At least 6 characters"
              className="mt-1.5 bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            size="lg"
            className="w-full rounded-full text-[15px] font-semibold"
          >
            {mode === "login" ? "Log in" : "Create account"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2.5">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={busy}
            onClick={handleGoogle}
            className="w-full rounded-full text-[15px] font-semibold"
          >
            <GoogleMark />
            Continue with Google
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() =>
              toast("Phone sign-in isn't switched on yet", {
                description:
                  "It needs an SMS provider for your project. Ask me to set one up and I'll wire it in.",
              })
            }
            className="w-full rounded-full text-[15px] font-semibold"
          >
            <Phone className="size-4" />
            Continue with Phone Number
          </Button>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          By continuing you agree to keep the board kind — no spam jobs, no
          fake reviews.
        </p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.59-5.17 3.59-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.76-2.11-6.7-4.94H1.28v3.1A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.28a12 12 0 0 0 0 10.78l4.02-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44A11.97 11.97 0 0 0 12 0 11.99 11.99 0 0 0 1.28 6.61l4.02 3.1C6.24 6.88 8.88 4.75 12 4.75Z"
      />
    </svg>
  );
}
