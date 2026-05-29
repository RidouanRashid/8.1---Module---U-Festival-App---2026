// Base URL for API calls.
// In development the Vite proxy rewrites /api/* → XAMPP PHP.
// In production the built app sits in dist/ so ../api/ is the project-root api/ folder.
const BASE = import.meta.env.VITE_API_BASE ?? '/api'
const JSON_BASE = import.meta.env.VITE_JSON_BASE ?? '/data'

const FALLBACK_FILES = {
  'acts.php': 'acts.json',
  'info.php': 'info.json',
  'locales.php': 'locales.json',
  'map.php': 'map.json',
  'news.php': 'news.json',
  'schedule.php': 'schedule.json',
}

function parseEndpoint(endpoint) {
  const url = new URL(endpoint, 'http://local')
  return {
    path: url.pathname.replace(/^\/+/, ''),
    params: url.searchParams,
  }
}

async function loadFallbackFile(path) {
  const file = FALLBACK_FILES[path]
  if (!file) return null

  const res = await fetch(`${JSON_BASE}/${file}`)
  if (!res.ok) {
    throw new Error(`Fallback ${file} — ${res.status}`)
  }
  return res.json()
}

function mapFallbackData(path, params, data) {
  const lang = params.get('lang') || 'nl'

  if (path === 'news.php') {
    return data?.[lang] ?? []
  }

  if (path === 'info.php') {
    return data?.[lang] ?? { sections: [] }
  }

  if (path === 'locales.php') {
    return params.has('lang') ? (data?.[lang] ?? {}) : (data ?? { nl: {}, en: {} })
  }

  if (path === 'acts.php') {
    const id = params.get('id')
    if (!id) return Array.isArray(data) ? data : []

    const act = Array.isArray(data) ? data.find(item => item.id === id) : null
    if (!act) throw new Error('Act not found')
    return act
  }

  return data
}

async function loadFromFallback(endpoint) {
  const { path, params } = parseEndpoint(endpoint)
  const raw = await loadFallbackFile(path)
  if (raw === null) return null
  return mapFallbackData(path, params, raw)
}

export async function apiFetch(endpoint) {
  try {
    const res = await fetch(`${BASE}/${endpoint}`)
    if (!res.ok) throw new Error(`API ${endpoint} — ${res.status}`)
    return await res.json()
  } catch (apiError) {
    try {
      const fallback = await loadFromFallback(endpoint)
      if (fallback !== null) return fallback
    } catch (fallbackError) {
      console.error('JSON fallback failed:', fallbackError)
    }
    throw apiError
  }
}
