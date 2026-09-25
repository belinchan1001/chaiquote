create table if not exists staff_member (
  email text primary key,
  group_id text not null,
  status text not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists plan_override (
  plan_id text primary key,
  unpublished boolean not null default false,
  monthly_fee double precision,
  free_months integer,
  contract_months integer,
  rebate double precision,
  perks_json jsonb,
  hot boolean,
  latest_offer boolean,
  new_intake_offer boolean,
  flash_offer boolean,
  offer_ends_at text,
  quote_pick boolean,
  ad_image_url text,
  updated_by text,
  updated_at timestamptz not null default now()
);
