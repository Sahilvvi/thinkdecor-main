// @ts-nocheck
/* Every button in the super admin panel. Risky ones go through confirmDanger (typed confirmation),
   run on the server (which checks the role again and writes the audit log), then refresh live data. */
import { supabase } from '@/integrations/supabase/client';
import { $, esc, gbp, gbp0, int, ic, D, S, isSA, userById, api, hooks, toast, fail, confirmDanger, openModal, closeModal, denied, download } from './core';
import { AFTER } from './pages1';
import { FLAGS, } from './pages2';

const go = (h: string) => { if (location.hash === '#' + h) hooks.render(); else location.hash = h; };
const val = (id: string) => ($(id) as HTMLInputElement | null)?.value ?? '';
const ok = (msg: string, sub = '') => toast(msg, sub);
const setSetting = (key: string, value: any, reason = '') => api('saveSettings', { key, value, reason });

export const A: Record<string, (el?: any, e?: any) => any> = {
  toggleTest() { S.f.liveOnly = !S.f.liveOnly; hooks.render(); },
  exportDash() {
    const rows = [['date', 'live_gbp', 'test_gbp'], ...D.revenue.map((r: any) => [r.d, r.live, r.test])];
    download('revenue.csv', rows.map((r) => r.join(',')).join('\n'));
    ok('Revenue exported', 'Saved to your downloads');
  },

  /* ---------------- AI spend + kill switch ---------------- */
  kill() {
    const on = D.settings.ai.kill_switch;
    confirmDanger({ title: on ? 'Restart generation?' : 'Stop all generation?', body: on ? 'Gemini calls resume for every feature.' : 'Every Gemini call stops now: redesign, cleanup, replace and demo. Paying users will see a pause message.', word: on ? 'RESUME GENERATION' : 'KILL GENERATION', action: 'settings.ai (kill switch)', target: 'app_settings.ai.kill_switch', changes: [['Kill switch', on ? 'on' : 'off', on ? 'off' : 'on']], okLabel: on ? 'Restart generation' : 'Stop generation', danger: !on, done: on ? 'Generation restarted' : 'Generation stopped', run: (reason) => setSetting('ai', { kill_switch: !on }, reason) });
  },
  saveCaps() {
    const ai = D.settings.ai, cap = +val('#cap'), act = val('#capact'), sp = +val('#spike'), to = val('#alertto');
    const ch = [];
    if (cap !== ai.daily_cap_gbp) ch.push(['Daily cap', gbp0(ai.daily_cap_gbp), gbp0(cap)]);
    if (act !== ai.cap_action) ch.push(['When cap is hit', ai.cap_action, act]);
    if (sp !== ai.spike_pct) ch.push(['Spike warning', ai.spike_pct + '%', sp + '%']);
    if (to !== ai.alert_to) ch.push(['Alert contact', ai.alert_to || 'none', to || 'none']);
    if (!ch.length) return toast('Nothing changed', '', true);
    confirmDanger({ title: 'Save spend limits?', word: 'SAVE LIMITS', action: 'settings.ai (spend)', target: 'app_settings.ai', changes: ch, danger: false, okLabel: 'Save', done: 'Spend limits saved', run: (reason) => setSetting('ai', { daily_cap_gbp: cap, cap_action: act, spike_pct: sp, alert_to: to }, reason) });
  },

  /* ---------------- billing ---------------- */
  async sync(el) {
    const u = userById(el.dataset.id);
    try { const r = await api('syncUser', { userId: el.dataset.id }); toast('Synced ' + (u?.name ?? 'user') + ' from Stripe', `${r.subscriptions} subscription(s), ${r.payments} payment(s), +${r.creditsGranted} credits`); await hooks.refresh(true); } catch (e) { fail(e); }
  },
  syncSel() { A.sync({ dataset: { id: val('#s-user') } }); },
  grantFor(el) { S.tab.billing = 'manual'; S.f.grantUser = el.dataset.id; go('billing'); },
  doGrant() {
    if (!isSA()) return denied();
    const u = userById(val('#g-user')), n = +val('#g-amt'), reason = val('#g-reason'), g = S.f.grantKind === 'grant', note = val('#g-note');
    if (!u) return;
    if (!reason) { toast('Choose a reason first', 'Credit changes need a reason for the audit log', true); $('#g-reason').focus(); return; }
    if (!(n >= 1)) return toast('Enter a number of credits', '', true);
    const after = g ? u.credits + n : Math.max(0, u.credits - n);
    confirmDanger({ title: `${g ? 'Grant' : 'Remove'} ${n} credits?`, body: `${esc(u.name)} · ${esc(u.email)}<br>Reason: ${esc(reason)}`, word: String(n), action: g ? 'credits.grant' : 'credits.remove', target: u.id + ' · ' + u.name, changes: [['Credits', String(u.credits), String(after)]], reason: false, danger: !g, okLabel: g ? 'Grant credits' : 'Remove credits', done: 'Credits updated', run: () => api('creditChange', { userId: u.id, amount: n, kind: g ? 'grant' : 'remove', reason: reason + (note ? ' · ' + note : '') }) });
  },
  replay(el) {
    const e = D.stripe.events.find((x: any) => x.id === el.dataset.id);
    confirmDanger({ title: 'Re-sync this customer from Stripe?', body: `<span class="mono">${esc(e.type)}</span><br>Stripe can't re-send this event with a new signature, so this reconciles the customer's subscription and credits directly. Safe to repeat.`, word: 'REPLAY', action: 'stripe.replay', target: e.id, changes: [['Delivery', 'failed', 'reconciled']], danger: false, okLabel: 'Re-sync', done: 'Customer re-synced', run: (reason) => api('syncEventCustomer', { eventId: e.id, reason }) });
  },
  createPromo() {
    const code = val('#p-code').trim().toUpperCase();
    if (!code) return toast('Enter a code', '', true);
    const disc = val('#p-disc'), v = +val('#p-val'), months = +val('#p-months') || 1;
    const offer = disc === 'pct' ? `${v}% off${months > 1 ? ' for ' + months + ' months' : ' first payment'}` : `£${v} off first payment`;
    confirmDanger({ title: 'Create ' + code + '?', body: 'Creates a coupon and promotion code in your live Stripe account. Customers can use it straight away.', word: code, action: 'promo.create', target: code, changes: [['Offer', '—', offer]], danger: false, okLabel: 'Create code', done: code + ' created', run: (reason) => api('promoCreate', { code, owner: val('#p-owner'), kind: val('#p-kind'), discount: disc, percent: v, amountOff: v, months, limit: +val('#p-limit') || null, expires: val('#p-exp') || null, reason }) });
  },
  promoToggle(el) {
    const p = D.stripe.promos[+el.dataset.i];
    confirmDanger({ title: (p.active ? 'Pause ' : 'Activate ') + p.code + '?', word: p.code, action: 'promo.' + (p.active ? 'pause' : 'activate'), target: p.code, changes: [['Active', p.active ? 'yes' : 'no', p.active ? 'no' : 'yes']], danger: p.active, okLabel: p.active ? 'Pause code' : 'Activate', done: 'Code updated', run: (reason) => api('promoToggle', { id: p.id, code: p.code, active: !p.active, reason }) });
  },

  /* ---------------- users ---------------- */
  exportUsers() {
    confirmDanger({ title: 'Export all users?', body: 'The file contains personal data (emails, phone numbers) and downloads straight to this computer.', word: 'EXPORT', action: 'export.users', target: 'users.csv (' + int(D.users.length) + ' rows)', changes: [['File', '—', 'users.csv']], danger: false, okLabel: 'Export', done: 'Export downloaded', run: async () => { const r = await api('exportData', { dataset: 'users', mask: false }); download(r.name, r.csv); } });
  },
  impersonate(el) {
    const u = userById(el.dataset.id);
    confirmDanger({ sa: false, title: 'View as ' + u.name + '?', body: 'You will see this customer’s account details read-only inside the panel. Nothing can be generated, paid or changed. The session is logged.', word: 'VIEW AS', action: 'user.impersonate', target: u.id + ' · ' + u.name, changes: [['Session', '—', 'read-only']], danger: false, okLabel: 'Start read-only view', done: 'Read-only view started', run: async (reason) => { await api('impersonateStart', { userId: u.id, reason }); S.impersonating = u; } });
  },
  async endImp() { const u = S.impersonating; S.impersonating = null; try { await api('impersonateEnd', { userId: u?.id }); } catch { /* best effort */ } hooks.render(); toast('Session ended'); },
  exportUser(el) {
    const u = userById(el.dataset.id);
    confirmDanger({ title: 'Export ' + u.name + '’s data?', body: 'Downloads a JSON file with profile, credit ledger, designs, tickets, payments and subscriptions (GDPR Article 15).', word: 'EXPORT', action: 'user.export', target: u.id + ' · ' + u.name, changes: [['Export', '—', 'json download']], danger: false, okLabel: 'Download', done: 'Export downloaded', run: async (reason) => { const r = await api('userExport', { userId: u.id, reason }); download('user-' + u.id.slice(0, 8) + '.json', JSON.stringify(r.file, null, 2), 'application/json'); } });
  },
  resetCredits(el) {
    const u = userById(el.dataset.id);
    confirmDanger({ title: 'Reset credits to 0?', body: esc(u.name) + ' will need to buy a plan or be granted credits to generate again.', word: 'RESET', action: 'user.reset_credits', target: u.id + ' · ' + u.name, changes: [['Credits', String(u.credits), '0']], okLabel: 'Reset credits', done: 'Credits reset', run: (reason) => api('creditReset', { userId: u.id, reason }) });
  },
  suspend(el) {
    const u = userById(el.dataset.id);
    confirmDanger({ title: 'Suspend ' + u.name + '?', body: 'They are blocked from signing in and generating. Their subscription is not cancelled.', word: 'SUSPEND', action: 'user.suspend', target: u.id + ' · ' + u.name, changes: [['Status', u.status, 'suspended']], reasonRequired: true, okLabel: 'Suspend', done: u.name + ' suspended', run: (reason) => api('suspend', { userId: u.id, reason }) });
  },
  unsuspend(el) {
    const u = userById(el.dataset.id);
    confirmDanger({ title: 'Unsuspend ' + u.name + '?', word: 'UNSUSPEND', action: 'user.unsuspend', target: u.id + ' · ' + u.name, changes: [['Status', 'suspended', u.status]], danger: false, okLabel: 'Unsuspend', done: u.name + ' can sign in again', run: (reason) => api('unsuspend', { userId: u.id, reason }) });
  },
  deleteUser(el) {
    const u = userById(el.dataset.id);
    confirmDanger({ title: 'Delete this account for GDPR?', body: `Permanently deletes ${esc(u.name)}’s profile, designs and sign-in history, and cancels their Stripe subscription. Payment records are kept for legal reasons with the email removed. <b>This can’t be undone.</b>`, word: u.email, action: 'user.delete_gdpr', target: u.id, changes: [['Account', 'exists', 'deleted']], reasonRequired: true, okLabel: 'Delete permanently', done: 'Account deleted', run: async (reason) => { await api('deleteUser', { userId: u.id, confirmEmail: u.email, reason }); go('users'); } });
  },
  suspendCluster(el) {
    const us = D.users.filter((u: any) => u.phone === el.dataset.phone && !u.suspended && !u.isAdmin);
    if (!us.length) return toast('Nothing to suspend', 'Everyone in this group is already suspended or an admin', true);
    confirmDanger({ title: `Suspend ${us.length} accounts?`, body: 'All accounts on ' + esc(el.dataset.phone) + ' (admins excluded). They are blocked from signing in.', word: 'SUSPEND ' + us.length, action: 'user.suspend_bulk', target: el.dataset.phone, changes: [['Accounts', us.length + ' active', us.length + ' suspended']], reasonRequired: true, okLabel: 'Suspend all', done: us.length + ' accounts suspended', run: (reason) => api('suspend', { userIds: us.map((u: any) => u.id), reason }) });
  },
  saveDemo() {
    const ip = +val('#d-ip');
    confirmDanger({ title: 'Save demo limits?', word: 'SAVE LIMITS', action: 'settings.demo', target: 'app_settings.demo', changes: [['Per IP / day', String(D.settings.demo.per_ip), String(ip)]], danger: false, okLabel: 'Save', done: 'Demo limits saved', run: (reason) => setSetting('demo', { per_ip: ip }, reason) });
  },
  plainToggle(el) { el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true'); },

  /* ---------------- AI ---------------- */
  refundGen(el) {
    confirmDanger({ title: 'Refund 1 credit for this design?', body: 'Gives the customer one credit back as goodwill. Each design can be refunded once.', word: 'REFUND', action: 'credits.refund', target: el.dataset.id, changes: [['Credits', '—', '+1']], danger: false, okLabel: 'Refund 1 credit', done: 'Credit refunded', run: (reason) => api('refundGeneration', { generationId: el.dataset.id, reason }) });
  },
  async flagGen(el) { try { await api('flagGeneration', { generationId: el.dataset.id }); await hooks.refresh(true); } catch (e) { fail(e); } },
  mv(el) { const i = +el.dataset.i, d = +el.dataset.d, a = S.f.fallback, j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; S.f.orderDirty = true; S.f.beaut = val('#m-beaut'); hooks.render(); },
  saveModel() {
    const ai = D.settings.ai, m = val('#m-model'), fc = +val('#m-free'), b = val('#m-beaut'), fb = S.f.fallback || ai.fallback;
    const ch = [];
    if (m !== ai.model) ch.push(['Live model', ai.model, m]);
    if (fc !== ai.free_credits) ch.push(['Free credits', String(ai.free_credits), String(fc)]);
    if (b !== ai.beautifier) ch.push(['Beautifier', (ai.beautifier || 'default').slice(0, 30), (b || 'default').slice(0, 30)]);
    if (JSON.stringify(fb) !== JSON.stringify(ai.fallback)) ch.push(['Fallback order', ai.fallback.join(' → '), fb.join(' → ')]);
    if (!ch.length) return toast('Nothing changed', '', true);
    confirmDanger({ title: 'Publish model settings?', body: 'Edge functions pick these up on the next request. No deploy needed. A wrong model name makes generation fall back to the next model.', word: 'PUBLISH', action: 'settings.ai (model)', target: 'app_settings.ai', changes: ch, danger: false, okLabel: 'Publish', done: 'Model settings live', run: async (reason) => { await setSetting('ai', { model: m, free_credits: fc, beautifier: b, fallback: fb }, reason); S.f.fallback = null; S.f.beaut = null; S.f.orderDirty = false; } });
  },
  savePrice(el) {
    const i = +el.dataset.i, p = D.aiPricing[i], inn = +val('#pr-in-' + i), out = +val('#pr-out-' + i);
    confirmDanger({ title: 'Save token prices for ' + p.model + '?', word: 'SAVE PRICE', action: 'settings.ai_pricing', target: p.model, changes: [['Input $/M', String(p.input_usd_per_m), String(inn)], ['Output $/M', String(p.output_usd_per_m), String(out)]], danger: false, okLabel: 'Save', done: 'Prices saved', run: (reason) => api('savePricingRow', { model: p.model, input: inn, output: out, note: 'set in super admin', reason }) });
  },
  saveRate() {
    const r = +val('#usdgbp');
    confirmDanger({ title: 'Save USD to GBP rate?', word: 'SAVE RATE', action: 'settings.ai (rate)', target: 'app_settings.ai.usd_gbp', changes: [['USD → GBP', String(D.settings.ai.usd_gbp), String(r)]], danger: false, okLabel: 'Save', done: 'Rate saved', run: (reason) => setSetting('ai', { usd_gbp: r }, reason) });
  },
  async modDismiss(el) {
    try { await api('dismissModeration', { eventId: el.dataset.id }); const s = new Set(JSON.parse(localStorage.getItem('sa_dismissed') || '[]')); s.add(el.dataset.id); localStorage.setItem('sa_dismissed', JSON.stringify([...s])); D.moderation = D.moderation.filter((m: any) => m.id !== el.dataset.id); hooks.render(); toast('Dismissed'); } catch (e) { fail(e); }
  },

  /* ---------------- flags ---------------- */
  flag(el) {
    const k = el.dataset.k, f = FLAGS.find((x) => x[0] === k), on = D.settings.flags[k];
    confirmDanger({ title: (on ? 'Turn off ' : 'Turn on ') + f[1].toLowerCase() + '?', body: on ? f[2] + ' will stop for everyone within about 10 seconds.' : f[2] + ' will be available again.', word: on ? f[3] : 'ENABLE', action: 'flag.change', target: 'Feature flag: ' + k, changes: [[f[1], on ? 'on' : 'off', on ? 'off' : 'on']], danger: on, okLabel: on ? 'Turn off' : 'Turn on', done: f[1] + (on ? ' turned off' : ' turned on'), run: (reason) => setSetting('flags', { [k]: !on }, reason) });
  },
  maint() {
    const on = D.settings.flags.maintenance, text = val('#mt');
    confirmDanger({ title: on ? 'Hide the maintenance banner?' : 'Show the maintenance banner?', body: esc(text), word: 'BANNER', action: 'flag.change', target: 'maintenance banner', changes: [['Banner', on ? 'shown' : 'hidden', on ? 'hidden' : 'shown']], danger: false, okLabel: on ? 'Hide' : 'Show banner', done: on ? 'Banner hidden' : 'Banner live', run: async (reason) => { if (text !== D.settings.maintenance_text) await setSetting('maintenance_text', text, reason); await setSetting('flags', { maintenance: !on }, reason); } });
  },
  async saveMaint() { try { await setSetting('maintenance_text', val('#mt')); toast('Banner text saved'); await hooks.refresh(true); } catch (e) { fail(e); } },

  /* ---------------- access ---------------- */
  invite() {
    if (!isSA()) return denied();
    openModal(`<div class="modal__ic" style="background:var(--tint);color:var(--char)">${ic('mail')}</div><h3>Invite an admin</h3><p>They get an email to set a password. Then set up 2FA on the Access page.</p><div class="field"><label for="iv-e">Work email</label><input class="inp" id="iv-e" placeholder="name@thinkdecor.app"></div><div class="field"><label for="iv-r">Role</label><select class="inp" id="iv-r"><option>admin</option><option>super_admin</option></select></div><div class="modal__act"><button class="btn btn-l" data-m="cancel">Cancel</button><button class="btn btn-p" data-m="ok">Send invite</button></div>`);
    $('[data-m="cancel"]').onclick = closeModal;
    $('[data-m="ok"]').onclick = async () => { const e = val('#iv-e').trim(); if (!/.+@.+\..+/.test(e)) return toast('Enter a valid email', '', true); try { await api('inviteAdmin', { email: e, role: val('#iv-r') }); closeModal(); toast('Invite sent to ' + e); await hooks.refresh(true); } catch (er) { closeModal(); fail(er); } };
  },
  removeAdmin(el) {
    const a = D.admins.find((x: any) => x.id === el.dataset.id);
    confirmDanger({ title: 'Remove ' + a.name + '?', body: 'Their admin role is removed and every session they have is signed out. Their audit history stays.', word: a.email, action: 'role.remove', target: a.id + ' · ' + a.name, changes: [['Role', a.role, 'none']], okLabel: 'Remove access', done: a.name + ' removed', run: (reason) => api('removeAdmin', { userId: a.id, reason }) });
  },
  req2fa() {
    const on = D.settings.security.require_2fa;
    if (!on && !D.me.mfa) return toast('Set up your own 2FA first', 'Otherwise you would lock yourself out of this panel', true);
    confirmDanger({ title: on ? 'Stop requiring 2FA?' : 'Require 2FA?', body: on ? 'Not recommended. Admins could sign in with a password only.' : 'Admins without an authenticator app will be blocked from the panel until they set one up.', word: on ? 'DISABLE 2FA' : 'ENABLE', action: 'settings.security', target: 'admin sign-in', changes: [['Require 2FA', on ? 'yes' : 'no', on ? 'no' : 'yes']], danger: on, okLabel: 'Save', done: 'Sign-in policy updated', run: (reason) => setSetting('security', { require_2fa: !on }, reason) });
  },
  ipAllow() {
    const sec = D.settings.security, on = sec.ip_allow;
    if (!on && !sec.ips.some((x: string) => x.split(/\s+/)[0] === D.me.ip)) return toast('Add your IP first (' + D.me.ip + ')', 'Otherwise you would lock yourself out', true);
    confirmDanger({ title: on ? 'Turn off the IP allow-list?' : 'Turn on the IP allow-list?', body: on ? '' : 'Only the addresses listed can use the panel.', word: 'IP LIST', action: 'settings.security', target: 'admin sign-in', changes: [['IP allow-list', on ? 'on' : 'off', on ? 'off' : 'on']], danger: !on, okLabel: 'Save', done: 'IP allow-list ' + (on ? 'off' : 'on'), run: (reason) => setSetting('security', { ip_allow: !on }, reason) });
  },
  async addIp() { const v = val('#newip').trim(); if (!v) return; if (!isSA()) return denied(); try { await setSetting('security', { ips: [...D.settings.security.ips, v] }); await hooks.refresh(true); } catch (e) { fail(e); } },
  async addMyIp() { if (!isSA()) return denied(); try { await setSetting('security', { ips: [...D.settings.security.ips, D.me.ip + ' · ' + D.me.email] }); await hooks.refresh(true); } catch (e) { fail(e); } },
  async rmIp(el) { if (!isSA()) return denied(); const ips = D.settings.security.ips.filter((_: any, i: number) => i !== +el.dataset.i); try { await setSetting('security', { ips }); await hooks.refresh(true); } catch (e) { fail(e); } },
  simTimeout() { S.idleLeft = 0; hooks.tick?.(); },
  async mfaEnroll() {
    const box = $('#mfa-box');
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) return fail(error);
    box.innerHTML = `<div class="stack" style="margin-top:10px"><img alt="Scan with your authenticator app" src="${data.totp.qr_code}" style="width:180px;height:180px;background:#fff;border-radius:12px;padding:8px;box-shadow:inset 0 0 0 1px var(--stone)"><small class="sub">Or type this key: <span class="mono">${esc(data.totp.secret)}</span></small><div class="field"><label for="mfa-code">6-digit code</label><input class="inp mono" id="mfa-code" inputmode="numeric" maxlength="6" placeholder="000000"></div><button class="btn btn-p" id="mfa-go">Verify and turn on</button></div>`;
    $('#mfa-go').onclick = async () => {
      const ch = await supabase.auth.mfa.challenge({ factorId: data.id });
      if (ch.error) return fail(ch.error);
      const v = await supabase.auth.mfa.verify({ factorId: data.id, challengeId: ch.data.id, code: val('#mfa-code') });
      if (v.error) return toast('That code was wrong', 'Check the time on your phone and try again', true);
      toast('2FA is on for your account'); await hooks.refresh(true);
    };
  },

  /* ---------------- growth + system ---------------- */
  sendMail() {
    const mode = S.f.mailTo || 'seg';
    let to: string[] = [], label = '';
    if (mode === 'seg') { const seg = D.comms.segments.find((s: any) => s.key === val('#e-seg')); to = seg?.emails ?? []; label = seg?.label ?? ''; } else { to = [val('#e-one')]; label = val('#e-one'); }
    const subject = val('#e-sub').trim(), message = val('#e-body').trim();
    if (!subject || !message) return toast('Write a subject and message first', '', true);
    if (!to.length) return toast('That segment is empty', '', true);
    confirmDanger({ title: `Send to ${int(to.length)} ${to.length === 1 ? 'person' : 'people'}?`, body: 'Subject: ' + esc(subject), word: 'SEND ' + to.length, action: 'email.send', target: label, changes: [['Recipients', '—', int(to.length)]], danger: false, okLabel: 'Send email', done: 'Email sent', run: (reason) => api('sendEmail', { to, subject, message, reason }) });
  },
  doExport() {
    const set = val('#x-set'), mask = $('#x-mask')?.getAttribute('aria-checked') === 'true', from = val('#x-from'), to = val('#x-to');
    confirmDanger({ title: `Export ${set}?`, body: 'The file downloads straight to this computer. It is logged.' + (mask ? '' : ' <b>Personal data is not masked.</b>'), word: 'EXPORT', action: 'export.' + set, target: set + ' · ' + from + ' → ' + to, changes: [['File', '—', set + '.csv']], danger: !mask, okLabel: 'Download export', done: 'Export downloaded', run: async () => { const r = await api('exportData', { dataset: set, from, to, mask }); download(r.name, r.csv); } });
  },
  exportAudit() {
    confirmDanger({ title: 'Export the audit log?', word: 'EXPORT', action: 'export.audit', target: 'audit_log.csv', changes: [['File', '—', 'audit_log.csv']], danger: false, okLabel: 'Download', done: 'Export downloaded', run: async () => { const r = await api('exportData', { dataset: 'audit', from: '2020-01-01', to: new Date().toISOString().slice(0, 10), mask: false }); download(r.name, r.csv); } });
  },
};

/* selects that need a confirmation when changed */
AFTER.access = () => {
  document.querySelectorAll('[data-role-for]').forEach((s: any) => {
    s.onchange = () => {
      const a = D.admins.find((x: any) => x.id === s.dataset.roleFor), to = s.value, from = a.role; s.value = from;
      confirmDanger({ title: `Make ${a.name} ${to}?`, body: to === 'super_admin' ? 'They will be able to change settings, delete accounts and change other admins’ roles.' : 'They will lose access to risky actions.', word: a.email, action: 'role.change', target: a.id + ' · ' + a.name, changes: [['Role', from, to]], okLabel: 'Change role', done: 'Role changed', run: (reason) => api('roleChange', { userId: a.id, role: to, reason }) });
    };
  });
  const t = $('#tout');
  if (t) t.onchange = () => {
    const v = +t.value, old = D.settings.security.timeout_min; t.value = old;
    confirmDanger({ title: 'Change session timeout?', word: 'TIMEOUT', action: 'settings.security', target: 'admin sessions', changes: [['Idle timeout', old + ' min', v + ' min']], danger: false, okLabel: 'Save', done: 'Timeout updated', run: (reason) => setSetting('security', { timeout_min: v }, reason) });
  };
};
