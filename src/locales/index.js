import { createI18n } from 'vue-i18n'
import nl from './nl.json'
import en from './en.json'

function getSavedLocale() {
  try {
    return localStorage.getItem('loveU_lang') || 'nl'
  } catch {
    return 'nl'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale(),
  fallbackLocale: 'nl',
  messages: { nl, en }
})

export default i18n
