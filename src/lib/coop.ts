import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "seeker" | "provider" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  city: string;
  area: string | null;
  address: string | null;
};

export type Provider = {
  id: string;
  user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  category: string;
  bio: string | null;
  skills: string[];
  experience_years: number;
  hourly_rate: number;
  area: string | null;
  distance_km: number;
  verified: boolean;
  id_document_url: string | null;
  certificate_url: string | null;
  rating: number;
  rating_count: number;
  jobs_completed: number;
  available_now: boolean;
  availability: string | null;
};

export type BookingStatus =
  | "searching"
  | "requested"
  | "accepted"
  | "on_the_way"
  | "completed"
  | "cancelled"
  | "declined";

export type Booking = {
  id: string;
  customer_id: string;
  provider_id: string | null;
  category: string;
  title: string;
  description: string | null;
  photo_urls: string[];
  preferred_date: string | null;
  preferred_time: string | null;
  area: string | null;
  address: string | null;
  quoted_price: number | null;
  final_price: number | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  provider: Provider | null;
};

export type CommunityTask = {
  id: string;
  creator_id: string | null;
  creator_name: string;
  title: string;
  description: string | null;
  category: string;
  apartment_name: string | null;
  location: string | null;
  event_date: string | null;
  cost_per_household: number;
  seats_needed: number;
  joined_count: number;
  votes: number;
  status: string;
  created_at: string;
  joined?: boolean;
  voted?: boolean;
};

export type ChatMessage = {
  id: string;
  request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/* Session + identity                                                  */
/* ------------------------------------------------------------------ */

export function useSession() {
  return useQuery({
    queryKey: ["coop", "session"],
    staleTime: Infinity,
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
}

export function useUserId() {
  const { data: session } = useSession();
  return session?.user.id ?? null;
}

export function useRoles() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["coop", "roles", uid],
    enabled: !!uid,
    initialData: [] as Role[],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid as string);
      return (data ?? []).map((row) => row.role as Role);
    },
  });
}

export function useProfile() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["coop", "profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid as string)
        .maybeSingle();
      return (data as unknown as Profile) ?? null;
    },
  });
}

export function useMyProvider() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["coop", "my-provider", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_providers")
        .select("*")
        .eq("user_id", uid as string)
        .maybeSingle();
      return (data as unknown as Provider) ?? null;
    },
  });
}

export function useActor() {
  const { data: session, isPending: sessionPending } = useSession();
  const uid = session?.user.id ?? null;
  const { data: roles = [] } = useRoles();
  const { data: profile } = useProfile();
  const { data: provider } = useMyProvider();

  return {
    user: session?.user ?? null,
    uid,
    loading: sessionPending,
    roles,
    profile: profile ?? null,
    provider: provider ?? null,
    isSeeker: roles.includes("seeker"),
    isProvider: roles.includes("provider"),
    hasRole: (role: Role) => roles.includes(role),
  };
}

/* ------------------------------------------------------------------ */
/* Directory + bookings                                                */
/* ------------------------------------------------------------------ */

export function useProviders(category?: string) {
  return useQuery({
    queryKey: ["coop", "providers", category ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("service_providers")
        .select("*")
        .order("rating", { ascending: false });
      if (category && category !== "all") query = query.eq("category", category);
      const { data } = await query;
      return (data ?? []) as unknown as Provider[];
    },
  });
}

export function useProvider(id?: string) {
  return useQuery({
    queryKey: ["coop", "provider", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_providers")
        .select("*")
        .eq("id", id as string)
        .maybeSingle();
      return (data as unknown as Provider) ?? null;
    },
  });
}

export function useMyBookings() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["coop", "bookings", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*, provider:service_providers(*)")
        .eq("customer_id", uid as string)
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as Booking[];
    },
  });
}

export function useBooking(id?: string) {
  return useQuery({
    queryKey: ["coop", "booking", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*, provider:service_providers(*)")
        .eq("id", id as string)
        .maybeSingle();
      return (data as unknown as Booking) ?? null;
    },
  });
}

/** Jobs visible to the signed-in provider: theirs, plus open ones in their trade. */
export function useProviderJobs() {
  const { data: me } = useMyProvider();
  return useQuery({
    queryKey: ["coop", "provider-jobs", me?.id, me?.category],
    enabled: !!me,
    queryFn: async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("*, provider:service_providers(*)")
        .eq("category", me?.category as string)
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as Booking[];
    },
  });
}

export function useReview(requestId?: string) {
  return useQuery({
    queryKey: ["coop", "review", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("request_id", requestId as string)
        .maybeSingle();
      return (data as { rating: number; comment: string | null } | null) ?? null;
    },
  });
}

/* ------------------------------------------------------------------ */
/* Community + chat                                                    */
/* ------------------------------------------------------------------ */

export function useCommunityTasks() {
  const uid = useUserId();
  return useQuery({
    queryKey: ["coop", "community", uid],
    queryFn: async () => {
      const [tasksRes, membersRes, votesRes] = await Promise.all([
        supabase
          .from("community_tasks")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("community_participants").select("task_id, user_id"),
        supabase.from("community_votes").select("task_id, user_id"),
      ]);

      const tasks = (tasksRes.data ?? []) as unknown as CommunityTask[];
      const members = membersRes.data ?? [];
      const votes = votesRes.data ?? [];

      return tasks.map((task) => {
        const taskMembers = members.filter((row) => row.task_id === task.id);
        const taskVotes = votes.filter((row) => row.task_id === task.id);
        return {
          ...task,
          joined_count: taskMembers.length,
          votes: taskVotes.length,
          joined: !!uid && taskMembers.some((row) => row.user_id === uid),
          voted: !!uid && taskVotes.some((row) => row.user_id === uid),
        };
      });
    },
  });
}

/** Add or remove the signed-in household from a community task. */
export async function setTaskMembership(
  taskId: string,
  userId: string,
  join: boolean,
) {
  if (join) {
    const { error } = await supabase
      .from("community_participants")
      .insert({ task_id: taskId, user_id: userId });
    return error;
  }
  const { error } = await supabase
    .from("community_participants")
    .delete()
    .eq("task_id", taskId)
    .eq("user_id", userId);
  return error;
}

/** Cast or withdraw the signed-in household's vote on a community task. */
export async function setTaskVote(
  taskId: string,
  userId: string,
  vote: boolean,
) {
  if (vote) {
    const { error } = await supabase
      .from("community_votes")
      .insert({ task_id: taskId, user_id: userId });
    return error;
  }
  const { error } = await supabase
    .from("community_votes")
    .delete()
    .eq("task_id", taskId)
    .eq("user_id", userId);
  return error;
}

export function useMessages(requestId?: string) {
  return useQuery({
    queryKey: ["coop", "messages", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("request_id", requestId as string)
        .order("created_at", { ascending: true });
      return (data ?? []) as unknown as ChatMessage[];
    },
  });
}

/* ------------------------------------------------------------------ */
/* Utilities                                                           */
/* ------------------------------------------------------------------ */

export function useTick(ms = 1000) {
  const [, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCount((c) => c + 1), ms);
    return () => clearInterval(timer);
  }, [ms]);
}

export function refreshAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["coop"] });
}

export const STATUS_LABELS: Record<string, string> = {
  searching: "Looking for a provider",
  requested: "Request sent",
  accepted: "Accepted by provider",
  on_the_way: "Worker on the way",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};

export const COMMUNITY_LABELS: Record<string, string> = {
  open: "Open for volunteers",
  voting: "Voting in progress",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** Reviews a provider has collected, newest first. */
export function useProviderReviews(providerId?: string) {
  return useQuery({
    queryKey: ["coop", "provider-reviews", providerId],
    enabled: !!providerId,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, request_id")
        .eq("provider_id", providerId as string)
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as {
        id: string;
        rating: number;
        comment: string | null;
        created_at: string;
        request_id: string;
      }[];
    },
  });
}

/** How many homes have joined a community task, and whether you're one of them. */
export function useTaskParticipants(taskId?: string) {
  const uid = useUserId();
  return useQuery({
    queryKey: ["coop", "task-participants", taskId],
    enabled: !!taskId,
    queryFn: async () => {
      const { data } = await supabase
        .from("community_participants")
        .select("user_id")
        .eq("task_id", taskId as string);
      const ids = (data ?? []).map((row) => row.user_id);
      return { ids, count: ids.length, joined: !!uid && ids.includes(uid) };
    },
  });
}
