// Super-admin account management: list every signed-up user (joined with
// their profile, role and ban status) and promote/demote/ban/unban them.
//
// Deploy:  supabase functions deploy admin-users
// Secrets: none beyond the SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY every
//          project already has — auth.admin.listUsers() and writes to
//          user_roles/profiles both need the service role.
//
// The caller must already hold the admin role — checked here, server-side,
// before anything else runs, since this bypasses RLS entirely via the
// service-role client. Self-contained (no ../_shared import) so it also
// deploys from the Supabase dashboard's function editor.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Please sign in again." }, 401);
  }

  const { data: { user: caller } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!caller) {
    return json({ error: "Please sign in again." }, 401);
  }

  const { data: callerRole } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!callerRole) {
    return json({ error: "This account does not have admin access." }, 403);
  }

  let body: { action?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const { action, userId } = body;

  if (action === "list") {
    const { data: authUsers, error: authErr } = await admin.auth.admin.listUsers({ perPage: 500 });
    if (authErr) return json({ error: authErr.message }, 500);

    const [{ data: profiles }, { data: roles }] = await Promise.all([
      admin.from("profiles").select("user_id, name, phone, banned_at, plan"),
      admin.from("user_roles").select("user_id, role"),
    ]);

    const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));

    const users = authUsers.users.map((u) => {
      const profile = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email,
        name: profile?.name ?? null,
        phone: profile?.phone ?? null,
        plan: profile?.plan ?? "free",
        isAdmin: adminIds.has(u.id),
        bannedAt: profile?.banned_at ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
      };
    });

    return json({ users });
  }

  if (!userId) return json({ error: "userId is required." }, 400);

  if (action === "promote") {
    const { error } = await admin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === "demote") {
    if (userId === caller.id) {
      return json({ error: "You can't remove your own admin access." }, 400);
    }
    const { error } = await admin
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === "ban") {
    if (userId === caller.id) {
      return json({ error: "You can't ban your own account." }, 400);
    }
    const { error } = await admin
      .from("profiles")
      .update({ banned_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  if (action === "unban") {
    const { error } = await admin
      .from("profiles")
      .update({ banned_at: null })
      .eq("user_id", userId);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: `Unknown action "${action}".` }, 400);
});
