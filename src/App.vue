<template>
  <div class="app-shell" :data-theme="theme">
    <AppHeader
      v-if="!isMapRoute"
      :theme="theme"
      :install-available="canInstall"
      @toggle-theme="toggleTheme"
      @toggle-lang="toggleLang"
      @install-app="installApp"
    />
    <main class="page-content" :class="{ 'page-content--map': isMapRoute }">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <BottomNav v-if="!isMapRoute" />

    <!-- PWA install banner -->
    <transition name="install-slide">
      <div v-if="showInstallBanner" class="install-banner" role="dialog" aria-label="App installeren">
        <div class="install-banner-icon">
          <span class="material-icons">download_for_offline</span>
        </div>
        <div class="install-banner-text">
          <strong>❤️U Festival</strong>
          <span>Installeer de app voor offline gebruik</span>
        </div>
        <button class="install-banner-btn" @click="triggerInstall">Installeer</button>
        <button class="install-banner-close" aria-label="Sluiten" @click="dismissBanner">
          <span class="material-icons">close</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from './components/AppHeader.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const { locale } = useI18n()
const transitionName = ref('slide-left')
const isMapRoute = computed(() => route.path === '/map')
const canInstall = ref(false)
const installEvent = ref(null)
const showInstallBanner = ref(false)
let installTimer = null

const routeOrder = { '/': 0, '/info': 1, '/schedule': 2, '/map': 3 }

watch(() => route.path, (to, from) => {
  const toIdx = routeOrder[to] ?? 0
  const fromIdx = routeOrder[from] ?? 0
  transitionName.value = toIdx >= fromIdx ? 'slide-left' : 'slide-right'
})

function handleBeforeInstallPrompt(event) {
  event.preventDefault()
  installEvent.value = event
  canInstall.value = true
  // Show banner after 3 seconds unless user already dismissed it
  try {
    if (localStorage.getItem('loveU_install_dismissed')) return
  } catch { /* ignore */ }
  installTimer = setTimeout(() => { showInstallBanner.value = true }, 3000)
}

function handleAppInstalled() {
  canInstall.value = false
  installEvent.value = null
  showInstallBanner.value = false
  clearTimeout(installTimer)
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
  clearTimeout(installTimer)
})

function dismissBanner() {
  showInstallBanner.value = false
  try { localStorage.setItem('loveU_install_dismissed', '1') } catch { /* ignore */ }
}

async function triggerInstall() {
  showInstallBanner.value = false
  await installApp()
}

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

async function installApp() {
  if (!installEvent.value) return
  installEvent.value.prompt()
  await installEvent.value.userChoice
  installEvent.value = null
  canInstall.value = false
}
</script>

<style>
.install-banner {
  position: fixed;
  bottom: calc(var(--bottom-nav-height, 64px) + var(--safe-bottom, 0px) + 12px);
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 16px;
  padding: 12px 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  z-index: 200;
}

.install-banner-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--color-accent, #e91e63);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.install-banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.85rem;
  line-height: 1.3;
  color: var(--color-text, #111);
  min-width: 0;
}

.install-banner-text strong {
  font-size: 0.95rem;
}

.install-banner-btn {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--color-accent, #e91e63);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.install-banner-close {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text-muted, #888);
}

.install-slide-enter-active,
.install-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.install-slide-enter-from,
.install-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
