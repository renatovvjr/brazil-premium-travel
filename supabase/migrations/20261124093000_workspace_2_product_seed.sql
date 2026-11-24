begin;

insert into public.workspace_products(code, name, category, status) values
  ('signature-journey', 'Brazil Signature Journey', 'signature', 'active'),
  ('grand-journey', 'Grand Carnaval Journey', 'carnaval', 'active'),
  ('rio-bahia', 'Rio & Bahia Carnaval Escape', 'carnaval', 'active'),
  ('rio-minas', 'Rio & Minas Carnaval Heritage', 'carnaval', 'active')
on conflict (code) do update set name = excluded.name, category = excluded.category, status = excluded.status;

insert into public.workspace_departures(product_id, code, starts_on, ends_on, capacity, status)
select id, 'signature-open', null, null, null, 'planning' from public.workspace_products where code = 'signature-journey'
union all
select id, 'grand-journey-2027-01-28', date '2027-01-28', date '2027-02-14', 12, 'open' from public.workspace_products where code = 'grand-journey'
union all
select id, 'rio-bahia-2027-02-01', date '2027-02-01', date '2027-02-14', 8, 'open' from public.workspace_products where code = 'rio-bahia'
union all
select id, 'rio-minas-2027-02-01', date '2027-02-01', date '2027-02-14', 8, 'open' from public.workspace_products where code = 'rio-minas'
on conflict (code) do update set
  product_id = excluded.product_id, starts_on = excluded.starts_on, ends_on = excluded.ends_on,
  capacity = excluded.capacity, status = excluded.status;

insert into public.workspace_offers(departure_id, code, currency, price_minor, pricing_basis, status)
select id, 'grand-journey-2027-from-twin', 'AUD', 1990000, 'per person, twin share', 'active'
from public.workspace_departures where code = 'grand-journey-2027-01-28'
union all
select id, 'rio-bahia-2027-from-twin', 'AUD', 1890000, 'per person, twin share', 'active'
from public.workspace_departures where code = 'rio-bahia-2027-02-01'
union all
select id, 'rio-minas-2027-from-twin', 'AUD', 1699000, 'per person, twin share', 'active'
from public.workspace_departures where code = 'rio-minas-2027-02-01'
on conflict (code) do update set
  departure_id = excluded.departure_id, currency = excluded.currency,
  price_minor = excluded.price_minor, pricing_basis = excluded.pricing_basis, status = excluded.status;

commit;
