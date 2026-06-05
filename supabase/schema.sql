-- EXTINROD CRM - esquema inicial para Supabase/PostgreSQL.
-- Ejecutar en Supabase SQL Editor cuando vayamos a conectar datos reales.

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  role text not null default 'asesor',
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
  customer_id uuid not null references public.customers(id) on delete cascade,
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
