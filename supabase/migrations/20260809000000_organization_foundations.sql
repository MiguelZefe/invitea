-- Sprint A: organization foundations.
-- Assignment writes intentionally remain closed until Sprint B.

begin;

alter table public.event_guests
  add constraint event_guests_event_id_id_key unique (event_id, id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.prevent_organization_identity_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name in ('event_groups', 'event_spaces') then
    if new.id is distinct from old.id
      or new.event_id is distinct from old.event_id
      or new.created_at is distinct from old.created_at then
      raise exception
        'Cannot change id, event_id, or created_at on public.%',
        tg_table_name;
    end if;
  elsif tg_table_name = 'event_guest_space_assignments' then
    if new.event_id is distinct from old.event_id
      or new.guest_id is distinct from old.guest_id
      or new.space_id is distinct from old.space_id
      or new.created_at is distinct from old.created_at then
      raise exception
        'Cannot change event_id, guest_id, space_id, or created_at on public.%',
        tg_table_name;
    end if;
  else
    raise exception
      'public.prevent_organization_identity_changes() is not configured for public.%',
      tg_table_name;
  end if;

  return new;
end;
$$;

create table public.event_groups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  name text not null,
  kind text not null,
  custom_kind_label text,
  description text,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_groups_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on delete cascade,
  constraint event_groups_event_id_id_key
    unique (event_id, id),
  constraint event_groups_name_check
    check (
      name = btrim(name)
      and name <> ''
      and char_length(name) <= 120
    ),
  constraint event_groups_kind_check
    check (
      kind = btrim(kind)
      and kind in (
        'family', 'company', 'team', 'category',
        'friends', 'staff', 'vip', 'custom'
      )
    ),
  constraint event_groups_custom_kind_label_check
    check (
      (kind = 'custom'
        and custom_kind_label is not null
        and custom_kind_label = btrim(custom_kind_label)
        and custom_kind_label <> ''
        and char_length(custom_kind_label) <= 60)
      or
      (kind <> 'custom' and custom_kind_label is null)
    ),
  constraint event_groups_description_check
    check (
      description is null
      or (
        description = btrim(description)
        and description <> ''
        and char_length(description) <= 1000
      )
    ),
  constraint event_groups_sort_order_check
    check (sort_order >= 0)
);

create table public.event_spaces (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  name text not null,
  kind text not null,
  custom_kind_label text,
  description text,
  instructions text,
  capacity integer,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_spaces_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on delete cascade,
  constraint event_spaces_event_id_id_key
    unique (event_id, id),
  constraint event_spaces_name_check
    check (
      name = btrim(name)
      and name <> ''
      and char_length(name) <= 120
    ),
  constraint event_spaces_kind_check
    check (
      kind = btrim(kind)
      and kind in (
        'table', 'zone', 'room', 'section',
        'box', 'access', 'area', 'custom'
      )
    ),
  constraint event_spaces_custom_kind_label_check
    check (
      (kind = 'custom'
        and custom_kind_label is not null
        and custom_kind_label = btrim(custom_kind_label)
        and custom_kind_label <> ''
        and char_length(custom_kind_label) <= 60)
      or
      (kind <> 'custom' and custom_kind_label is null)
    ),
  constraint event_spaces_description_check
    check (
      description is null
      or (
        description = btrim(description)
        and description <> ''
        and char_length(description) <= 1000
      )
    ),
  constraint event_spaces_instructions_check
    check (
      instructions is null
      or (
        instructions = btrim(instructions)
        and instructions <> ''
        and char_length(instructions) <= 2000
      )
    ),
  constraint event_spaces_capacity_check
    check (capacity is null or capacity >= 1),
  constraint event_spaces_sort_order_check
    check (sort_order >= 0)
);

create table public.event_guest_groups (
  event_id uuid not null,
  guest_id uuid not null,
  group_id uuid not null,
  created_at timestamptz not null default now(),

  constraint event_guest_groups_pkey
    primary key (event_id, guest_id, group_id),
  constraint event_guest_groups_guest_fkey
    foreign key (event_id, guest_id)
    references public.event_guests (event_id, id)
    on delete cascade,
  constraint event_guest_groups_group_fkey
    foreign key (event_id, group_id)
    references public.event_groups (event_id, id)
    on delete cascade
);

create table public.event_guest_space_assignments (
  event_id uuid not null,
  guest_id uuid not null,
  space_id uuid not null,
  allocated_count integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint event_guest_space_assignments_pkey
    primary key (event_id, guest_id, space_id),
  constraint event_guest_space_assignments_guest_fkey
    foreign key (event_id, guest_id)
    references public.event_guests (event_id, id)
    on delete cascade,
  constraint event_guest_space_assignments_space_fkey
    foreign key (event_id, space_id)
    references public.event_spaces (event_id, id)
    on delete cascade,
  constraint event_guest_space_assignments_allocated_count_check
    check (allocated_count is null or allocated_count >= 1),
  constraint event_guest_space_assignments_notes_check
    check (
      notes is null
      or (
        notes = btrim(notes)
        and notes <> ''
        and char_length(notes) <= 1000
      )
    )
);

-- Active names are unique per event without requiring citext.
create unique index event_groups_active_name_key
  on public.event_groups (event_id, lower(btrim(name)))
  where archived_at is null;

create unique index event_spaces_active_builtin_name_key
  on public.event_spaces (event_id, kind, lower(btrim(name)))
  where archived_at is null and kind <> 'custom';

create unique index event_spaces_active_custom_name_key
  on public.event_spaces (
    event_id,
    lower(btrim(custom_kind_label)),
    lower(btrim(name))
  )
  where archived_at is null and kind = 'custom';

-- Listing and reverse-lookup indexes not already covered by primary keys.
create index event_groups_event_sort_idx
  on public.event_groups (event_id, archived_at, sort_order, id);

create index event_spaces_event_sort_idx
  on public.event_spaces (event_id, archived_at, sort_order, id);

create index event_guest_groups_group_idx
  on public.event_guest_groups (event_id, group_id, guest_id);

create index event_guest_space_assignments_space_idx
  on public.event_guest_space_assignments (event_id, space_id, guest_id);

create trigger set_event_groups_updated_at
before update on public.event_groups
for each row
execute function public.set_updated_at();

create trigger set_event_spaces_updated_at
before update on public.event_spaces
for each row
execute function public.set_updated_at();

create trigger set_event_guest_space_assignments_updated_at
before update on public.event_guest_space_assignments
for each row
execute function public.set_updated_at();

create trigger prevent_event_groups_identity_changes
before update on public.event_groups
for each row
execute function public.prevent_organization_identity_changes();

create trigger prevent_event_spaces_identity_changes
before update on public.event_spaces
for each row
execute function public.prevent_organization_identity_changes();

create trigger prevent_event_guest_space_assignments_identity_changes
before update on public.event_guest_space_assignments
for each row
execute function public.prevent_organization_identity_changes();

alter table public.event_groups enable row level security;
alter table public.event_spaces enable row level security;
alter table public.event_guest_groups enable row level security;
alter table public.event_guest_space_assignments enable row level security;

create policy "Owners can select event groups"
on public.event_groups
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_groups.event_id
      and events.owner_id = auth.uid()
  )
);

create policy "Owners can insert event groups"
on public.event_groups
for insert
to authenticated
with check (
  exists (
    select 1
    from public.events
    where events.id = event_groups.event_id
      and events.owner_id = auth.uid()
  )
);

create policy "Owners can update event groups"
on public.event_groups
for update
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_groups.event_id
      and events.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events
    where events.id = event_groups.event_id
      and events.owner_id = auth.uid()
  )
);

create policy "Owners can select event spaces"
on public.event_spaces
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_spaces.event_id
      and events.owner_id = auth.uid()
  )
);

create policy "Owners can insert event spaces"
on public.event_spaces
for insert
to authenticated
with check (
  exists (
    select 1
    from public.events
    where events.id = event_spaces.event_id
      and events.owner_id = auth.uid()
  )
);

create policy "Owners can update event spaces"
on public.event_spaces
for update
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_spaces.event_id
      and events.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.events
    where events.id = event_spaces.event_id
      and events.owner_id = auth.uid()
  )
);

create policy "Owners can select event guest groups"
on public.event_guest_groups
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_guest_groups.event_id
      and events.owner_id = auth.uid()
  )
);

create policy "Owners can select event guest space assignments"
on public.event_guest_space_assignments
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_guest_space_assignments.event_id
      and events.owner_id = auth.uid()
  )
);

-- Sprint A grants mirror the available product operations. Assignment writes
-- will be granted alongside their write policies and validations in Sprint B.
revoke all privileges
on table public.event_groups
from anon, authenticated;

revoke all privileges
on table public.event_spaces
from anon, authenticated;

revoke all privileges
on table public.event_guest_groups
from anon, authenticated;

revoke all privileges
on table public.event_guest_space_assignments
from anon, authenticated;

grant select, insert, update
on table public.event_groups
to authenticated;

grant select, insert, update
on table public.event_spaces
to authenticated;

grant select
on table public.event_guest_groups
to authenticated;

grant select
on table public.event_guest_space_assignments
to authenticated;

commit;
