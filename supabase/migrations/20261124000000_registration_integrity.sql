begin;

create schema if not exists kidscon_private;
revoke all on schema kidscon_private from public, anon, authenticated;

create table kidscon_private.registration_requests (
  id uuid primary key,
  payload_hash bytea not null
);

create or replace function public.is_kidscon_admin()
returns boolean
language sql stable security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'admin', false)
$$;
revoke all on function public.is_kidscon_admin() from public;
grant execute on function public.is_kidscon_admin() to authenticated;

-- Protect student records even if older permissive policies remain installed.
do $$
declare
  relation text;
begin
  foreach relation in array array['schools', 'students', 'teachers'] loop
    execute format('alter table public.%I enable row level security', relation);
    execute format('revoke all on public.%I from public, anon', relation);
    execute format('create policy "Kidscon deny anonymous access" on public.%I as restrictive for all to anon using (false) with check (false)', relation);
    execute format('grant select, insert, update, delete on public.%I to authenticated', relation);
    execute format('create policy "Kidscon admin boundary" on public.%I as restrictive for all to authenticated using ((select public.is_kidscon_admin())) with check ((select public.is_kidscon_admin()))', relation);
    execute format('create policy "Kidscon admin access" on public.%I for all to authenticated using ((select public.is_kidscon_admin())) with check ((select public.is_kidscon_admin()))', relation);
  end loop;

  foreach relation in array array['events', 'available_schools'] loop
    execute format('alter table public.%I enable row level security', relation);
    execute format('revoke insert, update, delete, truncate on public.%I from public, anon', relation);
    execute format('grant select on public.%I to anon, authenticated', relation);
    execute format('create policy "Kidscon deny anonymous inserts" on public.%I as restrictive for insert to anon with check (false)', relation);
    execute format('create policy "Kidscon deny anonymous updates" on public.%I as restrictive for update to anon using (false) with check (false)', relation);
    execute format('create policy "Kidscon deny anonymous deletes" on public.%I as restrictive for delete to anon using (false)', relation);
    execute format('grant insert, update, delete on public.%I to authenticated', relation);
    execute format('create policy "Kidscon public catalog" on public.%I for select to anon, authenticated using (true)', relation);
    execute format('create policy "Kidscon admin access" on public.%I for all to authenticated using ((select public.is_kidscon_admin())) with check ((select public.is_kidscon_admin()))', relation);
    execute format('create policy "Kidscon admin inserts" on public.%I as restrictive for insert to authenticated with check ((select public.is_kidscon_admin()))', relation);
    execute format('create policy "Kidscon admin updates" on public.%I as restrictive for update to authenticated using ((select public.is_kidscon_admin())) with check ((select public.is_kidscon_admin()))', relation);
    execute format('create policy "Kidscon admin deletes" on public.%I as restrictive for delete to authenticated using ((select public.is_kidscon_admin()))', relation);
  end loop;
end;
$$;

create function public.submit_school_registration(
  p_request_id uuid,
  p_event_id uuid,
  p_school jsonb,
  p_students jsonb,
  p_teachers jsonb
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  request_hash bytea;
  previous_hash bytea;
begin
  if p_request_id is null or p_event_id is null
      or jsonb_typeof(p_school) is distinct from 'object'
      or jsonb_typeof(p_students) is distinct from 'array'
      or jsonb_typeof(p_teachers) is distinct from 'array' then
    raise exception 'Invalid registration payload' using errcode = '22023';
  end if;

  if jsonb_array_length(p_students) not between 1 and 20
      or octet_length(jsonb_build_array(p_school, p_students, p_teachers)::text) > 100000
      or length(btrim(coalesce(p_school ->> 'name', ''))) < 2
      or coalesce(p_school ->> 'category', '') not in ('Primary', 'Secondary', 'Both')
      or length(btrim(coalesce(p_school ->> 'address', ''))) < 5
      or length(btrim(coalesce(p_school ->> 'contactPerson', ''))) < 2
      or length(btrim(coalesce(p_school ->> 'phone', ''))) < 10
      or exists (
        select from jsonb_array_elements(p_students) as student
        where coalesce(btrim(student ->> 'name'), '') = ''
           or coalesce(student ->> 'gender', '') not in ('Male', 'Female')
           or coalesce(btrim(student ->> 'class'), '') = ''
      )
      or exists (
        select from jsonb_array_elements(p_teachers) as teacher
        where coalesce(btrim(teacher ->> 'name'), '') = ''
      ) then
    raise exception 'Invalid school or attendee details' using errcode = '22023';
  end if;

  request_hash := sha256(convert_to(jsonb_build_array(p_event_id, p_school, p_students, p_teachers)::text, 'UTF8'));
  insert into kidscon_private.registration_requests (id, payload_hash)
  values (p_request_id, request_hash)
  on conflict (id) do nothing;

  if not found then
    select payload_hash into previous_hash
    from kidscon_private.registration_requests where id = p_request_id;

    if previous_hash is distinct from request_hash then
      raise exception 'This registration was already submitted with different details' using errcode = '23505';
    end if;

    return p_request_id;
  end if;

  perform 1 from public.events
  where id = p_event_id and is_open and date >= (now() at time zone 'Africa/Lagos')::date
  for share;
  if not found then
    raise exception 'Registration is closed for this event' using errcode = '22023';
  end if;

  insert into public.schools (id, event_id, name, category, address, contact_person, phone)
  values (p_request_id, p_event_id, btrim(p_school ->> 'name'), p_school ->> 'category',
          btrim(p_school ->> 'address'), btrim(p_school ->> 'contactPerson'), btrim(p_school ->> 'phone'));

  insert into public.students (school_id, name, gender, class)
  select p_request_id, btrim(student ->> 'name'), student ->> 'gender', btrim(student ->> 'class')
  from jsonb_array_elements(p_students) as student;

  insert into public.teachers (school_id, name)
  select p_request_id, btrim(teacher ->> 'name')
  from jsonb_array_elements(p_teachers) as teacher;

  return p_request_id;
end;
$$;
revoke all on function public.submit_school_registration(uuid, uuid, jsonb, jsonb, jsonb) from public;
grant execute on function public.submit_school_registration(uuid, uuid, jsonb, jsonb, jsonb) to anon, authenticated;

create function public.delete_registered_school(p_school_id uuid)
returns void
language plpgsql security invoker
set search_path = ''
as $$
begin
  if not public.is_kidscon_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  perform 1 from public.schools where id = p_school_id for update;
  if not found then
    raise exception 'School not found' using errcode = 'P0002';
  end if;

  delete from public.students where school_id = p_school_id;
  delete from public.teachers where school_id = p_school_id;
  delete from public.schools where id = p_school_id;
  if not found then
    raise exception 'School could not be deleted' using errcode = '42501';
  end if;
end;
$$;
revoke all on function public.delete_registered_school(uuid) from public, anon;
grant execute on function public.delete_registered_school(uuid) to authenticated;

create function public.merge_registered_schools(
  p_primary_id uuid,
  p_duplicate_ids uuid[],
  p_contact_source_id uuid
)
returns void
language plpgsql security invoker
set search_path = ''
as $$
declare
  school_ids uuid[];
  locked_count integer;
  primary_school public.schools%rowtype;
  contact_school public.schools%rowtype;
begin
  if not public.is_kidscon_admin() then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;

  if p_primary_id is null or p_contact_source_id is null
      or coalesce(cardinality(p_duplicate_ids), 0) = 0
      or p_primary_id = any(p_duplicate_ids)
      or array_position(p_duplicate_ids, null) is not null then
    raise exception 'Invalid schools to merge' using errcode = '22023';
  end if;

  school_ids := array_append(p_duplicate_ids, p_primary_id);
  if not (p_contact_source_id = any(school_ids)) then
    raise exception 'Invalid contact source' using errcode = '22023';
  end if;

  -- Lock in a consistent order and recheck the records before moving attendees.
  perform 1 from public.schools where id = any(school_ids) order by id for update;
  get diagnostics locked_count = row_count;
  if locked_count <> cardinality(school_ids) then
    raise exception 'One or more schools have changed. Reopen the merge dialog.' using errcode = 'P0002';
  end if;

  select * into primary_school from public.schools where id = p_primary_id;
  select * into contact_school from public.schools where id = p_contact_source_id;
  if exists (
    select from public.schools
    where id = any(school_ids)
      and (event_id is distinct from primary_school.event_id
        or lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))
          is distinct from lower(regexp_replace(btrim(primary_school.name), '\s+', ' ', 'g')))
  ) then
    raise exception 'Only schools with the same name and event can be merged' using errcode = '22023';
  end if;

  update public.students set school_id = p_primary_id where school_id = any(p_duplicate_ids);
  update public.teachers set school_id = p_primary_id where school_id = any(p_duplicate_ids);
  update public.schools
  set address = contact_school.address, contact_person = contact_school.contact_person, phone = contact_school.phone
  where id = p_primary_id;
  if not found then
    raise exception 'School contact details could not be updated' using errcode = '42501';
  end if;

  delete from public.schools where id = any(p_duplicate_ids);
  get diagnostics locked_count = row_count;
  if locked_count <> cardinality(p_duplicate_ids) then
    raise exception 'Duplicate schools could not be deleted' using errcode = '42501';
  end if;
end;
$$;
revoke all on function public.merge_registered_schools(uuid, uuid[], uuid) from public, anon;
grant execute on function public.merge_registered_schools(uuid, uuid[], uuid) to authenticated;

create view public.registration_student_monthly
with (security_invoker = true)
as
select school_id,
       date_trunc('month', created_at at time zone 'Africa/Lagos')::date as month,
       gender,
       count(*) as student_count
from public.students
group by 1, 2, 3;

revoke all on public.registration_student_monthly from public, anon;
grant select on public.registration_student_monthly to authenticated;

commit;
