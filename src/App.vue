<template>
  <div class="app-shell">
    <AppHeader v-if="!isMapRoute" @toggle-theme="toggleTheme" @toggle-lang="toggleLang" :theme="theme" />
    <main class="page-content" :class="{ 'page-content--map': isMapRoute }">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <BottomNav v-if="!isMapRoute" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const { locale } = useI18n()
const transitionName = ref('slide-left')
const isMapRoute = computed(() => route.path === '/map')

const routeOrder = { '/': 0, '/info': 1, '/schedule': 2, '/map': 3 }

watch(() => route.path, (to, from) => {
  const toIdx = routeOrder[to] ?? 0
  const fromIdx = routeOrder[from] ?? 0
  transitionName.value = toIdx >= fromIdx ? 'slide-left' : 'slide-right'
})

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('loveU_theme')
    if (saved) return saved
  } catch { /* ignore */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const theme = ref(getInitialTheme())

function applyTheme(value) {
  document.documentElement.setAttribute('data-theme', value)
  document.body.setAttribute('data-theme', value)
}

watch(theme, value => {
  applyTheme(value)
  try { localStorage.setItem('loveU_theme', value) } catch { /* ignore */ }
}, { immediate: true })

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

function toggleLang() {
  locale.value = locale.value === 'nl' ? 'en' : 'nl'
  try { localStorage.setItem('loveU_lang', locale.value) } catch { /* ignore */ }
  document.documentElement.lang = locale.value
}
</script>
