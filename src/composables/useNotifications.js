const STORAGE_KEY = 'loveU_notifications'

function getScheduledNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveScheduledNotifications(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

const activeTimeouts = new Map()

export function useNotifications() {
  async function requestPermission() {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }

  function scheduleNotification(act, stageName, dateStr) {
    if (Notification.permission !== 'granted') return

    const scheduled = getScheduledNotifications()
    const offsets = [15, 10, 5]

    offsets.forEach(minutes => {
      const key = `${act.id}-${minutes}`
      if (scheduled[key]) return

      const [hours, mins] = act.start.split(':').map(Number)
      const actTime = new Date(dateStr)
      actTime.setHours(hours, mins, 0, 0)
      const notifyTime = new Date(actTime.getTime() - minutes * 60 * 1000)
      const delay = notifyTime.getTime() - Date.now()

      if (delay > 0) {
        const timeoutId = setTimeout(() => {
          new Notification('❤️U Festival', {
            body: `⏰ ${act.artist} begint over ${minutes} minuten op ${stageName}!`,
            icon: '/icons/icon-192.png',
            tag: key
          })
        }, delay)

        activeTimeouts.set(key, timeoutId)
        scheduled[key] = true
        saveScheduledNotifications(scheduled)
      }
    })
  }

  function cancelNotifications(actId) {
    const offsets = [15, 10, 5]
    const scheduled = getScheduledNotifications()

    offsets.forEach(minutes => {
      const key = `${actId}-${minutes}`
      if (activeTimeouts.has(key)) {
        clearTimeout(activeTimeouts.get(key))
        activeTimeouts.delete(key)
      }
      delete scheduled[key]
    })

    saveScheduledNotifications(scheduled)
  }

  return { requestPermission, scheduleNotification, cancelNotifications }
}
