-- Super admin: a role above admin. Anyone who is a super admin ALSO keeps their 'admin' row,
-- so every existing admin RLS policy (has_role(uid, 'admin')) keeps working for them.
-- Separate migration: a new enum value cannot be used in the same transaction that adds it.
alter type public.app_role add value if not exists 'super_admin';
