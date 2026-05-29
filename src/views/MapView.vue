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
  >
    <div class="map-canvas" :style="canvasStyle">
      <img
        :src="mapImageUrl"
        class="map-image"
        alt="Festival kaart"
        draggable="false"
        @load="updateImageRect"
      />

      <img
        v-for="marker in mapStore.markers"
        :key="marker.id"
        :src="marker.icon"
        :alt="marker.name"
        :class="marker.markerType === 'stage' ? 'stage-pin' : 'facility-pin'"
        :style="coordStyle(marker.lat, marker.lng)"
      />

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
      <button class="map-btn map-btn--icon" aria-label="Mijn locatie" @click="enableLocation">
        <span class="material-icons">my_location</span>
      </button>
    </div>

    <!-- GPS status chip -->
    <div v-if="gpsStatus" class="gps-chip" :class="gpsStatus.cls" aria-live="polite">
      {{ gpsStatus.label }}
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '../composables/useMapStore.js'

// ── Festival SVG map image ──────────────────────────────────────────────────
const mapImageUrl = new URL('../../pictures/kaart_festival_no_markers.svg', import.meta.url).href

const mapStore = useMapStore()
const router = useRouter()
const bounds   = mapStore.bounds   // { top, bottom, left, right } in lat/lng

// ── DOM ref + image rect ────────────────────────────────────────────────────
const viewport  = ref(null)
// Rendered rect of the SVG image inside the canvas (accounts for letterboxing)
const imageRect = ref({ x: 0, y: 0, w: 0, h: 0 })

const SVG_ASPECT = 2330.58 / 1353.19   // natural width / height of the festival SVG

function updateImageRect() {
  if (!viewport.value) return
  const cW = viewport.value.clientWidth
  const cH = viewport.value.clientHeight
  if (cW / cH > SVG_ASPECT) {
    // Cover mode: match width, crop top/bottom when needed.
    const w = cW
    const h = w / SVG_ASPECT
    imageRect.value = { x: 0, y: (cH - h) / 2, w, h }
  } else {
    // Cover mode: match height, crop left/right when needed.
    const h = cH
    const w = h * SVG_ASPECT
    imageRect.value = { x: (cW - w) / 2, y: 0, w, h }
  }
}

// ── Coordinate → CSS pixel position (inside canvas) ───────────────────────
function coordStyle(lat, lng) {
  const r = imageRect.value
  if (!r.w) return { display: 'none' }
  const px = r.x + ((lng - bounds.left)  / (bounds.right - bounds.left))  * r.w
  const py = r.y + ((bounds.top  - lat)  / (bounds.top   - bounds.bottom)) * r.h
  return { left: `${px}px`, top: `${py}px` }
}

// ── Pan / zoom state ────────────────────────────────────────────────────────
const scale = ref(1)
const tx    = ref(0)
const ty    = ref(0)

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

// ── Mouse wheel zoom ────────────────────────────────────────────────────────
function onWheel(e) {
  const rect   = viewport.value.getBoundingClientRect()
  const cx     = e.clientX - rect.left
  const cy     = e.clientY - rect.top
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
  const newS   = Math.min(4, Math.max(1, scale.value * factor))
  const ratio  = newS / scale.value
  tx.value     = cx - ratio * (cx - tx.value)
  ty.value     = cy - ratio * (cy - ty.value)
  scale.value  = newS
  clamp()
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
    const newS  = Math.min(4, Math.max(1, scale.value * (dist / lastTouchDist)))
    const ratio = newS / scale.value
    tx.value    = cx - ratio * (cx - tx.value) + (midX - lastMidX)
    ty.value    = cy - ratio * (cy - ty.value)  + (midY - lastMidY)
    scale.value = newS
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
  const newS = Math.min(4, Math.max(1, scale.value * factor))
  const ratio = newS / scale.value
  tx.value    = cx - ratio * (cx - tx.value)
  ty.value    = cy - ratio * (cy - ty.value)
  scale.value = newS
  clamp()
}

function zoomIn()    { zoomStep(1.4) }
function zoomOut()   { zoomStep(1 / 1.4) }
function resetView() { scale.value = 1; tx.value = 0; ty.value = 0 }
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
    gpsStatus.value = { label: '📍 GPS niet beschikbaar', cls: 'gps-off' }
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
      gpsStatus.value  = inBounds
        ? { label: '📍 Jouw locatie', cls: 'gps-on' }
        : { label: '📍 GPS actief · niet op het festival', cls: 'gps-away' }
    },
    () => {
      // Still show dot at festival centre even when permission is denied
      liveCoord.value  = { lat: FEST_LAT, lng: FEST_LNG }
      atFestival.value = false
      gpsStatus.value  = { label: '📍 Locatie geweigerd · GPS uitgeschakeld', cls: 'gps-off' }
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
})

function enableLocation() {
  if (watchId !== null) return
  startLocation()
}

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
  height: 100dvh;
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.stage-pin,
.facility-pin {
  position: absolute;
  height: 36px;
  width: auto;
  transform: translate(-50%, -50%);
  pointer-events: none;
  filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.5));
}

.stage-pin {
  height: 44px;
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
