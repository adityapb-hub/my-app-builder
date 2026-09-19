-- Keep community_tasks.joined_count in step with the participants table.
CREATE OR REPLACE FUNCTION public.sync_task_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_tasks SET joined_count = joined_count + 1 WHERE id = NEW.task_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_tasks SET joined_count = GREATEST(joined_count - 1, 0) WHERE id = OLD.task_id;
  END IF;
  RETURN NULL;
END
$$;

REVOKE ALL ON FUNCTION public.sync_task_participants() FROM PUBLIC;

DROP TRIGGER IF EXISTS community_participants_sync ON public.community_participants;
CREATE TRIGGER community_participants_sync
AFTER INSERT OR DELETE ON public.community_participants
FOR EACH STATEMENT EXECUTE FUNCTION public.sync_task_participants();

-- Residents vote on a community task without needing edit rights on the row.
CREATE OR REPLACE FUNCTION public.community_vote(p_task uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.community_tasks SET votes = votes + 1 WHERE id = p_task;
END
$$;

REVOKE ALL ON FUNCTION public.community_vote(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.community_vote(uuid) TO authenticated;