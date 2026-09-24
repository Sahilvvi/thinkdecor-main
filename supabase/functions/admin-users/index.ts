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

// PostgREST caps any single response at 1,000 rows and auth.admin.listUsers pages
// too, so anything that has to see *everyone* has to walk the pages — otherwise
// accounts past the first page silently vanish from the admin list.
const PAGE = 1000;

// deno-lint-ignore no-explicit-any
async function fetchAllRows(admin: any, table: string, columns: string) {
  // deno-lint-ignore no-explicit-any
  const rows: any[] = [];
  for (let from = 0; from < 100 * PAGE; from += PAGE) {
    const { data, error } = await admin.from(table).select(columns).range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE) break;
  }
  return rows;
}

// deno-lint-ignore no-explicit-any
async function listAllAuthUsers(admin: any) {
  // deno-lint-ignore no-explicit-any
  const users: any[] = [];
  for (let page = 1; page <= 100; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < PAGE) break;
  }
  return users;
}

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

  let body: { action?: string; userId?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const { action, userId } = body;

  if (action === "list") {
    let authUsers: { users: Awaited<ReturnType<typeof listAllAuthUsers>> };
    let profiles: Awaited<ReturnType<typeof fetchAllRows>>;
    let roles: Awaited<ReturnType<typeof fetchAllRows>>;
    let subs: Awaited<ReturnType<typeof fetchAllRows>>;
    try {
      const [users, p, r, sb] = await Promise.all([
        listAllAuthUsers(admin),
        fetchAllRows(admin, "profiles", "user_id, name, phone, banned_at, plan"),
        fetchAllRows(admin, "user_roles", "user_id, role"),
        fetchAllRows(admin, "subscriptions", "user_id, status, plan_key"),
      ]);
      authUsers = { users };
      profiles = p;
      roles = r;
      subs = sb;
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Couldn't load accounts." }, 500);
    }

    const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]));
    const adminIds = new Set((roles ?? []).filter((r) => r.role === "admin").map((r) => r.user_id));

    // The plan a customer is on comes from Stripe-backed subscriptions, not the legacy profiles.plan
    // column (which nothing updates any more, so everyone read as "free").
    const PLAN_NAMES: Record<string, string> = { phase1: "ThinkDecor", access: "Early access", studio: "Studio", scale: "Scale" };
    const planByUser = new Map<string, string>();
    for (const sub of subs ?? []) {
      if (sub.status === "active" || sub.status === "trialing") {
        planByUser.set(sub.user_id, PLAN_NAMES[sub.plan_key as string] ?? (sub.plan_key as string) ?? "paid");
      }
    }

    const users = authUsers.users.map((u) => {
      const profile = profileById.get(u.id);
      return {
        id: u.id,
        email: u.email,
        name: profile?.name ?? null,
        phone: profile?.phone ?? null,
        plan: planByUser.get(u.id) ?? "free",
        isAdmin: adminIds.has(u.id),
        bannedAt: profile?.banned_at ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at,
      };
    });

    return json({ users });
  }

  // Give someone admin access by email. An existing account is promoted on the
  // spot; anyone else is sent a Supabase invite and gets the role up front, so
  // it's waiting for them the moment they accept.
  if (action === "invite") {
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return json({ error: "Enter a valid email address." }, 400);
    }
    let existing: { id: string; email?: string } | undefined;
    try {
      existing = (await listAllAuthUsers(admin)).find((u) => u.email?.toLowerCase() === email);
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Couldn't look that account up." }, 500);
    }

    let targetId = existing?.id;
    let status: "promoted" | "invited" = "promoted";
    if (!targetId) {
      const site = Deno.env.get("SITE_URL") ?? "";
      const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(
        email,
        site ? { redirectTo: `${site.replace(/\/$/, "")}/admin` } : undefined,
      );
      if (inviteErr || !invited?.user) {
        return json({ error: inviteErr?.message ?? "Couldn't send the invitation." }, 400);
      }
      targetId = invited.user.id;
      status = "invited";
    }
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: targetId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleErr) return json({ error: roleErr.message }, 500);
    return json({ ok: true, status });
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
