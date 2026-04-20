import { ref, watch } from 'vue'

const STORAGE_KEY = 'loveU_favorites'

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveFavorites(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch { /* storage full or private mode */ }
}

const favorites = ref(loadFavorites())

export function useFavorites() {
  function isFavorite(actId) {
    return favorites.value.has(actId)
  }

  function toggleFavorite(actId) {
    const newSet = new Set(favorites.value)
    if (newSet.has(actId)) {
      newSet.delete(actId)
    } else {
      newSet.add(actId)
    }
    favorites.value = newSet
    saveFavorites(newSet)
  }

  return { favorites, isFavorite, toggleFavorite }
}
