<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-content">
        <p class="hero-welcome">{{ $t('home.welcome') }}</p>
        <h1 class="hero-title">{{ $t('home.festivalName') }}</h1>
        <p class="hero-dates">{{ $t('home.dates') }}</p>
        <p class="hero-location">{{ $t('home.location') }}</p>
        <div class="hero-status" :class="statusClass">
          <span class="material-icons status-icon">{{ statusIcon }}</span>
          <span>{{ statusText }}</span>
        </div>
      </div>
    </section>

    <section class="news-section">
      <h2 class="section-title">{{ $t('home.news') }}</h2>
      <article v-for="item in newsItems" :key="item.id" class="news-card card">
        <div class="news-card-accent"></div>
        <div class="news-card-body">
          <h3 class="news-title">{{ item.title }}</h3>
          <p class="news-text">{{ item.text }}</p>
          <time class="news-time" :datetime="item.timestamp">{{ formatDate(item.timestamp) }}</time>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import newsData from '../assets/data/news.json'

const { locale, t } = useI18n()

const newsItems = computed(() => {
  const items = newsData[locale.value] || newsData.nl
  return [...items].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

const festivalStart = new Date('2026-08-15T10:00:00')
const festivalEnd = new Date('2026-08-16T23:45:00')

const statusClass = computed(() => {
  const now = new Date()
  if (now >= festivalStart && now <= festivalEnd) return 'status-live'
  if (now < festivalStart) return 'status-upcoming'
  return 'status-ended'
})

const statusIcon = computed(() => {
  const now = new Date()
  if (now >= festivalStart && now <= festivalEnd) return 'celebration'
  if (now < festivalStart) return 'event'
  return 'event_busy'
})

const statusText = computed(() => {
  const now = new Date()
  if (now >= festivalStart && now <= festivalEnd) return t('home.liveNow')
  if (now < festivalStart) return t('home.notStarted')
  return t('home.ended')
})

function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString(locale.value === 'nl' ? 'nl-NL' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.home-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hero {
  background: var(--color-primary);
  color: var(--color-base);
  border-radius: var(--radius);
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 3);
  margin-bottom: calc(var(--spacing) * 3);
  text-align: center;
}

.hero-welcome {
  font-weight: 300;
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: var(--spacing);
}

.hero-title {
  color: var(--color-accent);
  font-size: 2rem;
  margin-bottom: var(--spacing);
}

.hero-dates {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: calc(var(--spacing) / 2);
}

.hero-location {
  font-size: 0.85rem;
  opacity: 0.7;
  margin-bottom: calc(var(--spacing) * 2);
}

.hero-status {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing);
  padding: calc(var(--spacing)) calc(var(--spacing) * 2);
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 0.85rem;
}

.status-live {
  background: var(--color-accent);
  color: #fff;
  animation: pulse 2s infinite;
}

.status-upcoming {
  background: var(--color-info);
  color: #000;
}

.status-ended {
  background: var(--color-neutral);
  color: #fff;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.status-icon {
  font-size: 18px;
}

.section-title {
  margin-bottom: calc(var(--spacing) * 2);
}

.news-card {
  display: flex;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.news-card-accent {
  width: 4px;
  min-height: 100%;
  background: var(--color-accent);
  flex-shrink: 0;
}

.news-card-body {
  padding: calc(var(--spacing) * 2);
  flex: 1;
}

.news-title {
  font-size: 1rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing);
}

.news-text {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.news-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-style: italic;
}
</style>
