create table if not exists site_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  event_name text not null,
  plan_id text,
  plan_ids text,
  provider_id text,
  category text,
  wa_phone text,
  source text,
  path text,
  extra jsonb
);
create index if not exists site_events_created_at_idx on site_events (created_at desc);
create index if not exists site_events_event_name_idx on site_events (event_name, created_at desc);
