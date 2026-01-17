const REMINDERS_URL = '/daily-reminders.json'
const CACHE_VERSION = 'v3'
const STATIC_CACHE = `rahma-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `rahma-runtime-${CACHE_VERSION}`
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  '/daily-reminders.json',
]

const getDayOfYear = (date = new Date()) => {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const diff = date - startOfYear
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const getDailyReminder = async (date = new Date()) => {
  try {
    const response = await fetch(REMINDERS_URL, { cache: 'no-store' })
    const reminders = await response.json()
    if (!Array.isArray(reminders) || reminders.length === 0) return ''
    const dayOfYear = getDayOfYear(date)
    return reminders[(dayOfYear - 1) % reminders.length]
  } catch (error) {
    console.warn('Failed to load daily reminders:', error)
    return ''
  }
}

const showDailyReminderNotification = async () => {
  const reminder = await getDailyReminder(new Date())
  if (!reminder) return

  await self.registration.showNotification('Daily Reminder', {
    body: reminder,
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'daily-reminder',
    data: { url: '/' },
  })
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(showDailyReminderNotification())
  }
})

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ),
  )
})

const cacheFirst = async (request) => {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  const cache = await caches.open(RUNTIME_CACHE)
  cache.put(request, response.clone())
  return response
}

const networkFirst = async (request) => {
  try {
    const response = await fetch(request)
    const cache = await caches.open(RUNTIME_CACHE)
    cache.put(request, response.clone())
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached
    throw error
  }
}

const staleWhileRevalidate = async (request) => {
  const cached = await caches.match(request)
  const fetchPromise = fetch(request)
    .then((response) => {
      const cache = caches.open(RUNTIME_CACHE)
      cache.then((store) => store.put(request, response.clone()))
      return response
    })
    .catch(() => cached)
  return cached || fetchPromise
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request))
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  event.respondWith(staleWhileRevalidate(event.request))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(targetUrl)
    }),
  )
})

self.addEventListener('push', (event) => {
  if (!event.data) return
  let payload = {}
  try {
    payload = event.data.json()
  } catch (error) {
    payload = { title: 'Athan', body: event.data.text() }
  }

  const title = payload.title || 'Athan'
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon.svg',
    badge: payload.badge || '/icon.svg',
    tag: payload.tag || 'adhan-push',
    data: { url: payload.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})
