// Same-origin ('') in dev (Vite proxies /api to the local backend) and in
// any deployment where frontend and backend share one origin. Set at build
// time via VITE_API_BASE_URL when they're split across different hosts —
// e.g. Cloudflare Workers (frontend, dhammahadaya.net) + Render (backend,
// api.dhammahadaya.net) — so every request below hits the backend's origin
// instead of the frontend's own, where there is no /api route at all. Both
// now share the same root domain (2026-10 migration, away from the old
// api.dhamma-hadaya.com) so the admin session cookie is same-site instead
// of cross-site, avoiding browsers' third-party-cookie blocking.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
