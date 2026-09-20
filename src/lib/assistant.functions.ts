import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM = `You are the intake assistant for HomeEase, a neighbourhood services
platform in India. The user describes a household problem in plain language.

Reply with JSON only, matching exactly this shape:
{
  "category": "one of plumbing|electrical|cleaning|gardening|tutor|appliance|elder-care|painting|moving|other",
  "summary": "one short sentence restating the job",
  "estimate_min": number,   // rupees, low end of a fair total for this job
  "estimate_max": number,   // rupees, high end
  "urgency": "now|today|this-week|flexible",
  "why": "one short sentence explaining the category choice",
  "checks": ["up to 3 short things the resident can do or tell the worker"]
}

Keep every string under 140 characters. Prices should be realistic Indian
market rates and include a typical visit plus labour.`;

const parsed = z.object({
  category: z.string(),
  summary: z.string(),
  estimate_min: z.number(),
  estimate_max: z.number(),
  urgency: z.string(),
  why: z.string(),
  checks: z.array(z.string()),
});

export const assistantAdvise = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      problem: z.string().min(4, "Say a little more about the problem."),
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      throw new Error("The assistant isn't configured yet.");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-5.4",
          temperature: 0.2,
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: data.problem },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `The assistant is unavailable right now (${response.status}).`,
      );
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content ?? "";

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("The assistant couldn't make sense of that. Try again.");
    }

    const result = parsed.safeParse(JSON.parse(text.slice(start, end + 1)));
    if (!result.success) {
      throw new Error("The assistant couldn't make sense of that. Try again.");
    }
    return result.data;
  });
