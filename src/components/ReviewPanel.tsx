import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Textarea } from "@/components/ui/textarea";
import { useUserId } from "@/lib/coop";
import { supabase } from "@/integrations/supabase/client";

export function ReviewPanel({
  requestId,
  providerId,
  providerName,
}: {
  requestId: string;
  providerId: string;
  providerName: string;
}) {
  const uid = useUserId();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!uid) return;
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({
      request_id: requestId,
      provider_id: providerId,
      customer_id: uid,
      rating,
      comment: comment.trim() || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["coop"] });
    toast.success("Thanks — your neighbours will see this.");
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-background p-5"
    >
      <h3 className="font-display text-base font-bold tracking-tight">
        How did it go?
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        A quick rating keeps {providerName.split(" ")[0]}'s profile honest.
      </p>

      <div className="mt-4">
        <StarRating value={rating} size="lg" onChange={setRating} />
      </div>

      <Textarea
        rows={3}
        placeholder="What was good, what could be better?"
        className="mt-3 bg-background"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <Button
        type="submit"
        disabled={busy}
        className="mt-3 w-full rounded-full font-semibold sm:w-auto sm:px-6"
      >
        {busy && <LoaderCircle className="size-4 animate-spin" />}
        Post review
      </Button>
    </form>
  );
}
