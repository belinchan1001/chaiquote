create table if not exists offer_tokens (
  token text primary key,
  offer_id text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  claimed_at timestamptz,
  session_id text
);
create index if not exists offer_tokens_offer_id_idx on offer_tokens (offer_id);
