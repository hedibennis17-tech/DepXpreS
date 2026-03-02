-- FastDép PostgreSQL / Supabase-ready schema
-- Complete backend database for: Client App, Driver App, Admin Dashboard
-- Generated for a convenience-store delivery platform serving Greater Montreal
-- Vendor-neutral PostgreSQL schema (compatible with Supabase with minor adaptation)

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- =========================================================
-- HELPERS
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- ENUMS
-- =========================================================

do $$ begin
  create type user_status as enum ('pending','active','blocked','suspended','deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('client','driver','admin','dispatcher','support','finance','verifier_docs','store_manager','analyst','super_admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type auth_provider as enum ('email_password','phone_otp','email_otp','google','apple');
exception when duplicate_object then null; end $$;

do $$ begin
  create type profile_completion_status as enum ('draft','partial','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type address_type as enum ('home','work','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type zone_status as enum ('active','inactive','paused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type store_status as enum ('draft','active','inactive','paused','blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type catalog_visibility as enum ('visible','hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_status as enum ('in_stock','low_stock','out_of_stock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_verification_status as enum ('pending','approved','rejected','expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('draft','submitted','under_review','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type driver_live_status as enum ('offline','online','busy','paused','suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type driver_availability_status as enum ('available','reserved','heading_to_store','at_store','picked_up','heading_to_customer','arrived','delivered');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vehicle_type as enum ('car','bike','ebike','scooter','van','walking');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_type as enum ('delivery','pickup');
exception when duplicate_object then null; end $$;

do $$ begin
  create type cart_status as enum ('active','converted','abandoned','expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'draft','pending_auth','pending_payment','paid','store_confirmed','preparing','ready_for_pickup',
    'driver_assigned','driver_en_route_store','at_store','picked_up','driver_en_route_customer',
    'arrived','delivered','completed','cancelled','refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','requires_action','authorized','succeeded','failed','partially_refunded','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_provider as enum ('stripe','cash','wallet','manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payout_status as enum ('pending','approved','rejected','paid','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wallet_owner_type as enum ('client','driver','store');
exception when duplicate_object then null; end $$;

do $$ begin
  create type wallet_txn_type as enum ('credit','debit','hold','release','withdrawal','refund','bonus','promo_credit','tip');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_channel as enum ('push','sms','email','in_app');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_status as enum ('queued','sent','failed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type support_priority as enum ('low','medium','high','urgent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type support_status as enum ('open','pending','resolved','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type promotion_type as enum ('fixed_amount','percentage','free_delivery','wallet_credit','bundle');
exception when duplicate_object then null; end $$;

do $$ begin
  create type promotion_status as enum ('draft','active','paused','expired','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dispatch_mode as enum ('auto','manual','hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dispatch_status as enum ('queued','searching','offer_sent','assigned','rejected','expired','manual_override');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_actor_type as enum ('client','driver','store','admin','system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type thread_type as enum ('order','support','direct');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_target_type as enum ('driver','store','order');
exception when duplicate_object then null; end $$;

do $$ begin
  create type export_status as enum ('queued','processing','ready','failed');
exception when duplicate_object then null; end $$;

-- =========================================================
-- SECURITY / RBAC
-- =========================================================

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  description text,
  is_system boolean not null default true,
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  module_key text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (role_id, permission_id)
);

-- =========================================================
-- USERS / AUTH / PROFILES
-- =========================================================

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email citext unique,
  phone text unique,
  display_name text,
  photo_url text,
  primary_role user_role not null,
  status user_status not null default 'active',
  preferred_language text not null default 'fr',
  preferred_currency text not null default 'CAD',
  is_email_verified boolean not null default false,
  is_phone_verified boolean not null default false,
  last_login_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_users_contact_check check (email is not null or phone is not null)
);

create table if not exists user_auth_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  provider auth_provider not null,
  provider_user_id text,
  provider_email citext,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, provider),
  unique (provider, provider_user_id)
);

create table if not exists user_role_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  role_id uuid not null references roles(id) on delete cascade,
  assigned_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);

create table if not exists otp_sessions (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  identifier_type text not null check (identifier_type in ('email','phone')),
  role_target user_role,
  code_hash text not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  status text not null default 'pending' check (status in ('pending','verified','expired','blocked')),
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_sessions_identifier on otp_sessions(identifier, status, created_at desc);

create table if not exists client_profiles (
  user_id uuid primary key references app_users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  full_name text generated always as (trim(first_name || ' ' || last_name)) stored,
  date_of_birth date,
  default_address_id uuid,
  loyalty_points int not null default 0,
  marketing_opt_in boolean not null default false,
  email_notifications boolean not null default true,
  sms_notifications boolean not null default true,
  push_notifications boolean not null default true,
  completion_status profile_completion_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_addresses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(user_id) on delete cascade,
  type address_type not null default 'home',
  label text not null,
  contact_name text,
  contact_phone text,
  line1 text not null,
  line2 text,
  city text not null,
  province text not null default 'QC',
  postal_code text not null,
  country text not null default 'CA',
  latitude numeric(10,7),
  longitude numeric(10,7),
  zone_id uuid,
  delivery_instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists client_payment_methods (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(user_id) on delete cascade,
  provider payment_provider not null default 'stripe',
  external_payment_method_id text,
  brand text,
  last4 text,
  exp_month int,
  exp_year int,
  billing_name text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(user_id) on delete cascade,
  author_admin_id uuid references app_users(id) on delete set null,
  note_type text not null default 'internal',
  content text not null,
  visibility text not null default 'internal' check (visibility in ('internal','restricted')),
  created_at timestamptz not null default now()
);

create table if not exists driver_profiles (
  user_id uuid primary key references app_users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  full_name text generated always as (trim(first_name || ' ' || last_name)) stored,
  date_of_birth date,
  address_line1 text,
  address_line2 text,
  city text,
  province text default 'QC',
  postal_code text,
  application_status application_status not null default 'draft',
  driver_status driver_live_status not null default 'offline',
  availability_status driver_availability_status not null default 'available',
  verification_status document_verification_status not null default 'pending',
  background_check_status text not null default 'pending' check (background_check_status in ('pending','approved','rejected')),
  current_zone_id uuid,
  current_order_id uuid,
  rating_average numeric(3,2) not null default 0,
  rating_count int not null default 0,
  total_deliveries int not null default 0,
  emergency_contact_name text,
  emergency_contact_phone text,
  completion_status profile_completion_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists driver_applications (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null unique references driver_profiles(user_id) on delete cascade,
  current_step int not null default 1,
  status application_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_by uuid references app_users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists driver_application_personal (
  application_id uuid primary key references driver_applications(id) on delete cascade,
  first_name text,
  last_name text,
  email citext,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  date_of_birth date,
  tax_identifier text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists driver_vehicles (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references driver_profiles(user_id) on delete cascade,
  make text not null,
  model text not null,
  model_year int,
  color text,
  plate_number text,
  vehicle_type vehicle_type not null,
  cargo_capacity text,
  is_primary boolean not null default false,
  verification_status document_verification_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists driver_application_vehicles (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references driver_applications(id) on delete cascade,
  make text,
  model text,
  model_year int,
  color text,
  plate_number text,
  vehicle_type vehicle_type,
  cargo_capacity text,
  created_at timestamptz not null default now()
);

create table if not exists driver_documents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references driver_profiles(user_id) on delete cascade,
  vehicle_id uuid references driver_vehicles(id) on delete set null,
  document_type text not null,
  label text not null,
  storage_provider text not null default 'supabase',
  storage_path text not null,
  file_url text,
  mime_type text,
  verification_status document_verification_status not null default 'pending',
  verified_by uuid references app_users(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists driver_locations (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references driver_profiles(user_id) on delete cascade,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  heading numeric(6,2),
  speed_kmh numeric(6,2),
  accuracy_meters numeric(6,2),
  is_online boolean not null default false,
  captured_at timestamptz not null default now()
);
create index if not exists idx_driver_locations_driver_time on driver_locations(driver_id, captured_at desc);

create table if not exists driver_earnings (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references driver_profiles(user_id) on delete cascade,
  order_id uuid,
  base_payout numeric(12,2) not null default 0,
  tip_amount numeric(12,2) not null default 0,
  bonus_amount numeric(12,2) not null default 0,
  adjustment_amount numeric(12,2) not null default 0,
  total_payout numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','paid','cancelled')),
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists driver_incidents (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references driver_profiles(user_id) on delete cascade,
  order_id uuid,
  incident_type text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  description text not null,
  status text not null default 'open' check (status in ('open','reviewing','resolved','closed')),
  created_by uuid references app_users(id) on delete set null,
  resolved_by uuid references app_users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_profiles (
  user_id uuid primary key references app_users(id) on delete cascade,
  full_name text not null,
  job_title text,
  department text,
  last_login_ip text,
  ui_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- WALLET / PAYOUTS
-- =========================================================

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references app_users(id) on delete cascade,
  owner_type wallet_owner_type not null,
  currency text not null default 'CAD',
  balance numeric(12,2) not null default 0,
  hold_balance numeric(12,2) not null default 0,
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, owner_type)
);

create table if not exists wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallets(id) on delete cascade,
  txn_type wallet_txn_type not null,
  reason text not null,
  amount numeric(12,2) not null,
  balance_after numeric(12,2),
  reference_type text,
  reference_id uuid,
  status text not null default 'completed' check (status in ('pending','completed','failed','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists idx_wallet_transactions_wallet on wallet_transactions(wallet_id, created_at desc);

create table if not exists payout_requests (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references driver_profiles(user_id) on delete cascade,
  wallet_id uuid not null references wallets(id) on delete restrict,
  amount numeric(12,2) not null,
  payout_status payout_status not null default 'pending',
  requested_at timestamptz not null default now(),
  approved_by uuid references app_users(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  paid_at timestamptz,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- GEOGRAPHY / STORES / CATALOG
-- =========================================================

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fr text not null,
  name_en text not null,
  city text not null,
  province text not null default 'QC',
  country text not null default 'CA',
  timezone text not null default 'America/Toronto',
  status zone_status not null default 'active',
  primary_store_id uuid,
  day_delivery_fee numeric(10,2) not null default 6.99,
  night_delivery_fee numeric(10,2) not null default 8.99,
  peak_fee numeric(10,2) not null default 0,
  service_radius_km numeric(6,2) not null default 5,
  average_prep_time_min int not null default 12,
  average_delivery_time_min int not null default 18,
  supports_alcohol boolean not null default true,
  supports_tobacco boolean not null default true,
  supports_lotto boolean not null default true,
  polygon_json jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  brand_type text not null default 'independent',
  owner_name text,
  email citext,
  phone text,
  zone_id uuid references zones(id) on delete set null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  province text not null default 'QC',
  postal_code text not null,
  country text not null default 'CA',
  latitude numeric(10,7),
  longitude numeric(10,7),
  store_status store_status not null default 'active',
  is_open_now boolean not null default false,
  supports_delivery boolean not null default true,
  supports_pickup boolean not null default false,
  supports_alcohol boolean not null default true,
  supports_tobacco boolean not null default true,
  supports_lotto boolean not null default true,
  prep_time_min int not null default 10,
  min_order_amount numeric(10,2) not null default 0,
  logo_url text,
  banner_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_stores_zone on stores(zone_id, store_status);

alter table zones
  add constraint fk_zones_primary_store
  foreign key (primary_store_id) references stores(id) on delete set null;

create table if not exists zone_store_fallbacks (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  priority_order int not null default 1,
  created_at timestamptz not null default now(),
  unique (zone_id, store_id)
);

create table if not exists store_hours (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, weekday)
);

create table if not exists store_staff (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  role_label text not null default 'manager',
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  icon text,
  image_url text,
  sort_order int not null default 100,
  is_active boolean not null default true,
  requires_age_verification boolean not null default false,
  is_restricted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  code text not null unique,
  slug text not null unique,
  name_fr text not null,
  name_en text not null,
  sort_order int not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subcategories_category on subcategories(category_id, is_active, sort_order);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  barcode text,
  slug text not null unique,
  brand text,
  category_id uuid not null references categories(id) on delete restrict,
  subcategory_id uuid references subcategories(id) on delete set null,
  name_fr text not null,
  name_en text not null,
  description_fr text,
  description_en text,
  image_urls jsonb not null default '[]'::jsonb,
  unit_label text,
  base_price numeric(10,2) not null default 0,
  currency text not null default 'CAD',
  tax_code text not null default 'qc_standard',
  requires_age_verification boolean not null default false,
  is_restricted boolean not null default false,
  requires_manual_approval boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 100,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on products(category_id, subcategory_id, is_active, sort_order);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_sku text not null unique,
  barcode text,
  label_fr text not null,
  label_en text not null,
  size_label text,
  pack_size int,
  base_price numeric(10,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists store_products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  subcategory_id uuid references subcategories(id) on delete set null,
  price numeric(10,2) not null,
  sale_price numeric(10,2),
  cost_price numeric(10,2),
  stock_qty int not null default 0,
  stock_status stock_status not null default 'in_stock',
  visibility catalog_visibility not null default 'visible',
  is_featured boolean not null default false,
  updated_stock_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, product_id, variant_id)
);
create index if not exists idx_store_products_lookup on store_products(store_id, category_id, subcategory_id, visibility, stock_status);

create table if not exists product_bundles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_fr text not null,
  name_en text not null,
  description_fr text,
  description_en text,
  bundle_price numeric(10,2) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references product_bundles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  unique (bundle_id, product_id, variant_id)
);

-- =========================================================
-- CARTS / ORDERS / DISPATCH / TRACKING
-- =========================================================

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(user_id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  address_id uuid references customer_addresses(id) on delete set null,
  delivery_type delivery_type not null default 'delivery',
  cart_status cart_status not null default 'active',
  scheduled_for timestamptz,
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  tip_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  gst_amount numeric(12,2) not null default 0,
  qst_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  promo_code text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_carts_client on carts(client_id, cart_status, created_at desc);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  variant_id uuid references product_variants(id) on delete set null,
  store_product_id uuid references store_products(id) on delete set null,
  product_name text not null,
  image_url text,
  quantity int not null default 1,
  unit_price numeric(12,2) not null,
  sale_price numeric(12,2),
  line_subtotal numeric(12,2) not null,
  requires_age_verification boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  client_id uuid not null references client_profiles(user_id) on delete restrict,
  store_id uuid references stores(id) on delete set null,
  zone_id uuid references zones(id) on delete set null,
  driver_id uuid references driver_profiles(user_id) on delete set null,
  dispatcher_id uuid references app_users(id) on delete set null,
  cart_id uuid references carts(id) on delete set null,
  address_id uuid references customer_addresses(id) on delete set null,
  delivery_type delivery_type not null default 'delivery',
  order_status order_status not null default 'pending_payment',
  payment_status payment_status not null default 'pending',
  customer_name text,
  customer_phone text,
  delivery_line1 text,
  delivery_line2 text,
  delivery_city text,
  delivery_province text,
  delivery_postal_code text,
  delivery_country text default 'CA',
  delivery_latitude numeric(10,7),
  delivery_longitude numeric(10,7),
  store_latitude numeric(10,7),
  store_longitude numeric(10,7),
  customer_notes text,
  restricted_items_present boolean not null default false,
  age_verification_required boolean not null default false,
  age_verification_completed boolean not null default false,
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  tip_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  gst_amount numeric(12,2) not null default 0,
  qst_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  estimated_prep_minutes int,
  estimated_drive_minutes int,
  estimated_delivery_at timestamptz,
  driver_assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_client on orders(client_id, created_at desc);
create index if not exists idx_orders_driver on orders(driver_id, order_status, updated_at desc);
create index if not exists idx_orders_store on orders(store_id, order_status, created_at desc);
create index if not exists idx_orders_zone on orders(zone_id, order_status, created_at desc);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  category_name text,
  subcategory_name text,
  quantity int not null default 1,
  unit_price numeric(12,2) not null,
  line_subtotal numeric(12,2) not null,
  tax_code text,
  requires_age_verification boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by_user_id uuid references app_users(id) on delete set null,
  changed_by_type text not null default 'system' check (changed_by_type in ('system','client','driver','admin','store')),
  note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_status_history_order on order_status_history(order_id, created_at desc);

create table if not exists order_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  driver_id uuid references driver_profiles(user_id) on delete set null,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  heading numeric(6,2),
  speed_kmh numeric(6,2),
  accuracy_meters numeric(6,2),
  captured_at timestamptz not null default now()
);
create index if not exists idx_order_tracking_order_time on order_tracking(order_id, captured_at desc);

create table if not exists order_proofs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  proof_type text not null,
  storage_provider text not null default 'supabase',
  storage_path text not null,
  file_url text,
  uploaded_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists dispatch_rules (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null default 'global' check (scope_type in ('global','zone','store')),
  zone_id uuid references zones(id) on delete cascade,
  store_id uuid references stores(id) on delete cascade,
  dispatch_mode dispatch_mode not null default 'hybrid',
  max_offer_seconds int not null default 20,
  prefer_nearest_driver boolean not null default true,
  prefer_zone_match boolean not null default true,
  prefer_best_eta boolean not null default true,
  allow_manual_override boolean not null default true,
  min_driver_rating numeric(3,2) not null default 4.2,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope_type, zone_id, store_id)
);

create table if not exists dispatch_queue (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  zone_id uuid references zones(id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  dispatch_mode dispatch_mode not null default 'auto',
  candidate_driver_ids uuid[] not null default '{}',
  selected_driver_id uuid references driver_profiles(user_id) on delete set null,
  dispatch_status dispatch_status not null default 'queued',
  attempt_count int not null default 0,
  assigned_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_dispatch_queue_zone_status on dispatch_queue(zone_id, dispatch_status, created_at desc);

create table if not exists dispatch_events (
  id uuid primary key default gen_random_uuid(),
  dispatch_id uuid not null references dispatch_queue(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  previous_driver_id uuid references driver_profiles(user_id) on delete set null,
  new_driver_id uuid references driver_profiles(user_id) on delete set null,
  event_type text not null,
  reason text,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists tracking_sessions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  client_id uuid not null references client_profiles(user_id) on delete cascade,
  driver_id uuid references driver_profiles(user_id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  session_status text not null default 'active' check (session_status in ('active','completed','cancelled')),
  last_driver_latitude numeric(10,7),
  last_driver_longitude numeric(10,7),
  last_driver_heading numeric(6,2),
  last_driver_speed_kmh numeric(6,2),
  last_eta_min int,
  polyline_encoded text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- PAYMENTS / REFUNDS
-- =========================================================

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  client_id uuid not null references client_profiles(user_id) on delete restrict,
  store_id uuid references stores(id) on delete set null,
  provider payment_provider not null default 'stripe',
  payment_intent_id text,
  charge_id text,
  external_payment_method_id text,
  payment_status payment_status not null default 'pending',
  amount numeric(12,2) not null,
  currency text not null default 'CAD',
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  tip_amount numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  gst_amount numeric(12,2) not null default 0,
  qst_amount numeric(12,2) not null default 0,
  refunded_amount numeric(12,2) not null default 0,
  receipt_url text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payments_status_created on payments(payment_status, created_at desc);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  client_id uuid not null references client_profiles(user_id) on delete restrict,
  amount numeric(12,2) not null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending','completed','failed')),
  external_refund_id text,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists fee_ledger (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  commission_amount numeric(12,2) not null default 0,
  delivery_fee_amount numeric(12,2) not null default 0,
  tip_amount numeric(12,2) not null default 0,
  processor_fee_amount numeric(12,2) not null default 0,
  platform_margin_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- PROMOTIONS / CAMPAIGNS
-- =========================================================

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description_fr text,
  description_en text,
  promotion_type promotion_type not null,
  value numeric(12,2) not null,
  currency text default 'CAD',
  min_order_amount numeric(12,2) not null default 0,
  max_discount_amount numeric(12,2),
  usage_limit_global int,
  usage_limit_per_user int,
  starts_at timestamptz,
  ends_at timestamptz,
  promotion_status promotion_status not null default 'draft',
  stackable boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists promotion_zones (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions(id) on delete cascade,
  zone_id uuid not null references zones(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (promotion_id, zone_id)
);

create table if not exists promotion_stores (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (promotion_id, store_id)
);

create table if not exists promotion_products (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (promotion_id, product_id)
);

create table if not exists promotion_redemptions (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions(id) on delete cascade,
  client_id uuid not null references client_profiles(user_id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  discount_amount numeric(12,2) not null default 0,
  redeemed_at timestamptz not null default now()
);
create index if not exists idx_promotion_redemptions_client on promotion_redemptions(client_id, redeemed_at desc);

create table if not exists promo_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel notification_channel not null,
  target_type text not null check (target_type in ('all','zone','store','segment','manual_list')),
  promotion_id uuid references promotions(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','scheduled','running','completed','cancelled')),
  scheduled_at timestamptz,
  sent_count int not null default 0,
  failed_count int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- NOTIFICATIONS / MESSAGING / SUPPORT
-- =========================================================

create table if not exists notification_templates (
  id uuid primary key default gen_random_uuid(),
  channel notification_channel not null,
  code text not null unique,
  name text not null,
  subject_fr text,
  subject_en text,
  body_fr text not null,
  body_en text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notification_batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel notification_channel not null,
  target_type text not null,
  target_count int not null default 0,
  sent_count int not null default 0,
  failed_count int not null default 0,
  status text not null default 'draft' check (status in ('draft','scheduled','processing','completed','failed','cancelled')),
  scheduled_at timestamptz,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references app_users(id) on delete cascade,
  recipient_role user_role,
  channel notification_channel not null,
  template_id uuid references notification_templates(id) on delete set null,
  batch_id uuid references notification_batches(id) on delete set null,
  notification_type text not null,
  title_fr text,
  title_en text,
  body_fr text,
  body_en text,
  payload jsonb not null default '{}'::jsonb,
  status notification_status not null default 'queued',
  is_read boolean not null default false,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_recipient on notifications(recipient_user_id, is_read, created_at desc);

create table if not exists chat_threads (
  id uuid primary key default gen_random_uuid(),
  thread_type thread_type not null,
  order_id uuid references orders(id) on delete cascade,
  support_ticket_id uuid,
  status text not null default 'active' check (status in ('active','archived','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_thread_participants (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  role_at_thread_start user_role,
  joined_at timestamptz not null default now(),
  unique (thread_id, user_id)
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender_user_id uuid references app_users(id) on delete set null,
  message_type text not null default 'text' check (message_type in ('text','image','file','system')),
  body text,
  attachments jsonb not null default '[]'::jsonb,
  read_by_user_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_chat_messages_thread on chat_messages(thread_id, created_at desc);

create table if not exists support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  created_by_user_id uuid references app_users(id) on delete set null,
  created_by_actor_type ticket_actor_type not null,
  subject text not null,
  category text not null,
  priority support_priority not null default 'medium',
  status support_status not null default 'open',
  order_id uuid references orders(id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  assigned_to_admin_id uuid references app_users(id) on delete set null,
  sla_due_at timestamptz,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_support_tickets_status on support_tickets(status, priority, created_at desc);

create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references support_tickets(id) on delete cascade,
  sender_user_id uuid references app_users(id) on delete set null,
  sender_actor_type ticket_actor_type not null,
  body text not null,
  attachments jsonb not null default '[]'::jsonb,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

alter table chat_threads
  add constraint fk_chat_threads_support_ticket
  foreign key (support_ticket_id) references support_tickets(id) on delete cascade;

create table if not exists faq_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null,
  title_fr text not null,
  title_en text not null,
  body_fr text not null,
  body_en text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references app_users(id) on delete set null,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- REVIEWS / FAVORITES
-- =========================================================

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references client_profiles(user_id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  store_id uuid references stores(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, product_id, store_id)
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  client_id uuid not null references client_profiles(user_id) on delete cascade,
  target_type review_target_type not null,
  target_user_id uuid references app_users(id) on delete cascade,
  target_store_id uuid references stores(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint reviews_target_check check (
    (target_type = 'driver' and target_user_id is not null)
    or (target_type = 'store' and target_store_id is not null)
    or (target_type = 'order' and order_id is not null)
  )
);

-- =========================================================
-- ANALYTICS / REPORTS / SETTINGS / AUDIT
-- =========================================================

create table if not exists dashboard_kpis (
  id uuid primary key default gen_random_uuid(),
  date_key date not null unique,
  orders_today int not null default 0,
  orders_in_progress int not null default 0,
  orders_completed int not null default 0,
  orders_cancelled int not null default 0,
  gross_sales numeric(12,2) not null default 0,
  delivery_fees numeric(12,2) not null default 0,
  tips_collected numeric(12,2) not null default 0,
  active_clients int not null default 0,
  online_drivers int not null default 0,
  open_stores int not null default 0,
  avg_prep_minutes numeric(6,2) not null default 0,
  avg_delivery_minutes numeric(6,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists live_activity (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  title text not null,
  message text,
  severity text not null default 'info' check (severity in ('info','warning','error','critical')),
  zone_id uuid references zones(id) on delete set null,
  store_id uuid references stores(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists system_alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  severity text not null check (severity in ('low','medium','high','critical')),
  title text not null,
  description text,
  entity_type text,
  entity_id uuid,
  status text not null default 'open' check (status in ('open','acknowledged','resolved','closed')),
  resolved_by uuid references app_users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reports_daily (
  id uuid primary key default gen_random_uuid(),
  date_key date not null,
  scope_type text not null check (scope_type in ('global','zone','store','driver','product')),
  scope_id uuid,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (date_key, scope_type, scope_id)
);

create table if not exists report_exports (
  id uuid primary key default gen_random_uuid(),
  export_type text not null,
  requested_by uuid references app_users(id) on delete set null,
  filters jsonb not null default '{}'::jsonb,
  export_status export_status not null default 'queued',
  storage_provider text default 'supabase',
  file_path text,
  file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists system_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  description text,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references app_users(id) on delete set null,
  actor_role user_role,
  action text not null,
  target_table text,
  target_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_actor_time on audit_logs(actor_user_id, created_at desc);

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

create or replace function public.attach_updated_at_trigger(_tbl regclass)
returns void
language plpgsql
as $$
begin
  execute format('drop trigger if exists trg_set_updated_at on %s', _tbl);
  execute format('create trigger trg_set_updated_at before update on %s for each row execute function public.set_updated_at()', _tbl);
end;
$$;

select public.attach_updated_at_trigger('roles');
select public.attach_updated_at_trigger('app_users');
select public.attach_updated_at_trigger('client_profiles');
select public.attach_updated_at_trigger('customer_addresses');
select public.attach_updated_at_trigger('client_payment_methods');
select public.attach_updated_at_trigger('driver_profiles');
select public.attach_updated_at_trigger('driver_applications');
select public.attach_updated_at_trigger('driver_application_personal');
select public.attach_updated_at_trigger('driver_vehicles');
select public.attach_updated_at_trigger('driver_documents');
select public.attach_updated_at_trigger('driver_incidents');
select public.attach_updated_at_trigger('admin_profiles');
select public.attach_updated_at_trigger('wallets');
select public.attach_updated_at_trigger('payout_requests');
select public.attach_updated_at_trigger('zones');
select public.attach_updated_at_trigger('stores');
select public.attach_updated_at_trigger('store_hours');
select public.attach_updated_at_trigger('categories');
select public.attach_updated_at_trigger('subcategories');
select public.attach_updated_at_trigger('products');
select public.attach_updated_at_trigger('product_variants');
select public.attach_updated_at_trigger('store_products');
select public.attach_updated_at_trigger('product_bundles');
select public.attach_updated_at_trigger('carts');
select public.attach_updated_at_trigger('cart_items');
select public.attach_updated_at_trigger('orders');
select public.attach_updated_at_trigger('dispatch_rules');
select public.attach_updated_at_trigger('dispatch_queue');
select public.attach_updated_at_trigger('tracking_sessions');
select public.attach_updated_at_trigger('payments');
select public.attach_updated_at_trigger('refunds');
select public.attach_updated_at_trigger('promotions');
select public.attach_updated_at_trigger('promo_campaigns');
select public.attach_updated_at_trigger('notification_templates');
select public.attach_updated_at_trigger('notification_batches');
select public.attach_updated_at_trigger('chat_threads');
select public.attach_updated_at_trigger('support_tickets');
select public.attach_updated_at_trigger('faq_articles');
select public.attach_updated_at_trigger('dashboard_kpis');
select public.attach_updated_at_trigger('system_alerts');
select public.attach_updated_at_trigger('report_exports');
select public.attach_updated_at_trigger('system_settings');

-- =========================================================
-- SEED: CORE ROLES / PERMISSIONS / SETTINGS / SUPER ADMIN
-- =========================================================

insert into roles (code, label, description, is_system)
values
  ('super_admin','Super Admin','Accès total à toute la plateforme', true),
  ('admin','Admin','Administration générale', true),
  ('dispatcher','Dispatcher','Assignation et contrôle opérationnel', true),
  ('support','Support','Support clients/chauffeurs/dépanneurs', true),
  ('finance','Finance','Paiements, remboursements, payouts', true),
  ('verifier_docs','Vérification docs','Validation des documents chauffeur', true),
  ('store_manager','Store Manager','Gestion dépanneurs et catalogue', true),
  ('analyst','Analyst','Rapports et analytics', true),
  ('client','Client','Utilisateur client', true),
  ('driver','Driver','Utilisateur chauffeur', true)
on conflict (code) do nothing;

insert into permissions (code, label, module_key, description)
values
  ('dashboard.read','Lire Dashboard','dashboard','Voir le dashboard'),
  ('orders.read','Lire commandes','orders','Voir les commandes'),
  ('orders.write','Modifier commandes','orders','Modifier statuts / gestion'),
  ('clients.read','Lire clients','clients','Voir les clients'),
  ('clients.write','Modifier clients','clients','Bloquer / modifier clients'),
  ('drivers.read','Lire chauffeurs','drivers','Voir les chauffeurs'),
  ('drivers.verify','Vérifier chauffeurs','drivers','Approuver/rejeter documents et candidatures'),
  ('stores.manage','Gérer dépanneurs','stores','CRUD dépanneurs / catalogue'),
  ('zones.manage','Gérer zones','zones','CRUD zones'),
  ('dispatch.manage','Gérer dispatch','dispatch','Assignation auto/manuelle'),
  ('transactions.read','Lire transactions','transactions','Voir paiements et finances'),
  ('transactions.refund','Rembourser','transactions','Lancer des remboursements'),
  ('wallets.manage','Gérer wallets','transactions','Gérer wallets et transactions'),
  ('payouts.manage','Gérer payouts','transactions','Approuver ou rejeter payouts'),
  ('promotions.manage','Gérer promotions','promotions','Créer et modifier promos'),
  ('notifications.manage','Gérer notifications','notifications','Envoyer notifications'),
  ('support.manage','Gérer support','support','Gérer tickets et FAQ'),
  ('reports.read','Lire rapports','reports','Consulter rapports'),
  ('reports.export','Exporter rapports','reports','Exporter CSV/XLS/PDF'),
  ('settings.manage','Gérer paramètres','settings','Modifier paramètres système'),
  ('permissions.manage','Gérer permissions','permissions','Modifier rôles et permissions'),
  ('audit.read','Lire audit','permissions','Voir logs d’audit')
on conflict (code) do nothing;

-- Grant all permissions to super_admin
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
cross join permissions p
where r.code = 'super_admin'
on conflict do nothing;

insert into system_settings(setting_key, setting_value, description)
values
  ('general', jsonb_build_object('app_name','FastDép','default_language','fr','supported_languages', jsonb_build_array('fr','en'),'currency','CAD'), 'Paramètres généraux'),
  ('auth', jsonb_build_object('otp_test_mode', true, 'otp_test_code', '123456', 'allow_google_login', true, 'allow_apple_login', true), 'Authentification'),
  ('delivery', jsonb_build_object('day_delivery_fee', 6.99, 'night_delivery_fee', 8.99, 'tip_presets', jsonb_build_array(15,20,25)), 'Livraison'),
  ('taxes', jsonb_build_object('gst', 0.05, 'qst', 0.09975), 'Taxes Québec/Canada'),
  ('integrations', jsonb_build_object('stripe_enabled', true, 'twilio_enabled', true, 'maps_enabled', true, 'storage_provider', 'supabase'), 'Intégrations')
on conflict (setting_key) do nothing;

-- Seed super admin user (password/auth handled by application/auth provider)
with upsert_user as (
  insert into app_users(email, display_name, primary_role, status, is_email_verified, preferred_language)
  values ('hedi_bennis17@gmail.com','Hedi Bennis','super_admin','active', true, 'fr')
  on conflict (email) do update set display_name = excluded.display_name
  returning id
)
insert into admin_profiles(user_id, full_name, job_title, department)
select id, 'Hedi Bennis', 'Founder', 'Executive'
from upsert_user
on conflict (user_id) do nothing;

insert into user_role_assignments(user_id, role_id)
select u.id, r.id
from app_users u
join roles r on r.code = 'super_admin'
where u.email = 'hedi_bennis17@gmail.com'
on conflict do nothing;

-- Seed base categories
insert into categories(code, slug, name_fr, name_en, icon, sort_order, requires_age_verification, is_restricted)
values
  ('cat_alcohol','biere-alcool','Bière & alcool','Beer & alcohol','wine',1,true,true),
  ('cat_beverages','boissons','Boissons','Beverages','cup-soda',2,false,false),
  ('cat_tobacco','tabagisme','Tabagisme','Tobacco','cigarette',3,true,true),
  ('cat_vape','vapotage','Vapotage','Vaping','cloud',4,true,true),
  ('cat_chips','craquelins-chips','Craquelins & chips','Crackers & chips','popcorn',5,false,false),
  ('cat_candy','chocolat-bonbons','Chocolat & bonbons','Chocolate & candy','candy',6,false,false),
  ('cat_coffee','cafe-glace','Café & boissons glacées','Coffee & iced drinks','coffee',7,false,false),
  ('cat_bread_milk','pain-lait','Pain & lait','Bread & milk','milk',8,false,false),
  ('cat_dairy','produits-laitiers','Produits laitiers','Dairy products','milk',9,false,false),
  ('cat_frozen','congele','Congelé','Frozen','snowflake',10,false,false),
  ('cat_household','articles-menagers','Articles ménagers','Household','spray-can',11,false,false),
  ('cat_hygiene','hygiene-toilette','Hygiène & toilette','Hygiene & toiletry','bath',12,false,false),
  ('cat_lotto','lotto-billets','Lotto / billets','Lottery / tickets','ticket',13,true,true),
  ('cat_magazines','journaux-magazines','Journaux / magazines','Newspapers / magazines','newspaper',14,false,false),
  ('cat_giftcards','cartes-cadeaux','Cartes cadeaux','Gift cards','gift',15,false,false),
  ('cat_express','depannage-express','Dépannage express','Quick essentials','package',16,false,false)
on conflict (code) do nothing;

commit;