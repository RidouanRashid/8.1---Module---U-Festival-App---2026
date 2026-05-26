// Base URL for API calls.
// In development the Vite proxy rewrites /api/* → XAMPP PHP.
// In production the built app sits in dist/ so ../api/ is the project-root api/ folder.
const BASE = import.meta.env.VITE_API_BASE ?? '/api'

export async function apiFetch(endpoint) {
  const res = await fetch(`${BASE}/${endpoint}`)
  if (!res.ok) throw new Error(`API ${endpoint} — ${res.status}`)
  return res.json()
}
