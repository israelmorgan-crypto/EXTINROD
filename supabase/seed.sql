-- EXTINROD CRM - datos iniciales del equipo.
-- Ejecutar despues de `schema.sql`.
-- Cuando se creen usuarios en Supabase Auth, vincular cada registro con auth.users.id en employees.user_id.

insert into public.employees (full_name, email, role, active)
values
  ('Contacto EXTINROD', 'contacto@extinrod.mx', 'ventas', true),
  ('Israel Morgan', 'israel.morgan@extinrod.mx', 'admin', true),
  ('G. Rodriguez', 'g.rodriguez@extinrod.mx', 'ventas', true),
  ('A. Rodriguez', 'a.rodriguez@extinrod.mx', 'asesor', true),
  ('Taller EXTINROD', 'taller@extinrod.mx', 'operaciones', true)
on conflict (email) do update
set
  full_name = excluded.full_name,
  role = excluded.role,
  active = excluded.active;

insert into public.customers (company_name, contact_name, email, sector, status, owner_id)
select
  'Prospecto web',
  'Contacto general',
  'contacto@extinrod.mx',
  'General',
  'prospecto',
  e.id
from public.employees e
where e.email = 'g.rodriguez@extinrod.mx'
on conflict do nothing;
