<template>
  <div :data-theme="theme">
    <AppHeader @toggle-theme="toggleTheme" @toggle-lang="toggleLang" :theme="theme" />
    <main class="page-content">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const { locale } = useI18n()
const transitionName = ref('slide-left')

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

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  try { localStorage.setItem('loveU_theme', theme.value) } catch { /* ignore */ }
}

function toggleLang() {
  locale.value = locale.value === 'nl' ? 'en' : 'nl'
  try { localStorage.setItem('loveU_lang', locale.value) } catch { /* ignore */ }
  document.documentElement.lang = locale.value
}
</script>
