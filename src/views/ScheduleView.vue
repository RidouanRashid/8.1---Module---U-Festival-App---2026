<template>
  <div class="schedule-view">
    <h1 class="page-title">{{ $t('schedule.title') }}</h1>

    <!-- Day selector -->
    <div class="day-selector">
      <button
        class="day-btn btn"
        :class="selectedDay === 'saturday' ? 'btn-accent' : 'btn-outline'"
        @click="selectedDay = 'saturday'"
      >
        {{ $t('schedule.saturday') }}
      </button>
      <button
        class="day-btn btn"
        :class="selectedDay === 'sunday' ? 'btn-accent' : 'btn-outline'"
        @click="selectedDay = 'sunday'"
      >
        {{ $t('schedule.sunday') }}
      </button>
    </div>

    <!-- Filter toggle -->
    <div class="filter-toggle">
      <button
        class="filter-btn btn"
        :class="showFavorites ? 'btn-accent' : 'btn-outline'"
        @click="showFavorites = !showFavorites"
      >
        <span>❤️</span>
        {{ showFavorites ? $t('schedule.allActs') : $t('schedule.favorites') }}
      </button>
    </div>

    <!-- No favorites message -->
    <p v-if="showFavorites && !hasFavoritesInDay" class="no-favorites">
      {{ $t('schedule.noFavorites') }}
    </p>

    <!-- Schedule grid -->
    <div v-show="!showFavorites || hasFavoritesInDay" class="schedule-container">
      <div class="schedule-grid" ref="gridRef">
        <!-- Time header row -->
        <div class="time-header-row">
          <div class="stage-label-spacer"></div>
          <div class="time-slots">
            <div
              v-for="slot in timeSlots"
              :key="slot"
              class="time-slot"
              :style="{ width: slotWidth + 'px' }"
            >
              {{ slot }}
            </div>
          </div>
        </div>

        <!-- Stage rows -->
        <div
          v-for="stage in currentStages"
          :key="stage.id"
          class="stage-row"
        >
          <div class="stage-label" :style="{ color: stageColor(stage.id) }">
            {{ stage.name }}
          </div>
          <div class="acts-track">
            <div
              v-for="act in filteredActs(stage)"
              :key="act.id"
              class="act-block"
              :style="actStyle(act, stage.id)"
              @click="openAct(act, stage)"
              :title="act.artist"
              role="button"
              tabindex="0"
              @keydown.enter="openAct(act, stage)"
            >
              <button
                class="act-fav-btn"
                @click.stop="handleFavToggle(act, stage)"
                :aria-label="'Toggle favorite ' + act.artist"
              >
                <span class="act-fav-heart" :class="{ active: isFavorite(act.id) }">
                  {{ isFavorite(act.id) ? '❤️' : '🤍' }}
                </span>
              </button>
              <span class="act-artist">{{ act.artist }}</span>
              <span class="act-time">{{ act.start }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Act modal -->
    <ActModal
      :act="selectedAct"
      :stage-name="selectedStageName"
      :stage-color="selectedStageColor"
      @close="selectedAct = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFavorites } from '../composables/useFavorites.js'
import { useNotifications } from '../composables/useNotifications.js'
import scheduleData from '../assets/data/schedule.json'
import ActModal from '../components/ActModal.vue'

const { t } = useI18n()
const { isFavorite, toggleFavorite } = useFavorites()
const { requestPermission, scheduleNotification, cancelNotifications } = useNotifications()

const selectedDay = ref('saturday')
const showFavorites = ref(false)
const selectedAct = ref(null)
const selectedStageName = ref('')
const selectedStageColor = ref('')
const gridRef = ref(null)

const SLOT_WIDTH = 30 // px per 15 minutes
const START_HOUR = 10
const END_HOUR = 24 // 23:45 rounded up

const stageColors = {
  'poton': '#F03228',
  'the-lake': '#247BA0',
  'the-club': '#E3B505',
  'hanggar': '#555555'
}

// Generate time slots from 10:00 to 23:45
const timeSlots = computed(() => {
  const slots = []
  for (let h = START_HOUR; h < END_HOUR; h++) {
    slots.push(`${h}:00`)
  }
  return slots
})

const slotWidth = SLOT_WIDTH * 4 // 4 slots of 15min = 1 hour

const currentDay = computed(() => scheduleData[selectedDay.value])
const currentStages = computed(() => currentDay.value?.stages || [])

const hasFavoritesInDay = computed(() => {
  return currentStages.value.some(stage =>
    stage.acts.some(act => isFavorite(act.id))
  )
})

function stageColor(stageId) {
  return stageColors[stageId] || '#555'
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function actStyle(act, stageId) {
  const startMin = timeToMinutes(act.start) - START_HOUR * 60
  const endMin = timeToMinutes(act.end) - START_HOUR * 60
  const duration = endMin - startMin
  const left = (startMin / 15) * SLOT_WIDTH
  const width = (duration / 15) * SLOT_WIDTH

  return {
    left: left + 'px',
    width: Math.max(width - 2, SLOT_WIDTH) + 'px',
    backgroundColor: stageColors[stageId] || '#555'
  }
}

function filteredActs(stage) {
  if (!showFavorites.value) return stage.acts
  return stage.acts.filter(act => isFavorite(act.id))
}

function openAct(act, stage) {
  selectedAct.value = act
  selectedStageName.value = stage.name
  selectedStageColor.value = stageColors[stage.id] || '#555'
}

async function handleFavToggle(act, stage) {
  const wasFav = isFavorite(act.id)
  toggleFavorite(act.id)

  if (!wasFav) {
    const granted = await requestPermission()
    if (granted) {
      scheduleNotification(act, stage.name, currentDay.value.date)
    }
  } else {
    cancelNotifications(act.id)
  }
}

onMounted(async () => {
  await requestPermission()
})
</script>

<style scoped>
.schedule-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.page-title {
  margin-bottom: calc(var(--spacing) * 2);
}

.day-selector {
  display: flex;
  gap: var(--spacing);
  margin-bottom: calc(var(--spacing) * 2);
}

.day-btn {
  flex: 1;
}

.filter-toggle {
  margin-bottom: calc(var(--spacing) * 2);
}

.filter-btn {
  width: 100%;
}

.no-favorites {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 2);
}

/* Schedule grid */
.schedule-container {
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  -webkit-overflow-scrolling: touch;
}

.schedule-grid {
  position: relative;
  min-width: max-content;
}

.time-header-row {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-base);
  border-bottom: 1px solid var(--color-border);
}

.stage-label-spacer {
  width: 80px;
  min-width: 80px;
  flex-shrink: 0;
}

.time-slots {
  display: flex;
}

.time-slot {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-align: left;
  padding: calc(var(--spacing)) 0;
  padding-left: 4px;
  border-left: 1px solid var(--color-border);
  flex-shrink: 0;
}

.stage-row {
  display: flex;
  min-height: 60px;
  border-bottom: 1px solid var(--color-border);
}

.stage-row:last-child {
  border-bottom: none;
}

.stage-label {
  width: 80px;
  min-width: 80px;
  flex-shrink: 0;
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  padding: 0 var(--spacing);
  position: sticky;
  left: 0;
  z-index: 5;
  background: var(--color-base);
  border-right: 1px solid var(--color-border);
}

.acts-track {
  position: relative;
  flex: 1;
  min-height: 60px;
  /* Total width: 14 hours * 4 slots * SLOT_WIDTH */
  width: 1680px;
}

.act-block {
  position: absolute;
  top: 4px;
  bottom: 4px;
  border-radius: calc(var(--radius) / 2);
  padding: 4px 6px;
  color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  animation: blockFadeIn 0.4s ease backwards;
}

.act-block:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 2;
}

.act-block:active {
  transform: scale(0.98);
}

@keyframes blockFadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.act-fav-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 24px;
  height: 24px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  z-index: 1;
}

.act-fav-heart.active {
  animation: heartBounce 0.4s ease;
}

@keyframes heartBounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.4); }
  60% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.act-artist {
  font-weight: 700;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 24px;
}

.act-time {
  font-size: 0.6rem;
  opacity: 0.8;
}
</style>
