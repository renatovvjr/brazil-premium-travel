begin;

create or replace function public.workspace_create_booking(
  p_lead_id uuid,
  p_agreed_price_minor bigint,
  p_passenger_count integer
)
returns public.workspace_bookings
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lead public.crm_leads;
  v_customer public.crm_customers;
  v_booking public.workspace_bookings;
  v_rate integer;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  if p_agreed_price_minor < 0 or p_passenger_count < 1 then raise exception 'invalid_booking_values'; end if;

  select * into v_lead from public.crm_leads where id = p_lead_id for update;
  if v_lead.id is null then raise exception 'lead_not_found'; end if;
  select * into v_customer from public.crm_customers where id = v_lead.customer_id;

  insert into public.workspace_bookings(
    customer_id, lead_id, product_id, departure_id, agency_partner_id,
    status, agreed_price_minor, passenger_count, booked_at, created_by
  ) values (
    v_lead.customer_id, v_lead.id, v_lead.product_id, v_lead.departure_id, v_lead.agency_partner_id,
    'provisional', p_agreed_price_minor, p_passenger_count, now(), auth.uid()
  ) returning * into v_booking;

  insert into public.workspace_booking_passengers(booking_id, customer_id, display_name, is_lead_passenger)
  values (v_booking.id, v_customer.id, v_customer.display_name, true);

  if v_lead.agency_partner_id is not null then
    select default_commission_bps into v_rate from public.workspace_agency_partners where id = v_lead.agency_partner_id;
    insert into public.workspace_agency_commissions(
      booking_id, agency_partner_id, commission_bps, commissionable_amount_minor, currency
    ) values (v_booking.id, v_lead.agency_partner_id, coalesce(v_rate, 0), p_agreed_price_minor, v_booking.currency);
  end if;

  return v_booking;
end;
$$;

create or replace function public.workspace_audit_booking_row()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.workspace_audit_log(table_name, record_id, action, actor_id, before_state, after_state)
  values (
    'workspace_bookings', new.id, lower(tg_op), auth.uid(),
    case when tg_op = 'UPDATE' then to_jsonb(old) end,
    to_jsonb(new)
  );
  return new;
end;
$$;

create trigger workspace_bookings_audit
after insert or update on public.workspace_bookings
for each row execute function public.workspace_audit_booking_row();

create or replace function public.workspace_confirm_booking(p_booking_id uuid)
returns public.workspace_bookings
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_booking public.workspace_bookings; v_result public.workspace_bookings; v_passengers integer;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  select * into v_booking from public.workspace_bookings where id = p_booking_id for update;
  if v_booking.id is null then raise exception 'booking_not_found'; end if;
  if v_booking.status not in ('draft', 'provisional') then raise exception 'booking_cannot_be_confirmed'; end if;
  select count(*) into v_passengers from public.workspace_booking_passengers where booking_id = p_booking_id;
  if v_passengers <> v_booking.passenger_count then raise exception 'passenger_count_mismatch'; end if;

  update public.workspace_bookings
  set status = 'confirmed', confirmed_at = now()
  where id = p_booking_id returning * into v_result;
  if v_booking.lead_id is not null then
    update public.crm_leads set status = 'booked' where id = v_booking.lead_id;
  end if;
  update public.crm_customers set lifecycle_status = 'customer' where id = v_booking.customer_id;
  return v_result;
end;
$$;

create or replace function public.workspace_cancel_booking(p_booking_id uuid, p_reason text)
returns public.workspace_bookings
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_before public.workspace_bookings; v_result public.workspace_bookings;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'cancellation_reason_required'; end if;
  select * into v_before from public.workspace_bookings where id = p_booking_id for update;
  if v_before.id is null then raise exception 'booking_not_found'; end if;
  if v_before.status in ('cancelled', 'completed') then raise exception 'booking_cannot_be_cancelled'; end if;
  update public.workspace_bookings
  set status = 'cancelled', cancelled_at = now(), cancellation_reason = trim(p_reason)
  where id = p_booking_id returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.workspace_confirm_manual_payment(p_payment_id uuid)
returns public.workspace_payments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_result public.workspace_payments;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  update public.workspace_payments
  set status = 'manual_confirmed', received_at = coalesce(received_at, now())
  where id = p_payment_id and source = 'manual' and status = 'pending'
  returning * into v_result;
  if v_result.id is null then raise exception 'pending_manual_payment_not_found'; end if;
  return v_result;
end;
$$;

create or replace function public.workspace_complete_refund(p_refund_id uuid)
returns public.workspace_refunds
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_refund public.workspace_refunds; v_available bigint; v_result public.workspace_refunds;
begin
  if not public.workspace_is_admin() then raise exception 'access_denied'; end if;
  select * into v_refund from public.workspace_refunds where id = p_refund_id and status in ('requested', 'approved') for update;
  if v_refund.id is null then raise exception 'pending_refund_not_found'; end if;
  perform 1 from public.workspace_bookings where id = v_refund.booking_id for update;
  select net_received_minor into v_available from public.workspace_booking_financial_summary where booking_id = v_refund.booking_id;
  if v_refund.amount_minor > greatest(v_available, 0) then raise exception 'refund_exceeds_net_received'; end if;
  update public.workspace_refunds set status = 'completed', completed_at = now()
  where id = p_refund_id returning * into v_result;
  return v_result;
end;
$$;

grant execute on function public.workspace_create_booking(uuid, bigint, integer) to authenticated;
grant execute on function public.workspace_confirm_booking(uuid) to authenticated;
grant execute on function public.workspace_cancel_booking(uuid, text) to authenticated;
grant execute on function public.workspace_confirm_manual_payment(uuid) to authenticated;
grant execute on function public.workspace_complete_refund(uuid) to authenticated;

commit;
