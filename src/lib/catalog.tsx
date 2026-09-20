import {
  Brush,
  Fan,
  GraduationCap,
  Hammer,
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
  | "electrical"
  | "plumbing"
  | "carpenter"
  | "cleaning"
  | "ac-repair"
  | "appliance"
  | "painting"
  | "tutor"
  | "gardening"
  | "elder-care"
  | "moving"
  | "other";

export type Category = {
  id: CategoryId;
  label: string;
  blurb: string;
  icon: LucideIcon;
  /** Typical charge range shown before a provider quotes. */
  range: [number, number];
  /** Typical arrival window in Tumakuru city. */
  eta: string;
  /** Shown in the emergency strip on the dashboard. */
  emergency?: boolean;
};

export const CATEGORIES: Category[] = [
  {
    id: "electrical",
    label: "Electrician",
    blurb: "Wiring, fans, inverters, MCBs",
    icon: Zap,
    range: [280, 1200],
    eta: "30–45 min",
    emergency: true,
  },
  {
    id: "plumbing",
    label: "Plumber",
    blurb: "Leaks, taps, drains, tanks",
    icon: Wrench,
    range: [250, 900],
    eta: "30–60 min",
    emergency: true,
  },
  {
    id: "carpenter",
    label: "Carpenter",
    blurb: "Doors, wardrobes, furniture",
    icon: Hammer,
    range: [300, 1500],
    eta: "2–4 hrs",
  },
  {
    id: "cleaning",
    label: "House Cleaning",
    blurb: "Deep clean, weekly housekeeping",
    icon: Sparkles,
    range: [250, 1500],
    eta: "Same day",
  },
  {
    id: "ac-repair",
    label: "AC Repair",
    blurb: "Service, gas refill, installation",
    icon: Fan,
    range: [400, 2500],
    eta: "1–3 hrs",
    emergency: true,
  },
  {
    id: "appliance",
    label: "Appliance Repair",
    blurb: "Washer, fridge, chimney, oven",
    icon: WashingMachine,
    range: [400, 1800],
    eta: "2–5 hrs",
  },
  {
    id: "painting",
    label: "Home Painting",
    blurb: "Interior, putty, waterproofing",
    icon: Brush,
    range: [380, 3000],
    eta: "Next day",
  },
  {
    id: "tutor",
    label: "Tutor Services",
    blurb: "Maths, science, languages, PUC",
    icon: GraduationCap,
    range: [350, 900],
    eta: "Scheduled",
  },
  {
    id: "gardening",
    label: "Gardening",
    blurb: "Lawns, terraces, replanting",
    icon: Leaf,
    range: [220, 800],
    eta: "Same day",
  },
  {
    id: "elder-care",
    label: "Elder Care",
    blurb: "Companionship, medication, mobility",
    icon: HeartHandshake,
    range: [500, 2000],
    eta: "Scheduled",
  },
  {
    id: "moving",
    label: "Moving Assistance",
    blurb: "Packing, tempo, shifting day",
    icon: Truck,
    range: [900, 4000],
    eta: "Next day",
  },
  {
    id: "other",
    label: "Other",
    blurb: "Something else entirely",
    icon: Plus,
    range: [200, 1000],
    eta: "Same day",
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, Category>,
);

/** Neighbourhoods HomeEase covers in Tumakuru, Karnataka. */
export const TUMAKURU_AREAS = [
  "SIT Area",
  "Ashok Nagar",
  "Kyathsandra",
  "SS Puram",
  "Gandhi Nagar",
  "Batawadi",
  "Gubbi Gate",
  "Ring Road",
] as const;

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
