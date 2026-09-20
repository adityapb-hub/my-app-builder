import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Tags,
} from "lucide-react";

import { ProviderCard } from "@/components/ProviderCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProviders } from "@/lib/coop";
import {
  categoryLabel,
  formatRupees,
  isKnownCategory,
} from "@/lib/catalog";
import { assistantAdvise } from "@/lib/assistant.functions";

type Advice = {
  category: string;
  summary: string;
  estimate_min: number;
  estimate_max: number;
  urgency: string;
  why: string;
  checks: string[];
};

const EXAMPLES = [
  "Power keeps tripping in the kitchen when the microwave runs",
  "Water tank has been empty since yesterday and the pump is making noise",
  "Need a maths tutor for my son, class 9, two days a week",
];

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "Smart assistant — HomeEase" },
      {
        name: "description",
        content:
          "Describe your household problem in plain words and get the right service category, a fair price range and nearby experts.",
      },
      { property: "og:title", content: "Smart assistant — HomeEase" },
      {
        property: "og:description",
        content: "Plain words in, category and fair price range out.",
      },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const advise = useServerFn(assistantAdvise);
  const navigate = useNavigate();
  const { data: providers = [] } = useProviders();

  const [problem, setProblem] = useState("");
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [busy, setBusy] = useState(false);

  async function ask(event?: React.FormEvent) {
    event?.preventDefault();
    if (problem.trim().length < 4) {
      toast.error("Tell me a bit more about what's happening.");
      return;
    }
    setBusy(true);
    setAdvice(null);
    try {
      const result = await advise({ data: { problem: problem.trim() } });
      setAdvice(result as Advice);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The assistant is unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }

  function postRequest() {
    if (!advice) return;
    const category = isKnownCategory(advice.category) ? advice.category : "other";
    try {
      sessionStorage.setItem(
        "cc-draft-request",
        JSON.stringify({ category, description: advice.summary }),
      );
    } catch {
      // Storage may be blocked; the form simply starts empty.
    }
    navigate({ to: "/request/$category", params: { category } });
  }

  const nearby = advice
    ? providers
        .filter((provider) => provider.category === advice.category)
        .slice(0, 3)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="cc-rise">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand-ink">
          <Sparkles className="size-3.5" />
          Smart assistant
        </span>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
          What's going on?
        </h1>
        <p className="mt-2 max-w-[52ch] text-muted-foreground">
          Say it the way you'd tell a neighbour. You'll get the right category,
          a fair price range and who's nearby.
        </p>
      </header>

      <form onSubmit={ask} className="mt-6 rounded-3xl border border-border bg-card p-5">
        <Textarea
          rows={3}
          placeholder="Bathroom tap has been dripping all night and the floor is wet…"
          className="bg-background text-base"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setProblem(example)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {example.length > 44 ? `${example.slice(0, 44)}…` : example}
              </button>
            ))}
          </div>
          <Button
            type="submit"
            disabled={busy}
            className="rounded-full px-6 font-semibold"
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Suggest
          </Button>
        </div>
      </form>

      {busy && (
        <div className="mt-4 space-y-3">
          <div className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
        </div>
      )}

      {advice && (
        <div className="cc-slide-in mt-6 space-y-4">
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-soft text-primary">
                  <Tags className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    Best category
                  </p>
                  <p className="font-display text-lg font-bold tracking-tight">
                    {categoryLabel(advice.category)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Fair total
                </p>
                <p className="font-display text-lg font-extrabold">
                  {formatRupees(advice.estimate_min)} –{" "}
                  {formatRupees(advice.estimate_max)}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">{advice.why}</p>

            <div className="mt-4 rounded-2xl bg-background p-4 ring-1 ring-border">
              <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <Lightbulb className="size-3.5 text-warning" />
                Tell the worker
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {advice.checks.map((check) => (
                  <li key={check} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{check}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button
                onClick={postRequest}
                className="rounded-full px-6 font-semibold"
              >
                Post this request
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                Urgency:{" "}
                <span className="font-semibold text-foreground">
                  {advice.urgency.replaceAll("-", " ")}
                </span>
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-lg font-bold tracking-tight">
              Nearby experts
            </h2>
            {nearby.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No {categoryLabel(advice.category).toLowerCase()} workers listed
                in your area yet — post the request and the board will find
                someone.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {nearby.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
