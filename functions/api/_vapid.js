/* ═══════════════════════════════════════════
   RISHI Web Push — VAPID keys
   Used by _push.js to sign push requests.
   Public key is also embedded in monitor.html (applicationServerKey).
   Env vars (VAPID_PUBLIC_KEY / VAPID_PRIVATE_D / VAPID_PRIVATE_X / VAPID_PRIVATE_Y
   / VAPID_SUBJECT) override these if set in Cloudflare.
   NOTE: this file is a Pages Functions module (path starts with "_"), so it is
   NOT served to browsers — only the public key is exposed to the client.
   ═══════════════════════════════════════════ */

export function getVapid(env) {
  env = env || {};
  return {
    publicKey: env.VAPID_PUBLIC_KEY || 'BGX3EMcMCcbfns0OnEPZmY_jzcslwOKyipESDGFKWL3eGU5ZSyzEocMKggPumDZ56RWkFYXCYhRQCF5piQHeQUM',
    privateJwk: {
      kty: 'EC',
      crv: 'P-256',
      d: env.VAPID_PRIVATE_D || '_jcEyqS34YhiMx8KkwuqiYT7ZlQeUiWPP0AijNbJBS8',
      x: env.VAPID_PRIVATE_X || 'ZfcQxwwJxt-ezQ6cQ9mZj-PNyyXA4rKKkRIMYUpYvd4',
      y: env.VAPID_PRIVATE_Y || 'GU5ZSyzEocMKggPumDZ56RWkFYXCYhRQCF5piQHeQUM',
      ext: true
    },
    subject: env.VAPID_SUBJECT || 'mailto:arindambhowmik2013@gmail.com'
  };
}
