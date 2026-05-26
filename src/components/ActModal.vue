<template>
  <Teleport to="body">
    <transition name="modal">
      <div v-if="act" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-sheet" role="dialog" aria-modal="true">
          <div class="modal-handle"></div>

          <button class="modal-close" @click="$emit('close')" aria-label="Close">
            <span class="material-icons">close</span>
          </button>

          <div class="modal-body">
            <div class="artist-avatar" :style="{ background: stageColor }">
              <img
                v-if="artistImage"
                :src="artistImage"
                :alt="act.artist"
                class="artist-photo"
                loading="lazy"
              />
              <span v-else class="avatar-initials">{{ initials }}</span>
            </div>

            <h2 class="artist-name">{{ act.artist }}</h2>

            <div class="act-meta">
              <div class="meta-item">
                <span class="material-icons meta-icon">location_on</span>
                <span>{{ stageName }}</span>
              </div>
              <div class="meta-item">
                <span class="material-icons meta-icon">schedule</span>
                <span>{{ act.start }} – {{ act.end }}</span>
              </div>
              <div class="meta-item">
                <span class="material-icons meta-icon">music_note</span>
                <span>{{ act.genre }}</span>
              </div>
            </div>

            <button
              class="fav-btn btn"
              :class="isFav ? 'btn-accent' : 'btn-outline'"
              @click="toggleFav"
            >
              <span class="fav-heart" :class="{ active: isFav }">❤️</span>
              <span>{{ isFav ? $t('schedule.removeFav') : $t('schedule.addFav') }}</span>
            </button>

            <p v-if="actDetail" class="artist-desc">{{ description }}</p>

            <div v-if="youtubeId" class="youtube-embed">
              <iframe
                :src="'https://www.youtube.com/embed/' + youtubeId"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                loading="lazy"
                :title="act.artist + ' video'"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFavorites } from '../composables/useFavorites.js'
import { apiFetch } from '../composables/useApi.js'
import { artistImages } from '../assets/data/media.js'

const props = defineProps({
  act: Object,
  stageName: String,
  stageColor: String
})

defineEmits(['close'])

const { locale } = useI18n()
const { isFavorite, toggleFavorite } = useFavorites()

const isFav = computed(() => props.act && isFavorite(props.act.id))

function toggleFav() {
  if (props.act) toggleFavorite(props.act.id)
}

const initials = computed(() => {
  if (!props.act) return ''
  return props.act.artist
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const actDetail = ref(null)

watch(
  () => props.act,
  async act => {
    actDetail.value = act ? await apiFetch(`acts.php?id=${act.id}`).catch(() => null) : null
  },
  { immediate: true }
)

const description = computed(() => {
  if (!actDetail.value) return ''
  return locale.value === 'en'
    ? actDetail.value.description_en
    : actDetail.value.description_nl
})

const youtubeId = computed(() => {
  if (!actDetail.value || !actDetail.value.youtube) return null
  // Supports: youtube.com/watch?v=ID  youtube.com/embed/ID  youtu.be/ID
  const match = actDetail.value.youtube.match(/(?:[?&]v=|youtu\.be\/|embed\/)([^&?#\s]+)/)
  return match ? match[1] : null
})

const artistImage = computed(() => {
  if (!props.act) return null
  return artistImages[props.act.id] || null
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-sheet {
  background: var(--color-base);
  border-radius: calc(var(--radius) * 2) calc(var(--radius) * 2) 0 0;
  width: 100%;
  max-width: 430px;
  max-height: 85dvh;
  overflow-y: auto;
  position: relative;
  padding-bottom: var(--safe-bottom);
}

.modal-handle {
  width: 40px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  margin: calc(var(--spacing)) auto calc(var(--spacing) * 2);
}

.modal-close {
  position: absolute;
  top: calc(var(--spacing));
  right: calc(var(--spacing));
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background: var(--color-surface);
}

.modal-body {
  padding: 0 calc(var(--spacing) * 3) calc(var(--spacing) * 3);
  text-align: center;
}

.artist-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto calc(var(--spacing) * 2);
  animation: avatarPop 0.3s ease;
  overflow: hidden;
}

.artist-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes avatarPop {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}

.avatar-initials {
  color: #fff;
  font-weight: 700;
  font-size: 1.5rem;
}

.artist-name {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: calc(var(--spacing) * 2);
}

.act-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing);
  margin-bottom: calc(var(--spacing) * 2);
}

.meta-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing);
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.meta-icon {
  font-size: 18px;
  color: var(--color-secondary);
}

.fav-btn {
  margin-bottom: calc(var(--spacing) * 2);
}

.fav-heart {
  font-style: normal;
  transition: transform 0.3s ease;
}

.fav-heart.active {
  animation: heartBounce 0.4s ease;
}

.artist-desc {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text-muted);
  text-align: left;
  margin-bottom: calc(var(--spacing) * 2);
}

.youtube-embed {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: var(--radius);
}

.youtube-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Transition */
.modal-enter-active {
  transition: opacity 0.3s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-sheet {
  animation: slideUp 0.3s ease;
}
.modal-leave-active .modal-sheet {
  animation: slideDown 0.2s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
@keyframes slideDown {
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
}
</style>
