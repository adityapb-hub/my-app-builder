import {
  Brush,
  GraduationCap,
  HeartHandshake,
  Leaf,
  Plus,
  Sparkles,
  Truck,
  WashingMachine,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "plumbing"
  | "electrical"
  | "cleaning"
  | "gardening"
  | "tutor"
  | "appliance"
  | "elder-care"
  | "painting"
  | "moving"
  | "other";

export type Category = {
  id: CategoryId;
  label: string;
  blurb: string;
  icon: LucideIcon;
  /** Typical charge range shown before a provider quotes. */
  range: [number, number];
};

export const CATEGORIES: Category[] = [
  {
    id: "plumbing",
    label: "Plumbing",
    blurb: "Leaks, taps, drains, tanks",
    icon: Wrench,
    range: [250, 900],
  },
  {
    id: "electrical",
    label: "Electrician",
    blurb: "Wiring, fans, inverters, MCBs",
    icon: Zap,
    range: [280, 1200],
  },
  {
    id: "cleaning",
    label: "Cleaning",
    blurb: "Deep clean, weekly housekeeping",
    icon: Sparkles,
    range: [250, 1500],
  },
  {
    id: "gardening",
    label: "Gardening",
    blurb: "Lawns, terraces, replanting",
    icon: Leaf,
    range: [220, 800],
  },
  {
    id: "tutor",
    label: "Home Tutor",
    blurb: "Maths, science, languages",
    icon: GraduationCap,
    range: [350, 900],
  },
  {
    id: "appliance",
    label: "Appliance Repair",
    blurb: "Washer, fridge, AC, chimney",
    icon: WashingMachine,
    range: [400, 1800],
  },
  {
    id: "elder-care",
    label: "Elder Care",
    blurb: "Companionship, medication, mobility",
    icon: HeartHandshake,
    range: [500, 2000],
  },
  {
    id: "painting",
    label: "Painting",
    blurb: "Interior, putty, waterproofing",
    icon: Brush,
    range: [380, 3000],
  },
  {
    id: "moving",
    label: "Moving Assistance",
    blurb: "Packing, van, shifting day",
    icon: Truck,
    range: [900, 4000],
  },
  {
    id: "other",
    label: "Other",
    blurb: "Something else entirely",
    icon: Plus,
    range: [200, 1000],
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, Category>,
);

export function categoryLabel(id: string): string {
  return CATEGORY_MAP[id as CategoryId]?.label ?? "General help";
}

export function categoryIcon(id: string): LucideIcon {
  return CATEGORY_MAP[id as CategoryId]?.icon ?? Plus;
}

export function formatRupees(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function isKnownCategory(id: string): id is CategoryId {
  return Object.prototype.hasOwnProperty.call(CATEGORY_MAP, id);
}

/** Collective job types residents post on the community board. */
export const COMMUNITY_KINDS = [
  { id: "apartment_cleaning", label: "Apartment cleaning" },
  { id: "garbage_collection", label: "Garbage collection" },
  { id: "tree_plantation", label: "Tree plantation" },
  { id: "water_tank", label: "Water tank maintenance" },
  { id: "festival", label: "Festival arrangements" },
  { id: "maintenance", label: "Community maintenance" },
  { id: "other", label: "Something else" },
] as const;

export function communityKindLabel(id: string): string {
  return (
    COMMUNITY_KINDS.find((kind) => kind.id === id)?.label ??
    id.replaceAll("_", " ")
  );
}
