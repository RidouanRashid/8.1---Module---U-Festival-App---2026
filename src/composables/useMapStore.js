import { computed, reactive, readonly } from 'vue'
import mapData from '../assets/data/map.json'
import { getStageIconForName } from '../map/iconRegistry.js'

const state = reactive({
  center: mapData.center,
  zoom: mapData.zoom,
  markers: mapData.stages.map((stage, index) => ({
    id: `stage-${index}`,
    name: stage.name,
    lat: stage.lat,
    lng: stage.lng,
    color: stage.color,
    icon: getStageIconForName(stage.name)
  }))
})

export function useMapStore() {
  return {
    center: computed(() => state.center),
    zoom: computed(() => state.zoom),
    markers: readonly(state.markers)
  }
}
