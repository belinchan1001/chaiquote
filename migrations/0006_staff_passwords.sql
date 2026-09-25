alter table staff_member add column if not exists username text;
alter table staff_member add column if not exists password_hash text;

create unique index if not exists staff_member_username_lower
  on staff_member ((lower(username)))
  where username is not null;

create table if not exists staff_plan_change (
  id text primary key,
  plan_id text not null,
  actor text not null,
  payload_json jsonb not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  executed_at timestamptz
);

create index if not exists staff_plan_change_status on staff_plan_change (status, created_at desc);
