-- Apply once to the dedicated BreadCrumbs project. No destructive resets.
begin;

create function public.valid_memory_urls(urls text[]) returns boolean
language sql immutable set search_path = '' as $$
  select cardinality(urls) <= 5 and not exists (
    select 1 from unnest(urls) as u(url)
    where url is null or url !~* '^https?://[^[:space:]/?#]+[^[:space:]]*$'
  );
$$;

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  original_text text not null default '',
  source_urls text[] not null default '{}',
  image_path text,
  status text not null default 'active' check (status in ('active','done')),
  revision integer not null default 1 check (revision > 0),
  ai_status text not null default 'pending' check (ai_status in ('pending','processing','ready','failed')),
  ai_data jsonb check (ai_data is null or jsonb_typeof(ai_data)='object'),
  ai_error text check (length(ai_error) <= 1000),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  search_document tsvector generated always as (
    to_tsvector('english', original_text || ' ' || coalesce(ai_data::text,''))
  ) stored,
  constraint memory_text_limit check (char_length(original_text) <= 4000),
  constraint memory_urls_valid check (public.valid_memory_urls(source_urls)),
  constraint memory_has_content check (length(btrim(original_text)) > 0 or image_path is not null),
  constraint memory_image_owned check (image_path is null or (
    starts_with(image_path,user_id::text || '/') and length(image_path)>37
  ))
);
create index memories_owner_status_updated on public.memories(user_id,status,updated_at desc);
create index memories_search on public.memories using gin(search_document);

create function public.prepare_memory_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  if TG_OP='INSERT' then
    new.revision := 1;
    new.created_at := clock_timestamp();
    new.updated_at := new.created_at;
  else
    new.created_at := old.created_at;
    new.revision := old.revision;
    new.updated_at := old.updated_at;
    if (new.original_text,new.source_urls,new.image_path) is distinct from
       (old.original_text,old.source_urls,old.image_path) then
      new.revision := old.revision + 1;
      new.ai_status := 'pending';
      new.ai_data := null;
      new.ai_error := null;
      new.updated_at := clock_timestamp();
    elsif new.status is distinct from old.status then
      new.updated_at := clock_timestamp();
    end if;
  end if;
  return new;
end;
$$;
create trigger prepare_memory_write before insert or update on public.memories
for each row execute function public.prepare_memory_write();

alter table public.memories enable row level security;
create policy memories_owner on public.memories for all to authenticated
using ((select auth.uid())=user_id)
with check ((select auth.uid())=user_id);
revoke all on public.memories from public,anon;
grant select,insert,update,delete on public.memories to authenticated;
revoke all on function public.valid_memory_urls(text[]) from public;
grant execute on function public.valid_memory_urls(text[]) to authenticated;
revoke all on function public.prepare_memory_write() from public;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('screenshots','screenshots',false,5242880,array['image/png','image/jpeg','image/webp']);
create policy screenshots_owner on storage.objects for all to authenticated
using (bucket_id='screenshots' and (storage.foldername(name))[1]=(select auth.uid()::text))
with check (bucket_id='screenshots' and (storage.foldername(name))[1]=(select auth.uid()::text));

commit;
