-- Preserve existing rows; tighten the content check after the whitespace regression.
begin;
alter table public.memories drop constraint memory_has_content;
alter table public.memories add constraint memory_has_content
check (original_text ~ '[^[:space:]]' or image_path is not null);
commit;
