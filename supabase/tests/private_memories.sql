-- Run in the Supabase SQL editor as postgres. Everything rolls back.
-- Catches missing RLS, forged ownership, unsafe inputs and stale AI writes.
begin;
do $$ begin
  if to_regclass('public.memories') is null then
    raise exception 'FAIL: public.memories is missing';
  end if;
end $$;

create function pg_temp.assert_true(ok boolean, label text) returns void
language plpgsql as $$ begin
  if ok is distinct from true then raise exception 'FAIL: %', label; end if;
end $$;
create function pg_temp.expect_denied(statement text) returns void
language plpgsql as $$ begin
  begin execute statement;
  exception when insufficient_privilege then return; end;
  raise exception 'FAIL: unauthorized statement succeeded: %', statement;
end $$;
create function pg_temp.expect_invalid(statement text) returns void
language plpgsql as $$ begin
  begin execute statement;
  exception when check_violation then return; end;
  raise exception 'FAIL: invalid input accepted: %', statement;
end $$;

-- Synthetic accounts, never sent mail; collision causes failure, not deletion.
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','breadcrumb-a@example.invalid'),
 ('22222222-2222-4222-8222-222222222222','breadcrumb-b@example.invalid');
insert into public.memories(id,user_id,original_text) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Apply to Amazon'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','Private EA posting');
select pg_temp.assert_true(
 (select not public and file_size_limit=5242880
  and allowed_mime_types @> array['image/png','image/jpeg','image/webp']
  from storage.buckets where id='screenshots'), 'private limited bucket');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
select pg_temp.assert_true((select count(*)=1 from public.memories),'A cannot read B');
select pg_temp.expect_denied($q$insert into public.memories(user_id,original_text) values ('22222222-2222-4222-8222-222222222222','forged')$q$);
select pg_temp.expect_denied($q$update public.memories set user_id='22222222-2222-4222-8222-222222222222' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'$q$);
do $$ declare affected integer; begin
 update public.memories set original_text='stolen' where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 get diagnostics affected=row_count;
 perform pg_temp.assert_true(affected=0,'A cannot update B');
 delete from public.memories where id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
 get diagnostics affected=row_count;
 perform pg_temp.assert_true(affected=0,'A cannot delete B');
end $$;

select pg_temp.expect_invalid($q$insert into public.memories(original_text) values ('   ')$q$);
select pg_temp.expect_invalid($q$insert into public.memories(original_text) values (E'\t\n')$q$);
select pg_temp.expect_invalid($q$insert into public.memories(original_text) values (repeat('x',4001))$q$);
select pg_temp.expect_invalid($q$insert into public.memories(original_text,source_urls) values ('x',array_fill('https://example.com'::text,array[6]))$q$);
select pg_temp.expect_invalid($q$insert into public.memories(original_text,source_urls) values ('x',array['javascript:alert(1)'])$q$);
select pg_temp.expect_invalid($q$insert into public.memories(original_text,image_path) values ('x','22222222-2222-4222-8222-222222222222/test.png')$q$);
insert into public.memories(id,original_text,source_urls) values
 ('cccccccc-cccc-4ccc-8ccc-cccccccccccc',repeat('x',4000),array['https://example.com/jobs']);
insert into public.memories(original_text,image_path) values
 ('','11111111-1111-4111-8111-111111111111/screenshot.png');

do $$ declare saved_time timestamptz; affected integer; begin
 select updated_at into saved_time from public.memories where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 update public.memories set ai_status='ready',ai_data='{"title":"Amazon"}' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 perform pg_temp.assert_true((select revision=1 and updated_at=saved_time from public.memories where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),'AI must not reorder or revise note');
 update public.memories set original_text='Apply to Amazon and EA' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 perform pg_temp.assert_true((select revision=2 and ai_status='pending' and ai_data is null and updated_at>saved_time from public.memories where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),'edit invalidates AI');
 update public.memories set ai_status='ready',ai_data='{"title":"stale"}' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' and revision=1;
 get diagnostics affected=row_count;
 perform pg_temp.assert_true(affected=0,'revision predicate rejects stale AI');
 update public.memories set status='done' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 update public.memories set status='active' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 perform pg_temp.assert_true((select status='active' and revision=2 from public.memories where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),'done/reopen preserves content revision');
end $$;

-- Metadata-only storage policy test: actual object upload is an integration check.
insert into storage.objects(bucket_id,name) values ('screenshots','11111111-1111-4111-8111-111111111111/test.png');
select pg_temp.expect_denied($q$insert into storage.objects(bucket_id,name) values ('screenshots','22222222-2222-4222-8222-222222222222/forged.png')$q$);
select pg_temp.expect_denied($q$update storage.objects set name='22222222-2222-4222-8222-222222222222/stolen.png' where name='11111111-1111-4111-8111-111111111111/test.png'$q$);

select set_config('request.jwt.claims','{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}',true);
select pg_temp.assert_true((select count(*)=1 and min(original_text)='Private EA posting' from public.memories),'B only sees unchanged own note');
select pg_temp.assert_true((select count(*)=0 from storage.objects where bucket_id='screenshots'),'B cannot read A screenshot');
do $$ declare affected integer; begin
 update storage.objects set name='22222222-2222-4222-8222-222222222222/stolen.png' where name='11111111-1111-4111-8111-111111111111/test.png';
 get diagnostics affected=row_count;
 perform pg_temp.assert_true(affected=0,'B cannot move A screenshot');
end $$;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
select pg_temp.assert_true((select count(*)=1 from storage.objects where bucket_id='screenshots'),'A retains screenshot after B attempts');
-- Supabase protects direct metadata DELETE, including zero-row DELETE.
-- Verify actual object removal through the Storage API during app integration.
delete from public.memories where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
select pg_temp.assert_true((select count(*)=0 from public.memories where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc'),'A can delete own note');

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
select pg_temp.expect_denied('select * from public.memories');
select pg_temp.assert_true((select count(*)=0 from storage.objects where bucket_id='screenshots'),'anonymous screenshot access denied');
reset role;
rollback;

select 'PASS: private memory CRUD, storage read/write isolation, validation and revision checks; fixtures rolled back' as result
where not exists (select 1 from auth.users where id in ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'))
and not exists (select 1 from storage.objects where bucket_id='screenshots' and name='11111111-1111-4111-8111-111111111111/test.png');
