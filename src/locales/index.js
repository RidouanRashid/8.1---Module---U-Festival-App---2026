import { createI18n } from 'vue-i18n'
import { apiFetch } from '../composables/useApi.js'

function getSavedLocale() {
  try {
    return localStorage.getItem('loveU_lang') || 'nl'
  } catch {
    return 'nl'
  }
}

async function loadMessages() {
  try {
    const data = await apiFetch('locales.php')
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
