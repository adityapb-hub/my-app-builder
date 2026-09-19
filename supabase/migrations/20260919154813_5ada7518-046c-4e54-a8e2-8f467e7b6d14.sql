-- Trigger helper: only the database itself may run this.
revoke all on function public.handle_new_user() from public, anon, authenticated, service_role;

-- Role helper: run as the caller, so RLS on user_roles scopes every answer to their own rows.
alter function public.has_role(_user_id uuid, _role public.app_role) security invoker;
revoke all on function public.has_role(uuid, public.app_role) from public, anon, service_role;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- Updated-at helper: same treatment, invoker-only.
revoke all on function public.set_updated_at() from public, anon;