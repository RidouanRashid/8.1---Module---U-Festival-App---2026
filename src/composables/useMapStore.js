import { reactive, readonly } from 'vue'
import { apiFetch } from './useApi.js'
import { getStageIconForName, getFacilityIcon } from '../map/iconRegistry.js'

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
    color:      s.color,
    icon:       getStageIconForName(s.name),
  }))
  const facilities = data.facilities.map((f, i) => ({
    id:         `facility-${i}`,
    markerType: 'facility',
    name:       f.type,
    lat:        f.lat,
    lng:        f.lng,
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
