import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import webPush from 'web-push'
import { DateTime } from 'luxon'
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan'
import 'dotenv/config'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const PORT = Number(process.env.PUSH_SERVER_PORT || 4090)
const DATA_DIR = path.join(process.cwd(), 'data')
const SUBSCRIPTIONS_PATH = path.join(DATA_DIR, 'subscriptions.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

if (!fs.existsSync(SUBSCRIPTIONS_PATH)) {
  fs.writeFileSync(SUBSCRIPTIONS_PATH, JSON.stringify([]))
}

const loadSubscriptions = () => {
  try {
    const raw = fs.readFileSync(SUBSCRIPTIONS_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const saveSubscriptions = (subscriptions) => {
  fs.writeFileSync(SUBSCRIPTIONS_PATH, JSON.stringify(subscriptions, null, 2))
}

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

const METHOD_MAP = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague(),
  Egyptian: CalculationMethod.Egyptian(),
  Karachi: CalculationMethod.Karachi(),
  UmmAlQura: CalculationMethod.UmmAlQura(),
  Dubai: CalculationMethod.Dubai(),
  MoonsightingCommittee: CalculationMethod.MoonsightingCommittee(),
  NorthAmerica: CalculationMethod.NorthAmerica(),
  Kuwait: CalculationMethod.Kuwait(),
  Qatar: CalculationMethod.Qatar(),
  Singapore: CalculationMethod.Singapore(),
  Tehran: CalculationMethod.Tehran(),
  Turkey: CalculationMethod.Turkey(),
}

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/push/subscribe', (req, res) => {
  const { subscription, location, calculationMethod, prayers, timeZone, enabled } = req.body || {}
  if (!subscription?.endpoint) {
    res.status(400).json({ error: 'Missing subscription' })
    return
  }

  const subscriptions = loadSubscriptions()
  const existingIndex = subscriptions.findIndex((item) => item.subscription?.endpoint === subscription.endpoint)
  const entry = {
    subscription,
    enabled: enabled !== false,
    location,
    calculationMethod: calculationMethod || 'MuslimWorldLeague',
    prayers: prayers || {},
    timeZone: timeZone || 'UTC',
    updatedAt: Date.now(),
  }

  if (existingIndex >= 0) {
    subscriptions[existingIndex] = { ...subscriptions[existingIndex], ...entry }
  } else {
    subscriptions.push(entry)
  }

  saveSubscriptions(subscriptions)
  res.json({ ok: true })
})

app.post('/api/push/unsubscribe', (req, res) => {
  const { subscription } = req.body || {}
  if (!subscription?.endpoint) {
    res.status(400).json({ error: 'Missing subscription' })
    return
  }

  const subscriptions = loadSubscriptions().filter((item) => item.subscription?.endpoint !== subscription.endpoint)
  saveSubscriptions(subscriptions)
  res.json({ ok: true })
})

app.post('/api/push/test', async (req, res) => {
  const { subscription, prayerKey } = req.body || {}
  const payload = JSON.stringify({
    title: `Athan${prayerKey ? `: ${prayerKey}` : ''}`,
    body: 'Test notification',
    tag: 'adhan-test',
    url: '/prayer-times',
  })

  if (subscription?.endpoint) {
    await webPush.sendNotification(subscription, payload).catch(() => {})
    res.json({ ok: true })
    return
  }

  const subscriptions = loadSubscriptions()
  await Promise.all(
    subscriptions.map((entry) => {
      if (!entry.enabled) return Promise.resolve()
      return webPush.sendNotification(entry.subscription, payload).catch(() => {})
    }),
  )
  res.json({ ok: true })
})

const sentCache = new Map()

const shouldSend = (endpoint, prayerKey, dateKey) => {
  const key = `${endpoint}_${prayerKey}_${dateKey}`
  if (sentCache.has(key)) return false
  sentCache.set(key, true)
  return true
}

const getPrayerTimesForSubscription = (entry) => {
  const { location, calculationMethod, timeZone } = entry
  if (!location?.latitude || !location?.longitude) return null
  const params = METHOD_MAP[calculationMethod] || METHOD_MAP.MuslimWorldLeague

  const now = DateTime.now().setZone(timeZone || 'UTC')
  const localDate = DateTime.fromObject(
    { year: now.year, month: now.month, day: now.day, hour: 0, minute: 0 },
    { zone: timeZone || 'UTC' },
  )

  const dateForPrayer = localDate.toJSDate()
  const coordinates = new Coordinates(location.latitude, location.longitude)
  return new AdhanPrayerTimes(coordinates, dateForPrayer, params)
}

const checkAndSend = async () => {
  if (!vapidPublicKey || !vapidPrivateKey) return
  const subscriptions = loadSubscriptions()

  for (const entry of subscriptions) {
    if (!entry.enabled) continue
    const prayersEnabled = entry.prayers || {}
    const prayerTimes = getPrayerTimesForSubscription(entry)
    if (!prayerTimes) continue

    const now = DateTime.now().setZone(entry.timeZone || 'UTC')
    const dateKey = now.toISODate()

    const prayerList = [
      { key: 'fajr', time: prayerTimes.fajr },
      { key: 'dhuhr', time: prayerTimes.dhuhr },
      { key: 'asr', time: prayerTimes.asr },
      { key: 'maghrib', time: prayerTimes.maghrib },
      { key: 'isha', time: prayerTimes.isha },
    ]

    for (const prayer of prayerList) {
      if (prayersEnabled[prayer.key] === false) continue
      const prayerTime = DateTime.fromJSDate(prayer.time, { zone: entry.timeZone || 'UTC' })
      const diff = Math.abs(prayerTime.diff(now, 'seconds').seconds)
      if (diff <= 50 && shouldSend(entry.subscription.endpoint, prayer.key, dateKey)) {
        await webPush.sendNotification(
          entry.subscription,
          JSON.stringify({
            title: `Athan: ${prayer.key}`,
            body: 'Prayer time has arrived.',
            tag: `adhan-${prayer.key}`,
            url: '/prayer-times',
          }),
        ).catch(() => {})
      }
    }
  }
}

setInterval(checkAndSend, 45 * 1000)

app.listen(PORT, () => {
  console.log(`Push server running on :${PORT}`)
})
