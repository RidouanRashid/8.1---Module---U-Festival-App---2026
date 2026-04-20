<template>
  <nav class="bottom-nav" role="navigation" :aria-label="$t('nav.home')">
    <router-link
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="nav-item"
      :class="{ active: $route.path === item.to }"
      :aria-label="$t(item.label)"
    >
      <span class="material-icons nav-icon">{{ item.icon }}</span>
      <span class="nav-label">{{ $t(item.label) }}</span>
    </router-link>
  </nav>
</template>

<script setup>
const navItems = [
  { to: '/', icon: 'home', label: 'nav.home' },
  { to: '/info', icon: 'info', label: 'nav.info' },
  { to: '/schedule', icon: 'calendar_month', label: 'nav.schedule' },
  { to: '/map', icon: 'map', label: 'nav.map' }
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  padding-bottom: var(--safe-bottom);
  background: var(--color-base);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 44px;
  min-height: 44px;
  padding: calc(var(--spacing)) calc(var(--spacing) * 2);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.nav-item.active {
  color: var(--color-accent);
}

.nav-item:active {
  transform: scale(0.97);
}

.nav-icon {
  font-size: 24px;
}

.nav-label {
  font-family: 'Sansation', sans-serif;
  font-weight: 300;
  font-style: italic;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
