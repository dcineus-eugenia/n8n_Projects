-- Supabase schema for the n8n workflow "RAG n8n : pdf" (Supabase Vector Store + Postgres chat history).
-- Dimension 3072 = default output size of gemini-embedding-001 and gemini-embedding-2.
-- No ANN index: pgvector limits HNSW/IVFFlat to 2000 dimensions; an exact scan is fine for a few thousand rows.

create extension if not exists vector;

create table if not exists documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(3072)
);

-- RLS enabled without any policy: only the service_role key (used by n8n) can read or write.
alter table documents enable row level security;

create or replace function match_documents (
  query_embedding vector(3072),
  match_count int default null,
  filter jsonb default '{}'
) returns table (id bigint, content text, metadata jsonb, similarity float)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select id, content, metadata,
         1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Chat history, read and written by the workflow (same format as the n8n Postgres Chat Memory node).
-- Created here rather than by n8n so that RLS is enabled: without it the table would be readable through the public Supabase API (anon key).
create table if not exists n8n_chat_histories (
  id serial primary key,
  session_id varchar(255) not null,
  message jsonb not null
);
alter table n8n_chat_histories enable row level security;

notify pgrst, 'reload schema';
