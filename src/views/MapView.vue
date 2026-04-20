<template>
  <div class="map-view">
    <div class="map-header">
      <h1 class="page-title">{{ $t('map.title') }}</h1>
      <button class="btn btn-accent locate-btn" @click="centerOnUser">
        <span class="material-icons">my_location</span>
        {{ $t('map.myLocation') }}
      </button>
    </div>

    <p v-if="gpsError" class="gps-error">
      <span class="material-icons gps-error-icon">location_off</span>
      {{ gpsError }}
    </p>

    <div class="map-container" ref="mapContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import mapData from '../assets/data/map.json'

const { t } = useI18n()

const mapContainer = ref(null)
const gpsError = ref('')
let map = null
let userMarker = null
let watchId = null

function createStageIcon(color) {
  return L.divIcon({
    className: 'stage-marker',
    html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
    </svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  })
}

function createUserIcon() {
  return L.divIcon({
    className: 'user-marker',
    html: `<div class="user-pulse"><div class="user-dot"></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
}

function initMap() {
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    center: mapData.center,
    zoom: mapData.zoom,
    zoomControl: true,
    attributionControl: true
  })

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  // Add stage markers
  mapData.stages.forEach(stage => {
    const marker = L.marker([stage.lat, stage.lng], {
      icon: createStageIcon(stage.color)
    }).addTo(map)

    marker.bindPopup(`
      <div style="text-align:center;font-family:Sansation,sans-serif;">
        <strong style="color:${stage.color};font-size:1rem;">${stage.name}</strong>
      </div>
    `)
  })

  startGPS()
}

function startGPS() {
  if (!('geolocation' in navigator)) {
    gpsError.value = t('map.gpsError')
    return
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      gpsError.value = ''
      const { latitude, longitude } = pos.coords
      updateUserPosition(latitude, longitude)
    },
    (err) => {
      if (err.code === 1) {
        gpsError.value = t('map.gpsDenied')
      } else {
        gpsError.value = t('map.gpsError')
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000
    }
  )
}

function updateUserPosition(lat, lng) {
  if (!map) return

  if (userMarker) {
    userMarker.setLatLng([lat, lng])
  } else {
    userMarker = L.marker([lat, lng], {
      icon: createUserIcon()
    }).addTo(map)
  }
}

function centerOnUser() {
  if (!map) return

  if (userMarker) {
    map.setView(userMarker.getLatLng(), 17)
  } else {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        updateUserPosition(latitude, longitude)
        map.setView([latitude, longitude], 17)
      },
      () => {
        gpsError.value = t('map.gpsError')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
.map-view {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - var(--header-height) - var(--nav-height) - var(--safe-top) - var(--safe-bottom));
  margin: calc(var(--spacing) * -2);
  margin-top: 0;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--spacing) * 2);
  gap: var(--spacing);
}

.map-header .page-title {
  margin: 0;
  font-size: 1.2rem;
}

.locate-btn {
  font-size: 0.8rem;
  padding: var(--spacing) calc(var(--spacing) * 1.5);
  flex-shrink: 0;
}

.gps-error {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  padding: var(--spacing) calc(var(--spacing) * 2);
  background: var(--color-info);
  color: #000;
  font-size: 0.85rem;
  margin: 0;
}

.gps-error-icon {
  font-size: 18px;
}

.map-container {
  flex: 1;
  min-height: 0;
}

/* Leaflet fix for marker icons */
:deep(.stage-marker) {
  background: none !important;
  border: none !important;
}

:deep(.user-marker) {
  background: none !important;
  border: none !important;
}

:deep(.user-pulse) {
  width: 24px;
  height: 24px;
  position: relative;
}

:deep(.user-dot) {
  width: 14px;
  height: 14px;
  background: #4285F4;
  border: 3px solid #fff;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
  animation: userPulse 2s infinite;
}

@keyframes userPulse {
  0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(66, 133, 244, 0); }
  100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
}

/* Leaflet popup styling */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: var(--radius);
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}
</style>
