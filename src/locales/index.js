import { createI18n } from 'vue-i18n'

const BASE = import.meta.env.VITE_API_BASE ?? '/api'

function getSavedLocale() {
  try {
    return localStorage.getItem('loveU_lang') || 'nl'
  } catch {
    return 'nl'
  }
}

async function loadMessages() {
  try {
    const res = await fetch(`${BASE}/locales.php`)
    if (!res.ok) throw new Error(`locales.php ${res.status}`)
    const data = await res.json()
    if (data?.nl && data?.en) return data
  } catch (err) {
    console.error('Failed to load locales from API:', err)
  }
  return { nl: {}, en: {} }
}

export async function setupI18n() {
  const messages = await loadMessages()
  return createI18n({
    legacy: false,
    locale: getSavedLocale(),
    fallbackLocale: 'nl',
    messages,
  })
}
