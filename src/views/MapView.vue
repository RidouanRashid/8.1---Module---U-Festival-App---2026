<template>
  <section
    ref="viewport"
    class="map-view"
    aria-label="Festival kaart"
    @wheel.prevent="onWheel"
    @mousedown.prevent="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onPointerUp"
    @mouseleave="onPointerUp"
    @touchstart.passive="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
    @dblclick.prevent="onDoubleClick"
  >
    <div class="map-canvas" :style="canvasStyle">
      <img
        :src="mapImageUrl"
        class="map-image"
        :style="mapImageStyle"
        alt="Festival kaart"
        draggable="false"
        @load="updateImageRect"
      />

      <button
        v-for="marker in mapStore.markers"
        :key="marker.id"
        class="marker-btn"
        :class="[markerButtonClass(marker), { active: selectedMarker?.id === marker.id }]"
        :style="markerStyle(marker)"
        :aria-label="'Open info: ' + markerLabel(marker)"
        @click.stop="selectMarker(marker)"
        @mousedown.stop
        @touchstart.stop
      >
        <img
          :src="marker.icon"
          :alt="marker.name"
          :class="marker.markerType === 'stage' ? 'stage-pin' : 'facility-pin'"
        />
      </button>

      <div
        v-if="liveCoord"
        :class="['live-dot', atFestival ? '' : 'live-dot--away']"
        :style="coordStyle(liveCoord.lat, liveCoord.lng)"
        :aria-label="atFestival ? 'Uw locatie' : 'GPS actief'"
      />
    </div>

    <!-- Zoom controls -->
    <div class="map-controls" @mousedown.stop @touchstart.stop>
      <button class="map-btn map-btn--icon" aria-label="Naar home" @click="goHome">
        <span class="material-icons">home</span>
      </button>
      <button class="map-btn" aria-label="Inzoomen" @click="zoomIn">+</button>
      <button class="map-btn" aria-label="Uitzoomen" @click="zoomOut">−</button>
      <button class="map-btn map-btn--icon" aria-label="Kaart terugzetten" @click="resetView">
        <span class="material-icons">center_focus_strong</span>
      </button>
    </div>

    <!-- GPS status chip -->
    <div v-if="gpsStatus" class="gps-chip" :class="gpsStatus.cls" aria-live="polite">
      {{ gpsStatus.label }}
    </div>

    <aside v-if="selectedMarker" class="marker-panel" @mousedown.stop @touchstart.stop>
      <div class="marker-panel-head">
        <h3>{{ markerLabel(selectedMarker) }}</h3>
        <button class="marker-close" aria-label="Close marker info" @click="selectedMarker = null">
          <span class="material-icons">close</span>
        </button>
      </div>

      <p class="marker-type">{{ selectedMarker.markerType === 'stage' ? 'Stage' : 'Faciliteit' }}</p>

      <template v-if="selectedMarker.markerType === 'stage'">
        <div class="day-switch">
          <button
            class="day-btn"
            :class="{ active: selectedDay === 'saturday' }"
            @click="selectedDay = 'saturday'"
          >
            Za
          </button>
          <button
            class="day-btn"
            :class="{ active: selectedDay === 'sunday' }"
            @click="selectedDay = 'sunday'"
          >
            Zo
          </button>
        </div>

        <ul v-if="selectedStageActs.length" class="acts-list">
          <li v-for="act in selectedStageActs" :key="act.id + selectedDay">
            <strong>{{ act.artist }}</strong>
            <span>{{ act.start }} - {{ act.end }} · {{ act.genre }}</span>
          </li>
        </ul>
        <p v-else class="no-acts">Geen acts gevonden voor dit podium.</p>
      </template>

      <p v-else class="facility-text">{{ facilityDescription(selectedMarker.name) }}</p>
    </aside>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '../composables/useMapStore.js'
import { apiFetch } from '../composables/useApi.js'

// ── Festival SVG map image ──────────────────────────────────────────────────
const mapImageUrl = new URL('../../pictures/kaart_festival_no_markers.svg', import.meta.url).href

const mapStore = useMapStore()
const router = useRouter()
const bounds   = mapStore.bounds   // { top, bottom, left, right } in lat/lng
const selectedMarker = ref(null)
const selectedDay = ref('saturday')
const scheduleData = ref({})

const MARKER_OFFSET_PCT = {
  default_stage: { x: 0.000, y: 0.000 },
  default_facility: { x: 0.000, y: 0.000 },
}

// ── DOM ref + image rect ────────────────────────────────────────────────────
const viewport  = ref(null)
// Rendered rect of the SVG image inside the canvas (accounts for letterboxing)
const imageRect = ref({ x: 0, y: 0, w: 0, h: 0 })
const SVG_ASPECT = 2330.58 / 1353.19
const ROTATED_ASPECT = 1 / SVG_ASPECT

const mapImageStyle = computed(() => {
  const frame = imageRect.value
  const width = frame.h
  const height = frame.w

  return {
    left: `${frame.x + (frame.w - width) / 2}px`,
    top: `${frame.y + (frame.h - height) / 2}px`,
    width: `${width}px`,
    height: `${height}px`,
  }
})

function updateImageRect() {
  if (!viewport.value) return
  const cW = viewport.value.clientWidth
  const cH = viewport.value.clientHeight

  // Cover the full viewport with the rotated map so the whole background is map.
  if (cW / cH > ROTATED_ASPECT) {
    const w = cW
    const h = w / ROTATED_ASPECT
    imageRect.value = { x: 0, y: (cH - h) / 2, w, h }
  } else {
    const h = cH
    const w = h * ROTATED_ASPECT
    imageRect.value = { x: (cW - w) / 2, y: 0, w, h }
  }
}

// ── Coordinate → CSS pixel position (inside canvas) ───────────────────────
function markerOffset(marker, rect) {
  if (!marker || !rect?.w || !rect?.h) return { x: 0, y: 0 }

  const key = normalizeName(marker.name)
  const base = marker.markerType === 'stage'
    ? MARKER_OFFSET_PCT.default_stage
    : MARKER_OFFSET_PCT.default_facility
  const tweak = MARKER_OFFSET_PCT[key] || { x: 0, y: 0 }

  return {
    x: (base.x + tweak.x) * rect.w,
    y: (base.y + tweak.y) * rect.h,
  }
}

function coordStyle(lat, lng, marker = null) {
  const r = imageRect.value
  if (!r.w) return { display: 'none' }

  const normX = marker?.mapPos?.x ?? ((lng - bounds.left) / (bounds.right - bounds.left))
  const normY = marker?.mapPos?.y ?? ((bounds.top - lat) / (bounds.top - bounds.bottom))

  // Keep map rotated 90deg clockwise and map marker coordinates accordingly.
  const rotX = normY
  const rotY = 1 - normX

  const offset = markerOffset(marker, r)
  const px = r.x + rotX * r.w + offset.x
  const py = r.y + rotY * r.h + offset.y
  return { left: `${px}px`, top: `${py}px` }
}

function markerStyle(marker) {
  return {
    ...coordStyle(marker.lat, marker.lng, marker),
    zIndex: marker.markerType === 'stage' ? 25 : 15,
  }
}

function markerButtonClass(marker) {
  return marker.markerType === 'stage' ? 'marker-btn--stage' : 'marker-btn--facility'
}

function normalizeName(name) {
  return String(name || '').toLowerCase().trim().replace(/\s+/g, '-')
}

function markerLabel(marker) {
  if (marker.markerType === 'stage') return `${marker.name} stage`
  return marker.name.replace(/_/g, ' ')
}

function facilityDescription(type) {
  const labels = {
    bar: 'Hier kun je drankjes halen.',
    entrance_exit: 'In- en uitgang van het festivalterrein.',
    first_aid: 'EHBO post voor medische hulp.',
    food: 'Food area met verschillende stands.',
    ice_cream: 'IJsverkoop punt.',
    locker: 'Lockers om je spullen veilig op te bergen.',
    merchandise: 'Festival merchandise shop.',
    toilet: 'Toiletvoorziening.',
  }
  return labels[type] || 'Faciliteit op het festivalterrein.'
}

function selectMarker(marker) {
  selectedMarker.value = marker
}

const selectedStageActs = computed(() => {
  if (!selectedMarker.value || selectedMarker.value.markerType !== 'stage') return []

  const day = scheduleData.value?.[selectedDay.value]
  if (!day?.stages) return []

  const markerKey = normalizeName(selectedMarker.value.name)
  const stage = day.stages.find(s => {
    const stageName = normalizeName(s.name)
    const stageId = normalizeName(s.id)
    return stageName === markerKey || stageId === markerKey
  })

  return stage?.acts || []
})

// ── Pan / zoom state ────────────────────────────────────────────────────────
const scale = ref(1)
const tx    = ref(0)
const ty    = ref(0)
const minScale = ref(1)
const MAX_SCALE = 8

const canvasStyle = computed(() => ({
  transform:        `translate(${tx.value}px, ${ty.value}px) scale(${scale.value})`,
  transformOrigin:  '0 0',
}))

function clamp() {
  if (!viewport.value) return
  const w = viewport.value.clientWidth
  const h = viewport.value.clientHeight
  tx.value = Math.min(0, Math.max(tx.value, w * (1 - scale.value)))
  ty.value = Math.min(0, Math.max(ty.value, h * (1 - scale.value)))
}

function zoomAtPoint(newScale, cx, cy) {
  const safeScale = Math.min(MAX_SCALE, Math.max(minScale.value, newScale))
  const ratio = safeScale / scale.value
  tx.value = cx - ratio * (cx - tx.value)
  ty.value = cy - ratio * (cy - ty.value)
  scale.value = safeScale
  clamp()
}

function applyDefaultView() {
  minScale.value = 1
  scale.value = minScale.value
  tx.value = 0
  ty.value = 0
  clamp()
}

// ── Mouse wheel zoom ────────────────────────────────────────────────────────
function onWheel(e) {
  const rect   = viewport.value.getBoundingClientRect()
  const cx     = e.clientX - rect.left
  const cy     = e.clientY - rect.top
  const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18
  zoomAtPoint(scale.value * factor, cx, cy)
}

function onDoubleClick(e) {
  const rect   = viewport.value.getBoundingClientRect()
  const cx     = e.clientX - rect.left
  const cy     = e.clientY - rect.top
  zoomAtPoint(scale.value * 1.35, cx, cy)
}

// ── Mouse drag ──────────────────────────────────────────────────────────────
let dragging = false
let lastX    = 0
let lastY    = 0

function onMouseDown(e) { dragging = true; lastX = e.clientX; lastY = e.clientY }

function onMouseMove(e) {
  if (!dragging) return
  tx.value += e.clientX - lastX
  ty.value += e.clientY - lastY
  lastX = e.clientX
  lastY = e.clientY
  clamp()
}

function onPointerUp() { dragging = false }

// ── Touch: pan + pinch-to-zoom ──────────────────────────────────────────────
let activeTouches = []
let lastTouchDist = 0
let lastMidX      = 0
let lastMidY      = 0

function touchDist(a, b) {
  const dx = a.clientX - b.clientX
  const dy = a.clientY - b.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function onTouchStart(e) {
  activeTouches = Array.from(e.touches)
  if (activeTouches.length === 2) {
    lastTouchDist = touchDist(activeTouches[0], activeTouches[1])
    lastMidX = (activeTouches[0].clientX + activeTouches[1].clientX) / 2
    lastMidY = (activeTouches[0].clientY + activeTouches[1].clientY) / 2
  } else {
    lastX = activeTouches[0].clientX
    lastY = activeTouches[0].clientY
  }
}

function onTouchMove(e) {
  const t = Array.from(e.touches)
  if (t.length === 2 && activeTouches.length === 2) {
    const dist  = touchDist(t[0], t[1])
    const midX  = (t[0].clientX + t[1].clientX) / 2
    const midY  = (t[0].clientY + t[1].clientY) / 2
    const rect  = viewport.value.getBoundingClientRect()
    const cx    = midX - rect.left
    const cy    = midY - rect.top
    zoomAtPoint(scale.value * (dist / lastTouchDist), cx, cy)
    tx.value += (midX - lastMidX)
    ty.value += (midY - lastMidY)
    lastTouchDist = dist
    lastMidX = midX
    lastMidY = midY
    clamp()
  } else if (t.length === 1) {
    tx.value += t[0].clientX - lastX
    ty.value += t[0].clientY - lastY
    lastX = t[0].clientX
    lastY = t[0].clientY
    clamp()
  }
  activeTouches = t
}

function onTouchEnd(e) { activeTouches = Array.from(e.touches) }

// ── Zoom button helpers ─────────────────────────────────────────────────────
function zoomStep(factor) {
  if (!viewport.value) return
  const cx = viewport.value.clientWidth  / 2
  const cy = viewport.value.clientHeight / 2
  zoomAtPoint(scale.value * factor, cx, cy)
}

function zoomIn()    { zoomStep(1.3) }
function zoomOut()   { zoomStep(1 / 1.3) }
function resetView() { applyDefaultView() }
function goHome()    { router.push('/') }

// ── Live GPS location ───────────────────────────────────────────────────────
const liveCoord  = ref(null)   // always set when GPS fires
const atFestival = ref(false)  // true only when physically on festival grounds
const gpsStatus  = ref(null)
let watchId = null

// Festival centre in the SVG coordinate system — used as dot anchor when
// the user is away so the dot is always visible on the map.
const FEST_LAT = (bounds.top + bounds.bottom) / 2
const FEST_LNG = (bounds.left  + bounds.right)  / 2

function startLocation() {
  if (!('geolocation' in navigator)) {
    gpsStatus.value = null
    return
  }
  watchId = navigator.geolocation.watchPosition(
    ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords
      const inBounds =
        lat >= bounds.bottom && lat <= bounds.top &&
        lng >= bounds.left   && lng <= bounds.right
      atFestival.value = inBounds
      // When at festival → exact position; when away → pin at festival centre
      liveCoord.value  = inBounds ? { lat, lng } : { lat: FEST_LAT, lng: FEST_LNG }
      gpsStatus.value  = inBounds ? { label: '📍 Jouw locatie', cls: 'gps-on' } : null
    },
    () => {
      // Still show dot at festival centre even when permission is denied
      liveCoord.value  = { lat: FEST_LAT, lng: FEST_LNG }
      atFestival.value = false
      gpsStatus.value  = null
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
  )
}

// ── Lifecycle ───────────────────────────────────────────────────────────────
let resizeObserver = null

onMounted(() => {
  updateImageRect()
  resizeObserver = new ResizeObserver(updateImageRect)
  resizeObserver.observe(viewport.value)
  applyDefaultView()
  startLocation()
  apiFetch('schedule.php')
    .then(data => { scheduleData.value = data || {} })
    .catch(() => { scheduleData.value = {} })
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
})
</script>

<style scoped>
.map-view {
  position: relative;
  --map-ui-pad: 10px;
  --map-btn-size: 48px;
  --map-btn-radius: 14px;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  background: #1a1a1a;
}

.map-view:active { cursor: grabbing; }

.map-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.map-image {
  position: absolute;
  object-fit: cover;
  display: block;
  pointer-events: none;
  transform: rotate(90deg);
  transform-origin: 50% 50%;
}

.marker-btn {
  position: absolute;
  background: transparent;
  border: none;
  padding: 0;
  line-height: 0;
  cursor: pointer;
}

.marker-btn--stage,
.marker-btn--facility {
  transform: translate(-50%, -50%);
}

.stage-pin,
.facility-pin {
  height: 36px;
  width: auto;
  pointer-events: none;
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.5));
  transition: transform 0.15s ease;
}

.stage-pin {
  height: 44px;
}

.marker-btn.active .stage-pin,
.marker-btn.active .facility-pin,
.marker-btn:hover .stage-pin,
.marker-btn:hover .facility-pin {
  transform: scale(1.08);
}

/* ── Zoom controls ─────────────────────────────────────── */
.map-controls {
  position: absolute;
  right: var(--map-ui-pad);
  bottom: var(--map-ui-pad);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.map-btn {
  width: var(--map-btn-size);
  height: var(--map-btn-size);
  border-radius: var(--map-btn-radius);
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(14, 14, 14, 0.78);
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s ease, opacity 0.1s ease;
}

.map-btn:active {
  transform: scale(0.92);
  opacity: 0.85;
}

.map-btn--icon .material-icons {
  font-size: 22px;
}

/* ── GPS chip ──────────────────────────────────────────── */
.gps-chip {
  position: absolute;
  top: var(--map-ui-pad);
  left: var(--map-ui-pad);
  right: calc(var(--map-btn-size) + (var(--map-ui-pad) * 2) + 8px);
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  pointer-events: none;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  text-align: left;
}

.gps-on   { background: rgba(44, 155, 255, 0.85); color: #fff; }
.gps-away { background: rgba(0, 0, 0, 0.55);      color: #fff; }
.gps-off  { background: rgba(180, 0, 0, 0.65);    color: #fff; }

/* ── Live location dot ─────────────────────────────────── */
.live-dot {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #2c9bff;
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 5px rgba(44, 155, 255, 0.28);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 20;
  animation: pulse 2s ease-in-out infinite;
}

.live-dot--away {
  background: rgba(44, 155, 255, 0.45);
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 5px rgba(44, 155, 255, 0.22);
}

.marker-panel {
  position: absolute;
  left: var(--map-ui-pad);
  right: calc(var(--map-btn-size) + (var(--map-ui-pad) * 2) + 8px);
  bottom: var(--map-ui-pad);
  max-height: 44vh;
  overflow: auto;
  background: rgba(15, 15, 15, 0.82);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  padding: 12px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 30;
}

.marker-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.marker-panel-head h3 {
  color: #fff;
  font-size: 1rem;
}

.marker-close {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

.marker-type {
  margin-top: 2px;
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.8rem;
}

.day-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.day-btn {
  min-width: 44px;
  min-height: 34px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
}

.day-btn.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.acts-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.acts-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.acts-list strong {
  font-size: 0.9rem;
}

.acts-list span,
.facility-text,
.no-acts {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.88);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 5px rgba(44, 155, 255, 0.28); }
  50%       { box-shadow: 0 0 0 10px rgba(44, 155, 255, 0.12); }
}

/* ── Small phones (<380px) ─────────────────────────────── */
@media (max-width: 380px) {
  .map-view {
    --map-ui-pad: 8px;
    --map-btn-size: 42px;
  }

  .stage-pin    { height: 36px; }
  .facility-pin { height: 30px; }
  .map-btn      { font-size: 20px; }
}

@media (min-width: 900px) {
  .map-view {
    --map-ui-pad: 12px;
    --map-btn-size: 44px;
    --map-btn-radius: 10px;
  }

  .map-controls {
    top: var(--map-ui-pad);
    bottom: auto;
  }

  .gps-chip {
    top: auto;
    left: 50%;
    right: auto;
    bottom: 12px;
    transform: translateX(-50%);
    max-width: calc(100% - 24px);
    text-align: center;
  }
}
</style>
