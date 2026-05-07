-- yourOwn — Supabase schema setup
-- Run this in your Supabase SQL editor at supabase.com

-- People known to the patient (family saves these)
create table if not exists people (
  id          uuid default gen_random_uuid() primary key,
  patient_name text not null,
  name        text not null,
  relationship text,
  notes       text,
  photo_url   text,
  created_at  timestamptz default now()
);

create index if not exists people_patient_name_idx on people (patient_name);
create index if not exists people_name_idx on people (lower(name));

-- Episodic memories (auto-saved by the app each interaction)
create table if not exists episodic_memories (
  id           uuid default gen_random_uuid() primary key,
  patient_name text not null,
  type         text not null,
  -- type: conversation | location | person_asked | orientation | emotional_support
  content      text not null,
  context      jsonb default '{}',
  timestamp    timestamptz default now()
);

create index if not exists episodic_patient_name_idx on episodic_memories (patient_name);
create index if not exists episodic_timestamp_idx on episodic_memories (timestamp desc);

-- Disable RLS for hackathon demo (backend uses anon key, no auth needed)
alter table people disable row level security;
alter table episodic_memories disable row level security;

-- Storage bucket for family photos
-- Run this separately in the Supabase dashboard under Storage > New bucket
-- Bucket name: people-photos
-- Public: true (so photo URLs work without auth)
