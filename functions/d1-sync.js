/* ═══════════════════════════════════════════
   RISHI D1 SYNC WORKER — functions/d1-sync.js
   Handles both progress sync and account sync.
   Requires D1 binding named "DB".
   ═══════════════════════════════════════════ */

export async function onRequest(context) {
  const { request, env } = context;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers });

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 not configured. Add DB binding named 'DB'." }), { status: 500, headers });
  }

  let body;
  try { body = await request.json(); } catch(e) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const { action } = body;

  /* ── ENSURE TABLES EXIST ── */
  try {
    await env.DB.exec("CREATE TABLE IF NOT EXISTS rishi_sync (student_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (student_id, key))");
    await env.DB.exec("CREATE TABLE IF NOT EXISTS rishi_accounts (username TEXT PRIMARY KEY, role TEXT NOT NULL, mobile TEXT NOT NULL, data TEXT NOT NULL, pw_override TEXT, updated_at INTEGER NOT NULL)");
    await env.DB.exec("CREATE TABLE IF NOT EXISTS rishi_referrals (code TEXT PRIMARY KEY, referrer_username TEXT NOT NULL, referee_fname TEXT, referee_lname TEXT, referee_wa TEXT, created_at INTEGER NOT NULL, used_by TEXT, used_at INTEGER, status TEXT NOT NULL DEFAULT 'active')");
    await env.DB.exec("CREATE TABLE IF NOT EXISTS rishi_admin_codes (code TEXT PRIMARY KEY, created_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0, used_by TEXT, used_at INTEGER)");
  } catch(e) {
    return new Response(JSON.stringify({ error: "Table init failed", detail: String(e) }), { status: 500, headers });
  }

  /* ════════════════════════════════
     PROGRESS SYNC — set / get
  ════════════════════════════════ */

  if (action === "set") {
    const { studentId, key, value } = body;
    if (!studentId || !key || value === undefined) {
      return new Response(JSON.stringify({ error: "studentId, key, value required" }), { status: 400, headers });
    }
    try {
      await env.DB.prepare(
        `INSERT INTO rishi_sync (student_id, key, value, updated_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(student_id, key)
         DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
      ).bind(studentId.trim().toLowerCase(), key, String(value), Date.now()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "DB write failed", detail: String(e) }), { status: 500, headers });
    }
  }

  if (action === "get") {
    const { studentId } = body;
    if (!studentId) return new Response(JSON.stringify({ error: "studentId required" }), { status: 400, headers });
    try {
      const result = await env.DB.prepare(
        `SELECT key, value, updated_at FROM rishi_sync WHERE student_id = ? ORDER BY updated_at DESC`
      ).bind(studentId.trim().toLowerCase()).all();
      return new Response(JSON.stringify({ ok: true, data: result.results || [] }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "DB read failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* ════════════════════════════════
     ACCOUNT SYNC
  ════════════════════════════════ */

  /* Register — saves both student and parent rows */
  if (action === "register") {
    const { data } = body;
    if (!data || !data.studentUsername || !data.parentUsername || !data.primaryMobile) {
      return new Response(JSON.stringify({ error: "data with studentUsername, parentUsername, primaryMobile required" }), { status: 400, headers });
    }
    const now = Date.now();
    const json = JSON.stringify(data);
    try {
      await env.DB.prepare(
        `INSERT INTO rishi_accounts (username, role, mobile, data, updated_at)
         VALUES (?, 'student', ?, ?, ?)
         ON CONFLICT(username)
         DO UPDATE SET data = excluded.data, mobile = excluded.mobile, updated_at = excluded.updated_at`
      ).bind(data.studentUsername.toLowerCase(), data.primaryMobile, json, now).run();

      await env.DB.prepare(
        `INSERT INTO rishi_accounts (username, role, mobile, data, updated_at)
         VALUES (?, 'parent', ?, ?, ?)
         ON CONFLICT(username)
         DO UPDATE SET data = excluded.data, mobile = excluded.mobile, updated_at = excluded.updated_at`
      ).bind(data.parentUsername.toLowerCase(), data.primaryMobile, json, now).run();

      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Register failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Find account by username */
  if (action === "find-account") {
    const { username } = body;
    if (!username) return new Response(JSON.stringify({ error: "username required" }), { status: 400, headers });
    try {
      const row = await env.DB.prepare(
        `SELECT * FROM rishi_accounts WHERE username = ?`
      ).bind(username.trim().toLowerCase()).first();
      if (!row) return new Response(JSON.stringify({ ok: true, found: false }), { headers });
      return new Response(JSON.stringify({
        ok: true, found: true,
        role: row.role,
        pw_override: row.pw_override || null,
        data: JSON.parse(row.data)
      }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Query failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Find account by mobile — for forgot credentials */
  if (action === "find-by-mobile") {
    const { mobile } = body;
    if (!mobile) return new Response(JSON.stringify({ error: "mobile required" }), { status: 400, headers });
    try {
      const row = await env.DB.prepare(
        `SELECT * FROM rishi_accounts WHERE mobile = ? AND role = 'student'`
      ).bind(mobile.trim()).first();
      if (!row) return new Response(JSON.stringify({ ok: true, found: false }), { headers });
      const d = JSON.parse(row.data);
      const pRow = await env.DB.prepare(
        `SELECT pw_override FROM rishi_accounts WHERE username = ?`
      ).bind(d.parentUsername.toLowerCase()).first();
      return new Response(JSON.stringify({
        ok: true, found: true,
        studentUsername: d.studentUsername,
        parentUsername: d.parentUsername,
        studentPwOverride: row.pw_override || null,
        parentPwOverride: (pRow && pRow.pw_override) || null
      }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Query failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Save password override */
  if (action === "save-pw") {
    const { username, pw } = body;
    if (!username || !pw) return new Response(JSON.stringify({ error: "username and pw required" }), { status: 400, headers });
    try {
      await env.DB.prepare(
        `UPDATE rishi_accounts SET pw_override = ?, updated_at = ? WHERE username = ?`
      ).bind(pw, Date.now(), username.trim().toLowerCase()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "PW save failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Update profile fields for an existing student/parent pair */
  if (action === "update-profile") {
    const { studentUsername, data } = body;
    if (!studentUsername || !data) {
      return new Response(JSON.stringify({ error: "studentUsername and data required" }), { status: 400, headers });
    }
    const now = Date.now();
    const json = JSON.stringify(data);
    const mobile = data.primaryMobile || '';
    try {
      await env.DB.prepare(
        `UPDATE rishi_accounts SET data = ?, mobile = ?, updated_at = ? WHERE username = ?`
      ).bind(json, mobile, now, studentUsername.trim().toLowerCase()).run();
      if (data.parentUsername) {
        await env.DB.prepare(
          `UPDATE rishi_accounts SET data = ?, mobile = ?, updated_at = ? WHERE username = ?`
        ).bind(json, mobile, now, data.parentUsername.trim().toLowerCase()).run();
      }
      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Update failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* ════════════════════════════════
     REFERRAL SYSTEM
  ════════════════════════════════ */

  /* Store an admin-generated one-time code */
  if (action === "store-admin-code") {
    const { code } = body;
    if (!code) return new Response(JSON.stringify({ error: "code required" }), { status: 400, headers });
    try {
      await env.DB.prepare(
        `INSERT INTO rishi_admin_codes (code, created_at) VALUES (?, ?)
         ON CONFLICT(code) DO NOTHING`
      ).bind(code.toUpperCase().trim(), Date.now()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Store admin code failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Store a new referral code */
  if (action === "store-referral") {
    const { code, referrerUsername, refereeFname, refereeLname, refereeWa } = body;
    if (!code || !referrerUsername) {
      return new Response(JSON.stringify({ error: "code and referrerUsername required" }), { status: 400, headers });
    }
    try {
      await env.DB.prepare(
        `INSERT INTO rishi_referrals (code, referrer_username, referee_fname, referee_lname, referee_wa, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(code) DO NOTHING`
      ).bind(
        code.toUpperCase().trim(),
        referrerUsername.toLowerCase().trim(),
        refereeFname || '',
        refereeLname || '',
        refereeWa    || '',
        Date.now()
      ).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Store referral failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Validate a referral code (check active, not used) */
  if (action === "validate-referral") {
    const { code } = body;
    if (!code) return new Response(JSON.stringify({ error: "code required" }), { status: 400, headers });
    const upperCode = code.toUpperCase().trim();

    /* ── Admin one-time code (ARISHI- prefix) ── */
    if (upperCode.startsWith("ARISHI-")) {
      try {
        const row = await env.DB.prepare(
          `SELECT code, used, used_by FROM rishi_admin_codes WHERE code = ?`
        ).bind(upperCode).first();
        if (!row) return new Response(JSON.stringify({ ok: true, valid: false, message: "Admin code not found or expired" }), { headers });
        if (row.used) return new Response(JSON.stringify({ ok: true, valid: false, message: "Admin code already used by " + (row.used_by || "a student") }), { headers });
        return new Response(JSON.stringify({ ok: true, valid: true, type: "admin", fullRecharge: true, discount: 599 }), { headers });
      } catch(e) {
        return new Response(JSON.stringify({ error: "Admin code validate failed", detail: String(e) }), { status: 500, headers });
      }
    }

    /* ── Parent referral code ── */
    try {
      const row = await env.DB.prepare(
        `SELECT code, referrer_username, status FROM rishi_referrals WHERE code = ?`
      ).bind(upperCode).first();
      if (!row) {
        return new Response(JSON.stringify({ ok: true, valid: false, message: "Code not found" }), { headers });
      }
      if (row.status !== 'active') {
        return new Response(JSON.stringify({ ok: true, valid: false, message: "Code already used" }), { headers });
      }
      return new Response(JSON.stringify({ ok: true, valid: true, type: "referral", discount: 100 }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Validate failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Redeem a referral code — mark as used */
  if (action === "redeem-referral") {
    const { code, usedBy } = body;
    if (!code || !usedBy) {
      return new Response(JSON.stringify({ error: "code and usedBy required" }), { status: 400, headers });
    }
    const upperCode = code.toUpperCase().trim();

    /* ── Admin one-time code ── */
    if (upperCode.startsWith("ARISHI-")) {
      try {
        const result = await env.DB.prepare(
          `UPDATE rishi_admin_codes SET used = 1, used_by = ?, used_at = ? WHERE code = ? AND used = 0`
        ).bind(usedBy.trim(), Date.now(), upperCode).run();
        const redeemed = result.meta && result.meta.changes > 0;
        return new Response(JSON.stringify({ ok: true, redeemed }), { headers });
      } catch(e) {
        return new Response(JSON.stringify({ error: "Redeem admin code failed", detail: String(e) }), { status: 500, headers });
      }
    }

    /* ── Parent referral code ── */
    try {
      const result = await env.DB.prepare(
        `UPDATE rishi_referrals SET status = 'used', used_by = ?, used_at = ? WHERE code = ? AND status = 'active'`
      ).bind(usedBy.trim(), Date.now(), upperCode).run();
      const redeemed = result.meta && result.meta.changes > 0;
      return new Response(JSON.stringify({ ok: true, redeemed }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "Redeem failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* Get break + error logs for all students — admin panel */
  if (action === "get_logs") {
    try {
      const [breakRes, errorRes] = await Promise.all([
        env.DB.prepare(`SELECT student_id, value FROM rishi_sync WHERE key = 'rishi_break_log' ORDER BY updated_at DESC`).all(),
        env.DB.prepare(`SELECT student_id, value FROM rishi_sync WHERE key = 'rishi_error_log' ORDER BY updated_at DESC`).all()
      ]);

      const breakLogs = [];
      (breakRes.results || []).forEach(r => {
        try {
          const entries = JSON.parse(r.value);
          if (Array.isArray(entries)) {
            entries.forEach(e => { if (!e.studentId) e.studentId = r.student_id; });
            breakLogs.push(...entries);
          }
        } catch(e) {}
      });

      const errorLogs = [];
      (errorRes.results || []).forEach(r => {
        try {
          const entries = JSON.parse(r.value);
          if (Array.isArray(entries)) {
            entries.forEach(e => { if (!e.studentId) e.studentId = r.student_id; });
            errorLogs.push(...entries);
          }
        } catch(e) {}
      });

      /* Sort both by date+time descending */
      breakLogs.sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time));
      errorLogs.sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time));

      return new Response(JSON.stringify({ ok: true, breakLogs, errorLogs }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "get_logs failed", detail: String(e) }), { status: 500, headers });
    }
  }

  /* List all student registrations — for admin panel */
  if (action === "list_all") {
    try {
      const result = await env.DB.prepare(
        `SELECT data FROM rishi_accounts WHERE role = 'student' ORDER BY updated_at DESC`
      ).all();
      const registrations = (result.results || []).map(r => {
        try { return JSON.parse(r.data); } catch(e) { return null; }
      }).filter(Boolean);
      return new Response(JSON.stringify({ ok: true, registrations }), { headers });
    } catch(e) {
      return new Response(JSON.stringify({ error: "List failed", detail: String(e) }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: "Unknown action: " + action }), { status: 400, headers });
}
