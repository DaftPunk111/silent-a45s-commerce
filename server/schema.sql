create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists cart_items (
  user_id uuid not null references users(id) on delete cascade,
  product_id text not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists orders (
  id text primary key,
  user_id uuid references users(id) on delete set null,
  email text not null,
  country text not null default '',
  address text not null default '',
  payment_provider text not null,
  status text not null,
  items jsonb not null,
  subtotal numeric(10, 2) not null,
  shipping numeric(10, 2) not null,
  total numeric(10, 2) not null,
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx on orders(user_id, created_at desc);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_stripe_session_id_idx on orders(stripe_session_id);

create table if not exists stripe_events (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  received_at timestamptz not null default now()
);
