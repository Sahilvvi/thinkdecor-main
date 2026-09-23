-- Signed-in users could rewrite ANY column of their own profile row.
--
-- The "Users can update their own profile" policy checks the row, not the
-- columns, and the table grant covered every column - so a customer could set
-- banned_at = null to lift their own suspension, change their plan label, or
-- edit user_id / email. The app only ever changes name, phone and avatar_url
-- (useUpdateProfile), so that is all a customer may write. Admin actions
-- (suspend, restore, roles) go through the admin-users edge function, which
-- uses the service role and is unaffected.

revoke update on public.profiles from anon, authenticated;
grant  update (name, phone, avatar_url) on public.profiles to authenticated;

-- New profiles are created by the handle_new_user() trigger (security definer);
-- a customer never needs to insert one, and certainly not with privileged values.
revoke insert on public.profiles from anon, authenticated;
