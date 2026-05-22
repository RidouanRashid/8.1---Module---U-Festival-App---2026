<template>
  <section class="map-view" aria-label="Festival map view">
    <div ref="mapContainer" class="map-canvas" aria-label="Interactive map"></div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import { defaults as defaultControls } from 'ol/control'
import { Icon, Style } from 'ol/style'
import 'ol/ol.css'
import { useMapStore } from '../composables/useMapStore.js'
import { createLiveLocationSvg } from '../map/iconRegistry.js'

const mapContainer = ref(null)
const mapStore = useMapStore()

let mapInstance = null
let stageSource = null
let locationWatchId = null
let liveLocationFeature = null

function createMarkerStyle(iconUrl, scale = 1) {
  return new Style({
    image: new Icon({
      src: iconUrl,
      anchor: [0.5, 1],
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      scale,
      crossOrigin: 'anonymous'
    })
  })
}

function buildStageFeatures() {
  return mapStore.markers.map((marker) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([marker.lng, marker.lat])),
      markerId: marker.id,
      markerName: marker.name,
      markerType: 'stage'
    })

    feature.setStyle(createMarkerStyle(marker.icon, 0.9))
    return feature
  })
}

function applyHoverCursor(pointerPixel) {
  if (!mapInstance) return

  const hitFeature = mapInstance.forEachFeatureAtPixel(pointerPixel, (feature) => feature)

  if (hitFeature) {
    mapInstance.getTargetElement().style.cursor = 'pointer'
  } else {
    mapInstance.getTargetElement().style.cursor = ''
  }
}

function bindMapEvents() {
  if (!mapInstance) return

  mapInstance.on('singleclick', (event) => {
    const hitFeature = mapInstance.forEachFeatureAtPixel(event.pixel, (feature) => feature)

    stageSource.getFeatures().forEach((feature) => {
      if (feature.get('markerType') === 'stage') {
        const isSelected = hitFeature && hitFeature === feature
        const icon = mapStore.markers.find((item) => item.id === feature.get('markerId'))?.icon
        feature.setStyle(createMarkerStyle(icon, isSelected ? 1.05 : 0.9))
      }
    })
  })

  mapInstance.on('pointermove', (event) => {
    if (event.dragging) return
    applyHoverCursor(event.pixel)
  })
}

function startLiveLocationTracking() {
  if (!('geolocation' in navigator) || !mapInstance || !stageSource) return

  const liveLocationIcon = createLiveLocationSvg()

  locationWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const coords = fromLonLat([position.coords.longitude, position.coords.latitude])

      if (!liveLocationFeature) {
        liveLocationFeature = new Feature({
          geometry: new Point(coords),
          markerType: 'live-location'
        })

        liveLocationFeature.setStyle(createMarkerStyle(liveLocationIcon, 0.7))
        stageSource.addFeature(liveLocationFeature)
        return
      }

      liveLocationFeature.getGeometry().setCoordinates(coords)
    },
    () => {
      // Keep map functional even when geolocation is denied or unavailable.
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    }
  )
}

function initializeMap() {
  stageSource = new VectorSource({
    features: buildStageFeatures()
  })

  const stageLayer = new VectorLayer({
    source: stageSource,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  })

  mapInstance = new Map({
    target: mapContainer.value,
    layers: [
      new TileLayer({ source: new OSM() }),
      stageLayer
    ],
    controls: defaultControls({
      zoom: true,
      rotate: false,
      attribution: false
    }),
    view: new View({
      center: fromLonLat([mapStore.center.value[1], mapStore.center.value[0]]),
      zoom: mapStore.zoom.value,
      minZoom: 12,
      maxZoom: 19
    })
  })

  bindMapEvents()
  startLiveLocationTracking()
}

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId)
  }

  if (mapInstance) {
    mapInstance.setTarget(undefined)
    mapInstance = null
  }

  stageSource = null
  liveLocationFeature = null
})
</script>

<style scoped>
.map-view {
  width: 100%;
  height: calc(100dvh - var(--header-height) - var(--nav-height) - var(--safe-top) - var(--safe-bottom));
  margin: calc(var(--spacing) * -2);
  margin-top: 0;
  overflow: hidden;
}

.map-canvas {
  width: 100%;
  height: 100%;
}

:deep(.ol-viewport) {
  width: 100%;
  height: 100%;
}

:deep(.ol-control) {
  border-radius: var(--radius);
  overflow: hidden;
}

:deep(.ol-control button) {
  font-style: normal;
  font-weight: 700;
  color: #fff;
  background: rgba(18, 24, 18, 0.78);
}

:deep(.ol-control button:hover) {
  background: rgba(18, 24, 18, 0.92);
}
</style>
