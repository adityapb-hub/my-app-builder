DROP TRIGGER IF EXISTS community_participants_sync ON public.community_participants;
DROP FUNCTION IF EXISTS public.sync_task_participants();
DROP FUNCTION IF EXISTS public.community_vote(uuid);

CREATE TABLE public.community_votes (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.community_tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  unique (task_id, user_id)
);

GRANT SELECT ON public.community_votes TO authenticated;
GRANT INSERT, DELETE ON public.community_votes TO authenticated;
GRANT ALL ON public.community_votes TO service_role;

ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_read_all" ON public.community_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "votes_insert_own" ON public.community_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "votes_delete_own" ON public.community_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);