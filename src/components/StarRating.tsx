import { Star } from "lucide-react";

export function StarRating({
  value,
  size = "sm",
  onChange,
}: {
  value: number;
  size?: "sm" | "lg";
  onChange?: (value: number) => void;
}) {
  const px = size === "lg" ? "size-7" : "size-4";
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const Wrapper = onChange ? "button" : "span";
        return (
          <Wrapper
            key={star}
            {...(onChange
              ? {
                  type: "button" as const,
                  onClick: () => onChange(star),
                  "aria-label": `Rate ${star} star${star > 1 ? "s" : ""}`,
                  className:
                    "transition-transform hover:scale-110 focus-visible:outline-none",
                }
              : { className: "" })}
          >
            <Star
              className={`${px} ${
                filled ? "fill-warning text-warning" : "text-muted-foreground/40"
              }`}
            />
          </Wrapper>
        );
      })}
    </div>
  );
}
