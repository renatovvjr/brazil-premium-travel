begin;

create or replace function public.workspace_claim_outbox(p_limit integer default 10)
returns table(
  event_id uuid,
  submission_id uuid,
  template_key text,
  recipient_kind text,
  payload jsonb
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  with claimed as (
    select event.id
    from public.workspace_email_outbox_events event
    where (
        (event.status in ('pending', 'failed') and event.next_attempt_at <= now())
        or (event.status = 'processing' and event.locked_at < now() - interval '15 minutes')
      )
      and event.attempt_count < 5
    order by event.created_at
    for update skip locked
    limit least(greatest(p_limit, 1), 25)
  ), updated as (
    update public.workspace_email_outbox_events event
    set status = 'processing', locked_at = now(), attempt_count = attempt_count + 1
    from claimed
    where event.id = claimed.id
    returning event.id, event.submission_id, event.template_key, event.recipient_kind
  )
  select updated.id, updated.submission_id, updated.template_key, updated.recipient_kind, submission.payload
  from updated
  join public.workspace_form_submissions submission on submission.id = updated.submission_id;
end;
$$;

create or replace function public.workspace_complete_outbox(p_event_id uuid, p_provider_message_id text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.workspace_email_outbox_events
  set status = 'sent', sent_at = now(), provider_message_id = p_provider_message_id,
      last_error_code = null, locked_at = null
  where id = p_event_id and status = 'processing';
$$;

create or replace function public.workspace_fail_outbox(p_event_id uuid, p_error_code text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.workspace_email_outbox_events
  set status = 'failed', last_error_code = left(p_error_code, 100), locked_at = null,
      next_attempt_at = now() + make_interval(mins => least(60, power(2, least(attempt_count, 5))::integer))
  where id = p_event_id and status = 'processing';
$$;

revoke all on function public.workspace_claim_outbox(integer) from public, anon, authenticated;
revoke all on function public.workspace_complete_outbox(uuid, text) from public, anon, authenticated;
revoke all on function public.workspace_fail_outbox(uuid, text) from public, anon, authenticated;
grant execute on function public.workspace_claim_outbox(integer) to service_role;
grant execute on function public.workspace_complete_outbox(uuid, text) to service_role;
grant execute on function public.workspace_fail_outbox(uuid, text) to service_role;

commit;
