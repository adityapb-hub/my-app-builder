import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessages, useUserId } from "@/lib/coop";
import { supabase } from "@/integrations/supabase/client";

export function ChatPanel({
  requestId,
  otherName,
}: {
  requestId: string;
  otherName: string;
}) {
  const uid = useUserId();
  const { data: messages = [] } = useMessages(requestId);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const lastCount = useRef(0);

  useEffect(() => {
    if (messages.length !== lastCount.current) {
      lastCount.current = messages.length;
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !uid) return;
    setBusy(true);
    const { error } = await supabase
      .from("messages")
      .insert({ request_id: requestId, sender_id: uid, body });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraft("");
  }

  return (
    <div className="flex h-[360px] flex-col rounded-2xl bg-background ring-1 ring-border">
      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Say hello — ask about timing, parts or cost before the visit.
          </p>
        )}
        {messages.map((message) => {
          const mine = message.sender_id === uid;
          return (
            <div
              key={message.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    mine ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {mine ? "You" : otherName.split(" ")[0]} ·{" "}
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={send}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <Textarea
          rows={1}
          placeholder={`Message ${otherName.split(" ")[0]}`}
          className="max-h-24 min-h-[42px] flex-1 resize-none bg-background py-2.5"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={busy || !draft.trim()}
          className="rounded-full"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
