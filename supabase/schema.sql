-- EXTINROD CRM - esquema inicial para Supabase/PostgreSQL.
-- Ejecutar en Supabase SQL Editor cuando vayamos a conectar datos reales.

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email text unique not null,
  role text not null default 'asesor' check (role in ('admin', 'gerencia', 'ventas', 'operaciones', 'asesor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  sector text,
  status text not null default 'prospecto',
  owner_id uuid references public.employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  title text not null,
  stage text not null default 'contacto',
  amount numeric(12,2) default 0,
  probability integer default 25,
  expected_close_date date,
  owner_id uuid references public.employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  employee_id uuid references public.employees(id),
  type text not null default 'llamada',
  notes text not null,
  next_action text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'pendiente',
  priority text not null default 'media',
  assigned_to uuid references public.employees(id),
  customer_id uuid references public.customers(id) on delete set null,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  quote_number text unique,
  status text not null default 'borrador',
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  valid_until date,
  created_by uuid references public.employees(id),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  external_source text not null default 'syscom',
  external_id text,
  sku text not null,
  model text,
  brand text,
  name text not null,
  category text not null,
  description text,
  image_url text,
  product_url text,
  currency text not null default 'USD',
  last_price numeric(12,2),
  last_stock integer,
  active boolean not null default true,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (external_source, sku)
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  contact_name text,
  email text,
  phone text,
  company_name text,
  message text,
  source text not null default 'web',
  status text not null default 'nuevo' check (status in ('nuevo', 'asignado', 'cotizando', 'enviado', 'cerrado', 'perdido')),
  assigned_to uuid references public.employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_request_items (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  sku text not null,
  name text not null,
  brand text,
  qty integer not null default 1 check (qty > 0),
  captured_price numeric(12,2),
  captured_stock integer,
  created_at timestamptz not null default now()
);

create table if not exists public.customer_wishlist_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  external_source text not null default 'syscom',
  external_id text,
  sku text not null,
  model text,
  brand text,
  name text not null,
  image_url text,
  product_url text,
  category text,
  created_at timestamptz not null default now(),
  unique (customer_id, external_source, sku)
);

create table if not exists public.maintenance_assets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  asset_type text not null,
  location text,
  last_service_date date,
  next_service_date date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists employees_user_id_idx on public.employees(user_id);
create index if not exists customers_owner_id_idx on public.customers(owner_id);
create index if not exists opportunities_customer_id_idx on public.opportunities(customer_id);
create index if not exists follow_ups_due_at_idx on public.follow_ups(due_at) where completed_at is null;
create index if not exists tasks_due_date_idx on public.tasks(due_date) where completed_at is null;
create index if not exists products_category_idx on public.products(category) where active = true;
create index if not exists products_sku_idx on public.products(sku);
create index if not exists quote_requests_status_idx on public.quote_requests(status, created_at);
create index if not exists quote_request_items_request_idx on public.quote_request_items(quote_request_id);
create index if not exists customer_wishlist_items_customer_idx on public.customer_wishlist_items(customer_id, created_at desc);

alter table public.employees enable row level security;
alter table public.customers enable row level security;
alter table public.opportunities enable row level security;
alter table public.follow_ups enable row level security;
alter table public.tasks enable row level security;
alter table public.quotes enable row level security;
alter table public.products enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_items enable row level security;
alter table public.customer_wishlist_items enable row level security;
alter table public.maintenance_assets enable row level security;

create or replace function public.link_employee_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.employees
  set user_id = new.id
  where lower(email) = lower(new.email)
    and (user_id is null or user_id = new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_link_employee on auth.users;

create trigger on_auth_user_link_employee
after insert or update of email on auth.users
for each row execute function public.link_employee_auth_user();

create or replace function public.is_active_employee()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.employees
    where user_id = (select auth.uid())
      and active = true
  );
$$;

create or replace function public.current_employee_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.employees
  where user_id = (select auth.uid())
    and active = true
  limit 1;
$$;

create or replace view public.current_employee as
select *
from public.employees
where user_id = (select auth.uid())
  and active = true;

drop policy if exists "Employees read own profile" on public.employees;
drop policy if exists "Authenticated staff read employees" on public.employees;
drop policy if exists "Authenticated staff read products" on public.products;
drop policy if exists "Authenticated staff read customers" on public.customers;
drop policy if exists "Authenticated staff manage customers" on public.customers;
drop policy if exists "Authenticated staff manage opportunities" on public.opportunities;
drop policy if exists "Authenticated staff manage follow ups" on public.follow_ups;
drop policy if exists "Authenticated staff manage tasks" on public.tasks;
drop policy if exists "Authenticated staff manage quotes" on public.quotes;
drop policy if exists "Authenticated staff read quote requests" on public.quote_requests;
drop policy if exists "Authenticated staff manage quote requests" on public.quote_requests;
drop policy if exists "Authenticated staff read quote request items" on public.quote_request_items;
drop policy if exists "Authenticated staff manage quote request items" on public.quote_request_items;
drop policy if exists "Authenticated staff read customer wishlist" on public.customer_wishlist_items;
drop policy if exists "Authenticated staff manage customer wishlist" on public.customer_wishlist_items;
drop policy if exists "Authenticated staff manage maintenance assets" on public.maintenance_assets;

create policy "Employees read own profile"
  on public.employees for select
  using (user_id = (select auth.uid()));

create policy "Authenticated staff read employees"
  on public.employees for select
  to authenticated
  using (public.is_active_employee());

create policy "Authenticated staff read products"
  on public.products for select
  to authenticated
  using (active = true);

create policy "Authenticated staff read customers"
  on public.customers for select
  to authenticated
  using (public.is_active_employee());

create policy "Authenticated staff manage customers"
  on public.customers for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());

create policy "Authenticated staff manage opportunities"
  on public.opportunities for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());

create policy "Authenticated staff manage follow ups"
  on public.follow_ups for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());

create policy "Authenticated staff manage tasks"
  on public.tasks for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());

create policy "Authenticated staff manage quotes"
  on public.quotes for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());

create policy "Authenticated staff read quote requests"
  on public.quote_requests for select
  to authenticated
  using (public.is_active_employee());

create policy "Authenticated staff manage quote requests"
  on public.quote_requests for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());

create policy "Authenticated staff read quote request items"
  on public.quote_request_items for select
  to authenticated
  using (public.is_active_employee());

create policy "Authenticated staff manage quote request items"
  on public.quote_request_items for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());

create policy "Authenticated staff read customer wishlist"
  on public.customer_wishlist_items for select
  to authenticated
  using (public.is_active_employee());

create policy "Authenticated staff manage customer wishlist"
  on public.customer_wishlist_items for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());

create policy "Authenticated staff manage maintenance assets"
  on public.maintenance_assets for all
  to authenticated
  using (public.is_active_employee())
  with check (public.is_active_employee());
