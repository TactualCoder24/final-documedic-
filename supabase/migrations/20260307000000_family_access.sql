create table family_access (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references auth.users not null,
  caregiver_id uuid references auth.users not null,
  name text not null,
  relationship text not null,
  permission_level text not null check (permission_level in ('view_only', 'manage')),
  photoUrl text
);

-- Turn on row level security
alter table family_access enable row level security;

-- Create policy for users to see connections where they are either patient or caregiver
create policy "Users can view their own connections" on family_access
  for select using (
    auth.uid() = patient_id or auth.uid() = caregiver_id
  );

create policy "Users can insert connections for themselves" on family_access
  for insert with check (
    auth.uid() = patient_id or auth.uid() = caregiver_id
  );

create policy "Users can delete their own connections" on family_access
  for delete using (
    auth.uid() = patient_id or auth.uid() = caregiver_id
  );
