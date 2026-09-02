// Same-origin ('') in dev (Vite proxies /api to the local backend) and in
// any deployment where frontend and backend share one origin. Set at build
// time via VITE_API_BASE_URL when they're split across different domains —
// e.g. Cloudflare Pages (frontend) + Render (backend) — so every request
// below hits the backend's origin instead of the frontend's own, where
// there is no /api route at all.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
