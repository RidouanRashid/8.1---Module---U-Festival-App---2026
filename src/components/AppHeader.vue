<template>
  <header class="app-header">
    <div class="header-logo">
      <router-link to="/" aria-label="Home">
        <svg viewBox="0 0 80 36" class="logo-svg" aria-hidden="true">
          <text x="4" y="28" font-family="Sansation, sans-serif" font-size="28" font-weight="700" fill="var(--color-accent)">❤️U</text>
        </svg>
      </router-link>
    </div>
    <div class="header-actions">
      <button
        class="header-btn"
        @click="$emit('toggle-lang')"
        :aria-label="$t('common.language')"
      >
        <span class="lang-flag">{{ currentLocale === 'nl' ? '🇳🇱' : '🇬🇧' }}</span>
      </button>
      <button
        class="header-btn"
        @click="$emit('toggle-theme')"
        :aria-label="theme === 'dark' ? $t('common.lightMode') : $t('common.darkMode')"
      >
        <span class="material-icons">{{ theme === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const props = defineProps({
  theme: String
})

defineEmits(['toggle-theme', 'toggle-lang'])

const { locale } = useI18n()
const currentLocale = computed(() => locale.value)
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  padding-top: var(--safe-top);
  background: var(--color-base);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: calc(var(--spacing) * 2);
  padding-right: calc(var(--spacing) * 2);
  z-index: 100;
}

.header-logo a {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo-svg {
  height: 36px;
  width: 80px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing);
}

.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius);
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.header-btn:active {
  transform: scale(0.97);
}

.header-btn:hover {
  background-color: var(--color-surface);
}

.lang-flag {
  font-size: 1.3rem;
}

.header-btn .material-icons {
  font-size: 22px;
  color: var(--color-primary);
}
</style>
