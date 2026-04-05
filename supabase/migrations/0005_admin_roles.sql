-- Allow public read access for non-archived items
create policy "Anyone can view active brands"
  on public.brands for select
  using ( is_archived = false );

create policy "Anyone can view active classes"
  on public.classes for select
  using ( is_archived = false );

create policy "Anyone can view active units"
  on public.units for select
  using ( is_archived = false );

-- Admin Write Policies (leveraging the profiles table role)
-- Note: A user satisfies 'Admin' if their public.profiles row has role = 'admin'

create policy "Admins can manage brands"
  on public.brands for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can manage classes"
  on public.classes for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can manage units"
  on public.units for all
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );
