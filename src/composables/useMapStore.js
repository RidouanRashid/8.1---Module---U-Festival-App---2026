import { reactive, readonly } from 'vue'
import { apiFetch } from './useApi.js'
import { getStageIconForName, getFacilityIcon } from '../map/iconRegistry.js'

const MARKER_LAYOUT = {
  stage: {
    poton: { x: 0.217, y: 0.624 },
    'the-lake': { x: 0.542, y: 0.451 },
    'the-club': { x: 0.691, y: 0.387 },
    hanggar: { x: 0.899, y: 0.105 },
  },
  facility: {
    entrance_exit: { x: 0.693, y: 0.847 },
    first_aid: { x: 0.179, y: 0.158 },
    bar: { x: 0.364, y: 0.438 },
    food: { x: 0.807, y: 0.148 },
    toilet: { x: 0.084, y: 0.787 },
    locker: { x: 0.241, y: 0.828 },
    merchandise: { x: 0.306, y: 0.815 },
    ice_cream: { x: 0.174, y: 0.788 },
  },
}

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '-')
}

function getMarkerLayout(markerType, name) {
  const key = normalizeKey(name)
  const group = MARKER_LAYOUT[markerType] || {}
  return group[key] || null
}

// Reactive shared state — default values keep the map usable before the API responds
const state = reactive({
  center:  [52.0603, 5.0530],
  zoom:    16,
  bounds:  { top: 52.0630, bottom: 52.0578, left: 5.0490, right: 5.0568 },
  markers: [],
})

function buildMarkers(data) {
  const stages = data.stages.map((s, i) => ({
    id:         `stage-${i}`,
    markerType: 'stage',
    name:       s.name,
    lat:        s.lat,
    lng:        s.lng,
    mapPos:     getMarkerLayout('stage', s.name),
    color:      s.color,
    icon:       getStageIconForName(s.name),
  }))
  const facilities = data.facilities.map((f, i) => ({
    id:         `facility-${i}`,
    markerType: 'facility',
    name:       f.type,
    lat:        f.lat,
    lng:        f.lng,
    mapPos:     getMarkerLayout('facility', f.type),
    icon:       getFacilityIcon(f.type),
  }))
  return [...stages, ...facilities]
}

// Load once, shared across all useMapStore() calls
let initPromise = null
function init() {
  if (!initPromise) {
    initPromise = apiFetch('map.php').then(data => {
      state.center = data.center
      state.zoom   = data.zoom
      Object.assign(state.bounds, data.bounds)
      state.markers.splice(0, state.markers.length, ...buildMarkers(data))
    }).catch(() => {})
  }
  return initPromise
}

export function useMapStore() {
  init()
  return {
    center:  state.center,
    zoom:    state.zoom,
    bounds:  state.bounds,
    markers: readonly(state.markers),
  }
}
