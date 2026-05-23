import { computed, reactive, readonly } from 'vue'
import mapData from '../assets/data/map.json'
import { getStageIconForName, getFacilityIcon } from '../map/iconRegistry.js'

const stageMarkers = mapData.stages.map((stage, index) => ({
  id:          `stage-${index}`,
  markerType:  'stage',
  name:        stage.name,
  lat:         stage.lat,
  lng:         stage.lng,
  color:       stage.color,
  icon:        getStageIconForName(stage.name),
}))

const facilityMarkers = mapData.facilities.map((f, index) => ({
  id:          `facility-${index}`,
  markerType:  'facility',
  name:        f.type,
  lat:         f.lat,
  lng:         f.lng,
  icon:        getFacilityIcon(f.type),
}))

const state = reactive({
  center:  mapData.center,
  zoom:    mapData.zoom,
  markers: [...stageMarkers, ...facilityMarkers],
})

export function useMapStore() {
  return {
    center:  computed(() => state.center),
    zoom:    computed(() => state.zoom),
    markers: readonly(state.markers),
    bounds:  mapData.bounds,
  }
}
