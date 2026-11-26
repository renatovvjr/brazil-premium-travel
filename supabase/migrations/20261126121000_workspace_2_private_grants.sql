begin;

-- Supabase may grant new public-schema relations to anon by default. Keep
-- Workspace access limited to authenticated RLS policies and the service role.
revoke all on
  public.workspace_products, public.workspace_departures, public.workspace_offers,
  public.crm_customers, public.crm_customer_contact_points, public.workspace_agency_partners,
  public.workspace_form_submissions, public.workspace_idempotency_keys, public.workspace_email_outbox_events,
  public.crm_leads, public.crm_lead_status_history, public.crm_interactions,
  public.crm_marketing_consent_events, public.crm_marketing_suppressions, public.workspace_audit_log,
  public.workspace_bookings, public.workspace_booking_passengers, public.workspace_payments,
  public.workspace_refunds, public.workspace_agency_commissions, public.workspace_payment_audit,
  public.workspace_refund_audit, public.workspace_booking_financial_summary, public.workspace_commercial_kpis,
  public.workspace_profile_role_audit, public.crm_customer_tags, public.crm_unsubscribe_tokens,
  public.crm_marketing_eligibility, public.workspace_marketing_campaigns, public.workspace_proposals,
  public.workspace_booking_price_snapshots
from public, anon;

revoke execute on function
  public.workspace_change_lead_status(uuid, text, text),
  public.workspace_create_booking(uuid, bigint, integer),
  public.workspace_confirm_booking(uuid),
  public.workspace_cancel_booking(uuid, text),
  public.workspace_record_manual_payment(uuid, text, bigint, text, date, boolean, text),
  public.workspace_confirm_manual_payment(uuid),
  public.workspace_record_refund(uuid, text, bigint, text, uuid, boolean, text),
  public.workspace_complete_refund(uuid)
from public, anon;

commit;
