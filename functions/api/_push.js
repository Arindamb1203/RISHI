/* ═══════════════════════════════════════════
   RISHI Web Push sender — functions/api/_push.js
   Pure-WebCrypto implementation of:
     - VAPID (RFC 8292)  → Authorization header
     - aes128gcm content encoding (RFC 8188 + RFC 8291) → encrypted payload
   Module path starts with "_" so Cloudflare Pages does NOT route it.
   ═══════════════════════════════════════════ */
import { getVapid } from './_vapid.js';

/* ── base64url helpers ── */
function b64urlToBytes(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64url(buf) {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function concatBytes(arrs) {
  let len = 0;
  arrs.forEach(a => { len += a.length; });
  const out = new Uint8Array(len);
  let o = 0;
  arrs.forEach(a => { out.set(a, o); o += a.length; });
  return out;
}
function strBytes(s) { return new TextEncoder().encode(s); }

/* ── HKDF (extract + expand in one deriveBits call) ── */
async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: salt, info: info },
    key, len * 8
  );
  return new Uint8Array(bits);
}

/* ── VAPID JWT (ES256) ── */
async function makeVapidAuth(env, endpoint) {
  const v = getVapid(env);
  const url = new URL(endpoint);
  const aud = url.origin;
  const header = bytesToB64url(strBytes(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = bytesToB64url(strBytes(JSON.stringify({
    aud: aud,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: v.subject
  })));
  const signingInput = header + '.' + payload;
  const privKey = await crypto.subtle.importKey(
    'jwk', v.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, privKey, strBytes(signingInput)
  );
  const jwt = signingInput + '.' + bytesToB64url(sig);
  return { authorization: 'vapid t=' + jwt + ', k=' + v.publicKey };
}

/* ── encrypt payload (aes128gcm) ── */
async function encryptPayload(subscription, payloadStr) {
  const uaPublic = b64urlToBytes(subscription.keys.p256dh); // 65 bytes
  const authSecret = b64urlToBytes(subscription.keys.auth); // 16 bytes

  const ephem = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', ephem.publicKey)); // 65 bytes

  const uaKey = await crypto.subtle.importKey(
    'raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: uaKey }, ephem.privateKey, 256
  )); // 32 bytes

  const salt = crypto.getRandomValues(new Uint8Array(16));

  // IKM (RFC 8291 §3.4)
  const keyInfo = concatBytes([strBytes('WebPush: info\0'), uaPublic, asPublic]);
  const ikm = await hkdf(authSecret, ecdh, keyInfo, 32);

  // CEK + NONCE (RFC 8188)
  const cekBytes = await hkdf(salt, ikm, strBytes('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, strBytes('Content-Encoding: nonce\0'), 12);

  const cek = await crypto.subtle.importKey('raw', cekBytes, { name: 'AES-GCM' }, false, ['encrypt']);
  const plaintext = concatBytes([strBytes(payloadStr), new Uint8Array([0x02])]); // 0x02 = last record
  const cipher = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 }, cek, plaintext
  ));

  // aes128gcm header: salt(16) | rs(4) | idlen(1) | keyid(asPublic 65)
  const rs = new Uint8Array([0x00, 0x00, 0x10, 0x00]); // 4096
  const idlen = new Uint8Array([asPublic.length]);
  return concatBytes([salt, rs, idlen, asPublic, cipher]);
}

/* ── send one push; returns {ok} or {gone:true} for dead subscriptions ── */
export async function sendOne(env, subscription, payloadObj) {
  try {
    const body = await encryptPayload(subscription, JSON.stringify(payloadObj));
    const vauth = await makeVapidAuth(env, subscription.endpoint);
    const res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': vauth.authorization,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream',
        'TTL': '86400'
      },
      body: body
    });
    if (res.status === 404 || res.status === 410) return { gone: true };
    if (res.status >= 200 && res.status < 300) return { ok: true };
    return { ok: false, status: res.status, detail: await res.text().catch(() => '') };
  } catch (e) {
    return { ok: false, detail: String(e) };
  }
}

/* ── send to every stored admin subscription; prunes dead ones ── */
export async function pushToAllAdmins(env, payloadObj) {
  if (!env || !env.DB) return;
  try {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS rishi_push_subs (endpoint TEXT PRIMARY KEY, sub TEXT NOT NULL, created_at INTEGER NOT NULL)`
    ).run();
    const rows = (await env.DB.prepare(`SELECT endpoint, sub FROM rishi_push_subs`).all()).results || [];
    for (const row of rows) {
      let sub;
      try { sub = JSON.parse(row.sub); } catch (e) { continue; }
      const r = await sendOne(env, sub, payloadObj);
      if (r.gone) {
        try { await env.DB.prepare(`DELETE FROM rishi_push_subs WHERE endpoint = ?`).bind(row.endpoint).run(); } catch (e) {}
      }
    }
  } catch (e) { /* never let push failures break the caller */ }
}
