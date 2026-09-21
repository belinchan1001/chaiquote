create table if not exists tech_news (
  slug text primary key,
  category text not null,
  source_url text,
  payload jsonb not null,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists tech_news_published_at_idx on tech_news (published_at desc);
