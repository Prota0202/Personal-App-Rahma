import DateTimePicker from '@react-native-community/datetimepicker'
import { Audio } from 'expo-av'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { format } from 'date-fns'
import HijriDate from 'hijri-date'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated,
  Easing,
  NativeModules,
  SafeAreaView,
  ScrollView,
  Switch,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native'
import * as Location from 'expo-location'
import dailyReminders from './src/data/dailyReminders'
import { azkarCategories } from './src/data/azkar'
import { duaaCategories } from './src/data/duaas'
import { hadiths as seedHadiths } from './src/data/hadiths'
import { hadithOverrides } from './src/data/hadithOverrides'
import { buildPrayerTimes, formatTime, getNextPrayer } from './src/utils/prayerTimes'
import { readJson, updateCounter, writeJson } from './src/utils/storage'
import { loadWidgetSnapshot, saveWidgetSnapshot } from './src/utils/widgetStore'
import { useTranslation } from 'react-i18next'
import i18n from './src/i18n'

type TabKey =
  | 'home'
  | 'prayer'
  | 'quran'
  | 'duaas'
  | 'azkar'
  | 'tasbih'
  | 'hadiths'
  | 'calendar'
  | 'favorites'
  | 'stats'
  | 'qibla'
  | 'language'


type FavoriteVerse = {
  id: string
  surahNumber: number
  surahName: string
  ayahNumber: number
  text: string
  translation?: string
}

type FavoriteDuaa = {
  id: number
  title: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

type FavoriteHadith = {
  id: number
  title: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

type FavoritesState = {
  verses: FavoriteVerse[]
  duaas: FavoriteDuaa[]
  hadiths: FavoriteHadith[]
}

type LastReads = {
  quran?: { surahNumber: number; surahName: string; ayahNumber?: number }
  duaa?: { id: number; title: string }
  hadith?: { id: number; title: string }
}

type Surah = {
  number: number
  name: string
  arabic: string
  english: string
  ayahs: number
  revelationType: string
}

type Ayah = {
  number: number
  text: string
  translation: string
}

type HadithEditionResponse = {
  metadata?: {
    name?: string
    sections?: Record<string, string>
  }
  hadiths?: Array<{
    hadithnumber: number
    text?: string
    reference?: { hadith?: number }
  }>
}

const FAVORITES_KEY = 'rahma.favorites'
const STATS_KEY = 'rahma.stats'
const TASBIH_KEY = 'rahma.tasbih.session'
const DAILY_REMINDER_KEY = 'rahma.dailyReminder'
const DAILY_REMINDER_TIME_KEY = 'rahma.dailyReminder.time'
const DAILY_REMINDER_NOTIFICATION_ID_KEY = 'rahma.dailyReminder.notificationId'
const PRAYER_ALERTS_KEY = 'rahma.prayerAlerts'
const PRAYER_REMINDERS_KEY = 'rahma.prayerReminders'
const PRAYER_NOTIFICATION_IDS_KEY = 'rahma.prayerNotifications'
const LAST_READS_KEY = 'rahma.lastReads'
const LANGUAGE_KEY = 'rahma.language'
const HADITH_BATCH_SIZE = 10
const HADITH_COLLECTIONS = [
  { id: 'eng-bukhari', name: 'Sahih al Bukhari' },
  { id: 'eng-muslim', name: 'Sahih Muslim' },
  { id: 'eng-nawawi', name: 'Nawawi 40' },
]
const getArabicEditionId = (englishId: string) => englishId.replace(/^eng-/, 'ara-')

const ADHAN_SOUNDS = [
  {
    id: 'mishary',
    label: 'Mishary Alafasy',
    file: require('./assets/adhan-mishary-alafasy.mp3'),
    soundName: 'adhan-mishary-alafasy.mp3',
  },
]

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export default function App() {
  const [language, setLanguage] = useState<'fr' | 'en' | 'ar'>('fr')
  const [languageLoaded, setLanguageLoaded] = useState(false)
  const [status, setStatus] = useState('')
  const [nextPrayerLabel, setNextPrayerLabel] = useState('—')
  const [nextPrayerTime, setNextPrayerTime] = useState('—')
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [prayerTimes, setPrayerTimes] = useState<ReturnType<typeof buildPrayerTimes> | null>(
    null
  )
  const [locationLabel, setLocationLabel] = useState('—')
  const [favorites, setFavorites] = useState<FavoritesState>({
    verses: [],
    duaas: [],
    hadiths: [],
  })
  const [lastReads, setLastReads] = useState<LastReads>({})
  const [stats, setStats] = useState<Record<string, number>>({})
  const activeTabRef = useRef<TabKey>('home')
  const tabStartRef = useRef<number>(Date.now())
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null)
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [quranLoading, setQuranLoading] = useState(false)
  const [quranError, setQuranError] = useState<string | null>(null)
  const [quranSearch, setQuranSearch] = useState('')
  const [showTranslation, setShowTranslation] = useState(true)
  const [selectedDuaaCategory, setSelectedDuaaCategory] = useState(duaaCategories[0]?.key ?? '')
  const [selectedDuaaId, setSelectedDuaaId] = useState<number | null>(null)
  const [selectedAzkarCategory, setSelectedAzkarCategory] = useState(azkarCategories[0]?.key ?? '')
  const [selectedAzkarId, setSelectedAzkarId] = useState<number | null>(null)
  const [tasbihCount, setTasbihCount] = useState(0)
  const [tasbihSessionTotal, setTasbihSessionTotal] = useState(0)
  const [selectedDhikr, setSelectedDhikr] = useState<'SubhanAllah' | 'Alhamdulillah' | 'AllahuAkbar'>(
    'SubhanAllah'
  )
  const [selectedHadithId, setSelectedHadithId] = useState<number | null>(null)
  const [hadithSearch, setHadithSearch] = useState('')
  const [hadithItems, setHadithItems] = useState(seedHadiths)
  const [selectedHadithCollection, setSelectedHadithCollection] = useState(
    HADITH_COLLECTIONS[0]?.id ?? ''
  )
  const [hadithHasMore, setHadithHasMore] = useState(true)
  const [hadithVisibleCount, setHadithVisibleCount] = useState(HADITH_BATCH_SIZE)
  const [hadithLoading, setHadithLoading] = useState(false)
  const [hadithError, setHadithError] = useState<string | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [headingAccuracy, setHeadingAccuracy] = useState<number | null>(null)
  const [qiblaHeading, setQiblaHeading] = useState<number | null>(null)
  const needleRotation = useRef(new Animated.Value(0))
  const lastRotation = useRef(0)
  const faceRotation = useRef(new Animated.Value(0))
  const lastFaceRotation = useRef(0)
  const smoothHeading = useRef<number | null>(null)
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false)
  const [dailyReminderTime, setDailyReminderTime] = useState(() => {
    const base = new Date()
    base.setHours(9, 0, 0, 0)
    return base
  })
  const [showDailyPicker, setShowDailyPicker] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'undetermined'>(
    'undetermined'
  )
  const [prayerAlertsEnabled, setPrayerAlertsEnabled] = useState(false)
  const [prayerReminderEnabled, setPrayerReminderEnabled] = useState(false)
  const [prayerReminderMinutes, setPrayerReminderMinutes] = useState(5)
  const [adhanSoundPreference, setAdhanSoundPreference] = useState<'system' | 'adhan'>('system')
  const [adhanSoundId, setAdhanSoundId] = useState(ADHAN_SOUNDS[0]?.id ?? 'mishary')
  const [prayerSwitches, setPrayerSwitches] = useState({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  })

  const { t } = useTranslation()
  const isRTL = language === 'ar'
  const textAlignStyle = useMemo<TextStyle>(
    () => ({ textAlign: isRTL ? 'right' : 'left' }),
    [isRTL]
  )

  const tabs = useMemo(
    () => [
      { key: 'home' as TabKey, label: t('tabHome'), icon: '🏠' },
      { key: 'prayer' as TabKey, label: t('tabPrayer'), icon: '🕌' },
      { key: 'quran' as TabKey, label: t('tabQuran'), icon: '📖' },
      { key: 'duaas' as TabKey, label: t('tabDuaas'), icon: '🤲' },
      { key: 'azkar' as TabKey, label: t('tabAzkar'), icon: '📿' },
      { key: 'tasbih' as TabKey, label: t('tabTasbih'), icon: '🔖' },
      { key: 'hadiths' as TabKey, label: t('tabHadiths'), icon: '📚' },
      { key: 'calendar' as TabKey, label: t('tabCalendar'), icon: '📅' },
      { key: 'favorites' as TabKey, label: t('tabFavorites'), icon: '⭐' },
      { key: 'stats' as TabKey, label: t('tabStats'), icon: '📊' },
      { key: 'qibla' as TabKey, label: t('tabQibla'), icon: '🧭' },
      { key: 'language' as TabKey, label: t('tabLanguage'), icon: '🌐' },
    ],
    [t]
  )

  useEffect(() => {
    const init = async () => {
      setStatus(t('locationRequest'))
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync()
      if (permissionStatus !== 'granted') {
        setStatus(t('locationDenied'))
        return
      }

      const position = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = position.coords
      const prayers = buildPrayerTimes(latitude, longitude)
      const nextPrayer = getNextPrayer(prayers)

      setNextPrayerLabel(nextPrayer.key.toUpperCase())
      setNextPrayerTime(formatTime(nextPrayer.time))
      setStatus(t('locationReady'))
      setLocationLabel(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
      setPrayerTimes(prayers)

      const snapshot = {
        updatedAt: Date.now(),
        nextPrayerName: nextPrayer.key,
        nextPrayerTime: formatTime(nextPrayer.time),
        latitude,
        longitude,
      }

      await saveWidgetSnapshot(snapshot)
      if (NativeModules.WidgetStorage?.setSnapshot) {
        NativeModules.WidgetStorage.setSnapshot(JSON.stringify(snapshot))
      }
    }

    init().catch(() => setStatus(t('locationError')))
  }, [t])

  useEffect(() => {
    readJson<'fr' | 'en' | 'ar'>(LANGUAGE_KEY, 'fr').then((value) => {
      setLanguage(value)
      setShowTranslation(value === 'en')
      setLanguageLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!languageLoaded) return
    writeJson(LANGUAGE_KEY, language)
    setShowTranslation(language === 'en')
    i18n.changeLanguage(language)
  }, [language, languageLoaded])

  useEffect(() => {
    readJson<FavoritesState>(FAVORITES_KEY, { verses: [], duaas: [], hadiths: [] }).then(
      setFavorites
    )
    readJson<Record<string, number>>(STATS_KEY, {}).then(setStats)
    readJson<number>(TASBIH_KEY, 0).then(setTasbihSessionTotal)
    readJson<LastReads>(LAST_READS_KEY, {}).then(setLastReads)
  }, [])

  useEffect(() => {
    const now = Date.now()
    const prevTab = activeTabRef.current
    const elapsedSec = Math.max(0, Math.round((now - tabStartRef.current) / 1000))
    if (elapsedSec > 0) {
      updateCounter(STATS_KEY, `time_${prevTab}`, elapsedSec).then(setStats)
    }
    activeTabRef.current = activeTab
    tabStartRef.current = now
  }, [activeTab])

  useEffect(() => {
    const loadSettings = async () => {
      const permission = await Notifications.getPermissionsAsync()
      setNotificationPermission(permission.status)
      const savedDailyEnabled = await readJson<boolean>(DAILY_REMINDER_KEY, false)
      const savedDailyTime = await readJson<string | null>(DAILY_REMINDER_TIME_KEY, null)
      if (savedDailyTime) {
        const parsed = new Date(savedDailyTime)
        if (!Number.isNaN(parsed.getTime())) {
          setDailyReminderTime(parsed)
        }
      }
      setDailyReminderEnabled(savedDailyEnabled)
      const savedPrayerSettings = await readJson(PRAYER_ALERTS_KEY, {
        alertsEnabled: false,
        reminderEnabled: false,
        reminderMinutes: 5,
        soundPreference: 'system',
        soundId: ADHAN_SOUNDS[0]?.id ?? 'mishary',
        switches: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
      })
      setPrayerAlertsEnabled(savedPrayerSettings.alertsEnabled)
      setPrayerReminderEnabled(savedPrayerSettings.reminderEnabled)
      setPrayerReminderMinutes(savedPrayerSettings.reminderMinutes)
      setAdhanSoundPreference(
        savedPrayerSettings.soundPreference === 'adhan' ? 'adhan' : 'system'
      )
      setAdhanSoundId(savedPrayerSettings.soundId ?? ADHAN_SOUNDS[0]?.id ?? 'mishary')
      setPrayerSwitches(savedPrayerSettings.switches)
      setSettingsLoaded(true)
    }

    loadSettings()
  }, [])

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null
    const start = async () => {
      try {
        subscription = await Location.watchHeadingAsync((update) => {
          const nextHeading =
            Number.isFinite(update.trueHeading) && update.trueHeading >= 0
              ? update.trueHeading
              : update.magHeading
          const current = smoothHeading.current
          const alpha = 0.2
          const smooth = current === null ? nextHeading : current + ((nextHeading - current + 540) % 360 - 180) * alpha
          smoothHeading.current = (smooth + 360) % 360
          setHeading(smoothHeading.current)
          setHeadingAccuracy(update.accuracy ?? null)
        })
      } catch {
        setHeading(null)
        setHeadingAccuracy(null)
      }
    }
    start()
    return () => {
      subscription?.remove()
    }
  }, [])

  useEffect(() => {
    const [latStr, lonStr] = locationLabel.split(',').map((item) => item.trim())
    const lat = Number(latStr)
    const lon = Number(lonStr)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      setQiblaHeading(null)
      return
    }
    const kaabaLat = 21.4225
    const kaabaLon = 39.8262
    const toRad = (value: number) => (value * Math.PI) / 180
    const toDeg = (value: number) => (value * 180) / Math.PI
    const computed =
      (toDeg(
        Math.atan2(
          Math.sin(toRad(kaabaLon - lon)),
          Math.cos(toRad(lat)) * Math.tan(toRad(kaabaLat)) -
            Math.sin(toRad(lat)) * Math.cos(toRad(kaabaLon - lon))
        )
      ) + 360) % 360
    setQiblaHeading(computed)
    if (heading === null) return
    const rotation = (computed - heading + 360) % 360
    const current = lastRotation.current
    const delta = ((rotation - current + 540) % 360) - 180
    const next = current + delta
    lastRotation.current = next
    Animated.timing(needleRotation.current, {
      toValue: next,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
    const faceTarget = (360 - heading) % 360
    const faceCurrent = lastFaceRotation.current
    const faceDelta = ((faceTarget - faceCurrent + 540) % 360) - 180
    const faceNext = faceCurrent + faceDelta
    lastFaceRotation.current = faceNext
    Animated.timing(faceRotation.current, {
      toValue: faceNext,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [heading, locationLabel])

  useEffect(() => {
    if (!selectedHadithCollection) return
    const loadHadiths = async () => {
      try {
        setHadithLoading(true)
        setHadithError(null)
        const englishUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${selectedHadithCollection}.min.json`
        const arabicId = getArabicEditionId(selectedHadithCollection)
        const arabicUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${arabicId}.min.json`
        const [englishResponse, arabicResponse] = await Promise.all([
          fetch(englishUrl),
          fetch(arabicUrl),
        ])
        if (!englishResponse.ok) {
          throw new Error('No edition')
        }
        const englishData = (await englishResponse.json()) as HadithEditionResponse
        const arabicData = arabicResponse.ok
          ? ((await arabicResponse.json()) as HadithEditionResponse)
          : null
        if (!englishData?.hadiths?.length) {
          setHadithHasMore(false)
          return
        }
        const arabicByNumber = new Map(
          (arabicData?.hadiths ?? []).map((item) => [item.hadithnumber, item.text ?? ''])
        )
        const collectionName = englishData.metadata?.name || selectedHadithCollection
        const mapped = englishData.hadiths
          .map((item) => {
            const override = hadithOverrides[selectedHadithCollection]?.[item.hadithnumber]
            const englishText = (override?.translation ?? item.text ?? '').trim()
            const arabicText = (override?.arabic ?? arabicByNumber.get(item.hadithnumber) ?? '').trim()
            if (!englishText && !arabicText) return null
            const translation = englishText || 'Traduction indisponible pour ce hadith.'
            return {
          id: item.hadithnumber,
          collection: collectionName,
              title: `Hadith ${item.hadithnumber}`,
              arabic: arabicText,
          transliteration: '',
              translation,
          reference: `${collectionName} ${item.reference?.hadith ?? item.hadithnumber}`,
            }
          })
          .filter((item): item is (typeof seedHadiths)[number] => item !== null)
        setHadithItems(mapped)
        if (selectedHadithCollection === 'eng-nawawi') {
          setHadithVisibleCount(mapped.length)
        setHadithHasMore(false)
        } else {
          const initialCount = Math.min(HADITH_BATCH_SIZE, mapped.length)
          setHadithVisibleCount(initialCount)
          setHadithHasMore(mapped.length > initialCount)
        }
      } catch {
        setHadithError(t('hadithLoadError'))
          setHadithItems(seedHadiths)
        const initialCount = Math.min(HADITH_BATCH_SIZE, seedHadiths.length)
        setHadithVisibleCount(initialCount)
        setHadithHasMore(seedHadiths.length > initialCount)
      } finally {
        setHadithLoading(false)
      }
    }

    loadHadiths()
  }, [selectedHadithCollection])

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setQuranLoading(true)
        const response = await fetch('https://api.alquran.cloud/v1/surah')
        const data = await response.json()
        if (data.code === 200 && data.data) {
          const formatted: Surah[] = data.data.map((surah: any) => ({
            number: surah.number,
            name: surah.englishName,
            arabic: surah.name,
            english: surah.englishNameTranslation,
            ayahs: surah.numberOfAyahs,
            revelationType: surah.revelationType,
          }))
          setSurahs(formatted)
        } else {
          setQuranError(t('surahLoadError'))
        }
      } catch {
        setQuranError(t('connectionError'))
      } finally {
        setQuranLoading(false)
      }
    }

    fetchSurahs()
  }, [])

  useEffect(() => {
    if (!selectedSurah) return
    const fetchAyahs = async () => {
      try {
        setQuranLoading(true)
        setAyahs([])
        const [arabicRes, translationRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}`),
          fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/en.sahih`),
        ])
        const arabicData = await arabicRes.json()
        const translationData = await translationRes.json()
        if (arabicData.code === 200 && translationData.code === 200) {
          const arabicAyahs = arabicData.data.ayahs || []
          const translationAyahs = translationData.data.ayahs || []
          const combined: Ayah[] = arabicAyahs.map((ayah: any, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: translationAyahs[index]?.text || '',
          }))
          setAyahs(combined)
          setQuranError(null)
        } else {
          setQuranError(t('surahLoadErrorOne'))
        }
      } catch {
        setQuranError(t('connectionError'))
      } finally {
        setQuranLoading(false)
      }
    }

    fetchAyahs()
  }, [selectedSurah])

  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const getDailyReminderMessage = (date = new Date()) => {
    if (!dailyReminders?.length) return ''
    if (language !== 'fr') {
      return t('reminderBody')
    }
    const dayOfYear = getDayOfYear(date)
    return dailyReminders[(dayOfYear - 1) % dailyReminders.length]
  }

  const requestNotificationPermission = async () => {
    const current = await Notifications.getPermissionsAsync()
    if (current.status === 'granted') {
      setNotificationPermission('granted')
      return true
    }
    const result = await Notifications.requestPermissionsAsync()
    setNotificationPermission(result.status)
    return result.status === 'granted'
  }

  const cancelScheduledNotifications = async (ids: string[]) => {
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)))
  }

  const scheduleDailyReminder = async (time: Date) => {
    const previousId = await readJson<string | null>(DAILY_REMINDER_NOTIFICATION_ID_KEY, null)
    if (previousId) {
      await Notifications.cancelScheduledNotificationAsync(previousId)
    }
    const message = getDailyReminderMessage(time)
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: t('dailyReminder'),
        body: message,
        sound: 'default',
      },
      trigger: {
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true,
      },
    })
    await writeJson(DAILY_REMINDER_NOTIFICATION_ID_KEY, id)
  }

  const schedulePrayerNotifications = async () => {
    if (!prayerTimes) return
    const ids = await readJson<string[]>(PRAYER_NOTIFICATION_IDS_KEY, [])
    if (ids.length > 0) {
      await cancelScheduledNotifications(ids)
    }
    const now = new Date()
    const notificationIds: string[] = []
    const prayers = [
      { key: 'fajr', label: t('prayerFajr') },
      { key: 'dhuhr', label: t('prayerDhuhr') },
      { key: 'asr', label: t('prayerAsr') },
      { key: 'maghrib', label: t('prayerMaghrib') },
      { key: 'isha', label: t('prayerIsha') },
    ] as const

    for (const prayer of prayers) {
      if (!prayerSwitches[prayer.key]) continue
      const time = prayerTimes[prayer.key]
      if (time <= now) continue
      if (prayerReminderEnabled) {
        const reminderTime = new Date(time.getTime() - prayerReminderMinutes * 60 * 1000)
        if (reminderTime > now) {
          const reminderId = await Notifications.scheduleNotificationAsync({
            content: {
              title: t('prayerReminderTitle', { prayer: prayer.label }),
              body: t('prayerReminderBody', { prayer: prayer.label, minutes: prayerReminderMinutes }),
              sound: 'default',
            },
            trigger: reminderTime,
          })
          notificationIds.push(reminderId)
        }
      }
      if (prayerAlertsEnabled) {
        const sound =
          adhanSoundPreference === 'adhan'
            ? ADHAN_SOUNDS.find((item) => item.id === adhanSoundId)?.soundName || 'default'
            : 'default'
        const prayerId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayer.label} (${prayer.key.toUpperCase()})`,
            body: t('prayerAlertBody', { prayer: prayer.label }),
            sound,
          },
          trigger: time,
        })
        notificationIds.push(prayerId)
      }
    }

    await writeJson(PRAYER_NOTIFICATION_IDS_KEY, notificationIds)
  }

  const quickActions = useMemo(
    () => [
      { key: 'prayer' as TabKey, label: t('quickPrayer'), icon: '🕌' },
      { key: 'quran' as TabKey, label: t('quickQuran'), icon: '📖' },
      { key: 'azkar' as TabKey, label: t('quickAzkar'), icon: '📿' },
      { key: 'qibla' as TabKey, label: t('quickQibla'), icon: '🧭' },
    ],
    [t]
  )

  const bumpStat = useCallback(async (field: string) => {
    const next = await updateCounter(STATS_KEY, field, 1)
    setStats(next)
  }, [])

  const formatDuration = (totalSeconds = 0) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
  }

  useEffect(() => {
    if (!settingsLoaded) return
    writeJson(DAILY_REMINDER_KEY, dailyReminderEnabled)
    writeJson(DAILY_REMINDER_TIME_KEY, dailyReminderTime.toISOString())
    if (!dailyReminderEnabled) {
      writeJson(DAILY_REMINDER_NOTIFICATION_ID_KEY, null)
      return
    }
    if (notificationPermission !== 'granted') return
    scheduleDailyReminder(dailyReminderTime)
  }, [dailyReminderEnabled, dailyReminderTime, notificationPermission])

  useEffect(() => {
    if (!settingsLoaded) return
    writeJson(PRAYER_ALERTS_KEY, {
      alertsEnabled: prayerAlertsEnabled,
      reminderEnabled: prayerReminderEnabled,
      reminderMinutes: prayerReminderMinutes,
      soundPreference: adhanSoundPreference,
      soundId: adhanSoundId,
      switches: prayerSwitches,
    })
    if (notificationPermission !== 'granted') return
    schedulePrayerNotifications()
  }, [
    prayerAlertsEnabled,
    prayerReminderEnabled,
    prayerReminderMinutes,
    adhanSoundPreference,
    adhanSoundId,
    prayerSwitches,
    prayerTimes,
    notificationPermission,
  ])

  const toggleFavoriteVerse = async (verse: FavoriteVerse) => {
    const exists = favorites.verses.some((item) => item.id === verse.id)
    const next = {
      ...favorites,
      verses: exists
        ? favorites.verses.filter((item) => item.id !== verse.id)
        : [...favorites.verses, verse],
    }
    setFavorites(next)
    await writeJson(FAVORITES_KEY, next)
  }

  const toggleFavoriteDuaa = async (duaa: FavoriteDuaa) => {
    const exists = favorites.duaas.some((item) => item.id === duaa.id)
    const next = {
      ...favorites,
      duaas: exists
        ? favorites.duaas.filter((item) => item.id !== duaa.id)
        : [...favorites.duaas, duaa],
    }
    setFavorites(next)
    await writeJson(FAVORITES_KEY, next)
  }

  const toggleFavoriteHadith = async (hadith: FavoriteHadith) => {
    const exists = favorites.hadiths.some((item) => item.id === hadith.id)
    const next = {
      ...favorites,
      hadiths: exists
        ? favorites.hadiths.filter((item) => item.id !== hadith.id)
        : [...favorites.hadiths, hadith],
    }
    setFavorites(next)
    await writeJson(FAVORITES_KEY, next)
  }

  const playAdhanSample = async () => {
    try {
      const selected = ADHAN_SOUNDS.find((item) => item.id === adhanSoundId) ?? ADHAN_SOUNDS[0]
      const { sound } = await Audio.Sound.createAsync(selected.file)
      await sound.playAsync()
      sound.setOnPlaybackStatusUpdate((status: Audio.AVPlaybackStatus) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync()
        }
      })
    } catch {
      // Ignore playback errors silently
    }
  }

  const selectedDuaaCategoryData =
    duaaCategories.find((category) => category.key === selectedDuaaCategory) ?? duaaCategories[0]
  const selectedDuaa =
    selectedDuaaCategoryData?.items.find((item) => item.id === selectedDuaaId) ?? null
  const selectedAzkarCategoryData =
    azkarCategories.find((category) => category.key === selectedAzkarCategory) ??
    azkarCategories[0]
  const selectedAzkar =
    selectedAzkarCategoryData?.items.find((item) => item.id === selectedAzkarId) ?? null
  const selectedHadith = hadithItems.find((item) => item.id === selectedHadithId) ?? null

  const renderPrayerTimes = () => {
    if (!prayerTimes) {
      return (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textAlignStyle]}>{t('prayerTimes')}</Text>
          <Text style={[styles.sectionSubtitle, textAlignStyle]}>{status}</Text>
        </View>
      )
    }

    const rows: Array<{ label: string; key: keyof typeof prayerTimes }> = [
      { label: t('prayerFajr'), key: 'fajr' },
      { label: t('prayerSunrise'), key: 'sunrise' },
      { label: t('prayerDhuhr'), key: 'dhuhr' },
      { label: t('prayerAsr'), key: 'asr' },
      { label: t('prayerMaghrib'), key: 'maghrib' },
      { label: t('prayerIsha'), key: 'isha' },
    ]

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textAlignStyle]}>{t('prayerTimes')}</Text>
        <Text style={[styles.sectionSubtitle, textAlignStyle]}>
          {t('coordinates')}: {locationLabel}
        </Text>
        <View style={styles.card}>
          {rows.map((row) => (
            <View key={row.key} style={styles.row}>
              <Text style={[styles.rowLabel, textAlignStyle]}>{row.label}</Text>
              <Text style={styles.rowValue}>{formatTime(prayerTimes[row.key])}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textAlignStyle]}>{t('notifSection')}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, textAlignStyle]}>{t('prePrayerReminders')}</Text>
              <Switch
                value={prayerReminderEnabled}
                onValueChange={async (value) => {
                  if (value) {
                    const allowed = await requestNotificationPermission()
                    if (!allowed) return
                  }
                  setPrayerReminderEnabled(value)
                }}
              />
            </View>
            {prayerReminderEnabled && (
              <View style={styles.row}>
                <Text style={[styles.rowLabel, textAlignStyle]}>{t('minutesBefore')}</Text>
                <TextInput
                  value={String(prayerReminderMinutes)}
                  onChangeText={(value) => {
                    const minutes = Number.parseInt(value, 10)
                    if (!Number.isNaN(minutes)) setPrayerReminderMinutes(minutes)
                  }}
                  keyboardType="number-pad"
                  style={styles.inlineInput}
                />
              </View>
            )}
            <View style={styles.row}>
              <Text style={[styles.rowLabel, textAlignStyle]}>{t('adhanAlerts')}</Text>
              <Switch
                value={prayerAlertsEnabled}
                onValueChange={async (value) => {
                  if (value) {
                    const allowed = await requestNotificationPermission()
                    if (!allowed) return
                  }
                  setPrayerAlertsEnabled(value)
                }}
              />
            </View>
            {prayerAlertsEnabled && (
              <>
                <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('notificationSound')}</Text>
                <View style={styles.chipRow}>
                  {(['system', 'adhan'] as const).map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.chip,
                        adhanSoundPreference === value && styles.chipActive,
                      ]}
                      onPress={() => setAdhanSoundPreference(value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          adhanSoundPreference === value && styles.chipTextActive,
                        ]}
                      >
                        {value === 'system' ? t('systemSound') : t('adhanSound')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {adhanSoundPreference === 'adhan' && (
                  <>
                    <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('voice')}</Text>
                    <View style={styles.chipRow}>
                      {ADHAN_SOUNDS.map((sound) => (
                        <TouchableOpacity
                          key={sound.id}
                          style={[
                            styles.chip,
                            adhanSoundId === sound.id && styles.chipActive,
                          ]}
                          onPress={() => setAdhanSoundId(sound.id)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              adhanSoundId === sound.id && styles.chipTextActive,
                            ]}
                          >
                            {sound.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity style={styles.secondaryButton} onPress={playAdhanSample}>
                      <Text style={styles.secondaryButtonText}>{t('testAdhan')}</Text>
                    </TouchableOpacity>
                  </>
                )}
            </>
            )}
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textAlignStyle]}>{t('enabledPrayers')}</Text>
            <View style={styles.card}>
              {rows.map((row) => (
                <View key={row.key} style={styles.row}>
                  <Text style={[styles.rowLabel, textAlignStyle]}>{row.label}</Text>
                  <Switch
                    value={prayerSwitches[row.key as keyof typeof prayerSwitches]}
                    onValueChange={(value) =>
                      setPrayerSwitches((prev) => ({ ...prev, [row.key]: value }))
                    }
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    )
  }

  const renderQuranSelected = () => {
    if (!selectedSurah) return null
    const header = (
      <View style={[styles.quranHeader, isRTL && styles.quranHeaderRTL]}>
        <TouchableOpacity
          style={[styles.backButton, isRTL && styles.backButtonRTL]}
          onPress={() => setSelectedSurah(null)}
        >
          <Text style={[styles.backButtonText, textAlignStyle]}>{t('backToSurahs')}</Text>
        </TouchableOpacity>
        <View style={styles.quranHeaderTitles}>
          <Text style={[styles.sectionTitle, textAlignStyle]}>{selectedSurah.arabic}</Text>
          <Text style={[styles.sectionSubtitle, textAlignStyle]}>
            {selectedSurah.name} · {selectedSurah.english}
          </Text>
        </View>
      </View>
    )

    const body = (
      <View style={styles.section}>
        {language === 'en' && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowTranslation((prev) => !prev)}
          >
            <Text style={styles.toggleButtonText}>
              {showTranslation ? t('hideTranslation') : t('showTranslation')}
            </Text>
          </TouchableOpacity>
        )}
        {quranLoading ? (
          <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('loading')}</Text>
        ) : quranError ? (
          <Text style={[styles.sectionSubtitle, textAlignStyle]}>{quranError}</Text>
        ) : (
          <View style={styles.list}>
            {ayahs.map((ayah) => {
              const verseId = `${selectedSurah.number}-${ayah.number}`
              const isFavorite = favorites.verses.some((item) => item.id === verseId)
              return (
                <View key={verseId} style={styles.card}>
                  <View style={styles.row}>
                    <Text style={[styles.rowLabel, textAlignStyle]}>
                      {t('ayahLabel')} {ayah.number}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        toggleFavoriteVerse({
                          id: verseId,
                          surahNumber: selectedSurah.number,
                          surahName: selectedSurah.name,
                          ayahNumber: ayah.number,
                          text: ayah.text,
                          translation: ayah.translation,
                        })
                      }
                    >
                      <Text style={styles.favoriteIcon}>{isFavorite ? '★' : '☆'}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.arabicText}>{ayah.text}</Text>
                  {showTranslation && language === 'en' && (
                    <Text style={styles.translationText}>{ayah.translation}</Text>
                  )}
                </View>
              )
            })}
          </View>
        )}
      </View>
    )

    return { header, body }
  }

  const renderQuran = () => {
    if (selectedSurah) {
      const parts = renderQuranSelected()
      return parts ? [parts.header, parts.body] : null
    }

    const filteredSurahs = surahs.filter((surah) => {
      if (!quranSearch) return true
      const query = quranSearch.toLowerCase()
      return (
        surah.name.toLowerCase().includes(query) ||
        surah.english.toLowerCase().includes(query) ||
        surah.arabic.includes(quranSearch)
      )
    })

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textAlignStyle]}>{t('quranTitle')}</Text>
        <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('chooseSurah')}</Text>
        <TextInput
          value={quranSearch}
          onChangeText={setQuranSearch}
          placeholder={t('searchSurah')}
          style={[styles.searchInput, textAlignStyle]}
          placeholderTextColor="#6b6257"
        />
        {quranLoading && <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('loading')}</Text>}
        {quranError && <Text style={[styles.sectionSubtitle, textAlignStyle]}>{quranError}</Text>}
        <View style={styles.list}>
          {filteredSurahs.map((surah) => (
            <TouchableOpacity
              key={surah.number}
              style={styles.listCard}
              onPress={() => {
                setSelectedSurah(surah)
                bumpStat('quranReads')
                updateCounter(STATS_KEY, 'quranAyahs', surah.ayahs).then(setStats)
                const nextReads = {
                  ...lastReads,
                  quran: { surahNumber: surah.number, surahName: surah.name },
                }
                setLastReads(nextReads)
                writeJson(LAST_READS_KEY, nextReads)
              }}
            >
              <Text style={styles.listTitle}>
                {surah.number}. {surah.name}
              </Text>
              <Text style={styles.listSubtitle}>{surah.arabic}</Text>
              <Text style={styles.listMeta}>{t('ayahsCount', { count: surah.ayahs })}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  const renderDuaas = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, textAlignStyle]}>{t('duaasTitle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {duaaCategories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.chip,
              selectedDuaaCategory === category.key && styles.chipActive,
            ]}
            onPress={() => {
              setSelectedDuaaCategory(category.key)
              setSelectedDuaaId(null)
            }}
          >
            <Text
              style={[
                styles.chipText,
                selectedDuaaCategory === category.key && styles.chipTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedDuaa ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={[styles.sectionTitle, textAlignStyle]}>{selectedDuaa.title}</Text>
            <TouchableOpacity
              onPress={() => toggleFavoriteDuaa(selectedDuaa)}
            >
              <Text style={styles.favoriteIcon}>
                {favorites.duaas.some((item) => item.id === selectedDuaa.id) ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.arabicText}>{selectedDuaa.arabic}</Text>
          {language !== 'ar' && (
            <Text style={styles.translationText}>{selectedDuaa.transliteration}</Text>
          )}
          {language === 'fr' && (
            <Text style={styles.translationText}>{selectedDuaa.translation}</Text>
          )}
          <Text style={styles.listMeta}>{selectedDuaa.reference}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setSelectedDuaaId(null)}
          >
            <Text style={styles.secondaryButtonText}>{t('backToList')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.list}>
          {selectedDuaaCategoryData?.items.map((duaa) => (
            <TouchableOpacity
              key={duaa.id}
              style={styles.listCard}
              onPress={() => {
                setSelectedDuaaId(duaa.id)
                bumpStat('duaaReads')
                const nextReads = { ...lastReads, duaa: { id: duaa.id, title: duaa.title } }
                setLastReads(nextReads)
                writeJson(LAST_READS_KEY, nextReads)
              }}
            >
              <Text style={styles.listTitle}>{duaa.title}</Text>
              <Text style={styles.listSubtitle}>{duaa.reference}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )

  const renderAzkar = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, textAlignStyle]}>{t('azkarTitle')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {azkarCategories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.chip,
              selectedAzkarCategory === category.key && styles.chipActive,
            ]}
            onPress={() => {
              setSelectedAzkarCategory(category.key)
              setSelectedAzkarId(null)
            }}
          >
            <Text
              style={[
                styles.chipText,
                selectedAzkarCategory === category.key && styles.chipTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedAzkar ? (
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, textAlignStyle]}>{selectedAzkar.title}</Text>
          <Text style={styles.arabicText}>{selectedAzkar.arabic}</Text>
          {language !== 'ar' && (
            <Text style={styles.translationText}>{selectedAzkar.transliteration}</Text>
          )}
          {language === 'fr' && (
            <Text style={styles.translationText}>{selectedAzkar.translation}</Text>
          )}
          {selectedAzkar.reference && (
            <Text style={styles.listMeta}>{selectedAzkar.reference}</Text>
          )}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setSelectedAzkarId(null)}
          >
            <Text style={styles.secondaryButtonText}>{t('backToList')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.list}>
          {selectedAzkarCategoryData?.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.listCard}
              onPress={() => {
                setSelectedAzkarId(item.id)
                bumpStat('azkarReads')
              }}
            >
              <Text style={styles.listTitle}>{item.title}</Text>
              {item.reference && <Text style={styles.listSubtitle}>{item.reference}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )

  const renderTasbih = () => {
    const dhikrs = {
      SubhanAllah: {
        label: 'SubhanAllah',
        arabic: 'سُبْحَانَ اللَّهِ',
        target: 33,
      },
      Alhamdulillah: {
        label: 'Alhamdulillah',
        arabic: 'الْحَمْدُ لِلَّهِ',
        target: 33,
      },
      AllahuAkbar: {
        label: 'Allahu Akbar',
        arabic: 'اللَّهُ أَكْبَرُ',
        target: 33,
      },
    }
    const current = dhikrs[selectedDhikr]
    const handleCount = async () => {
      const next = tasbihCount + 1
      setTasbihCount(next)
      const total = tasbihSessionTotal + 1
      setTasbihSessionTotal(total)
      await writeJson(TASBIH_KEY, total)
      bumpStat('tasbihCounts')
      if (next >= current.target) {
        setTasbihCount(0)
      }
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textAlignStyle]}>{t('tasbihTitle')}</Text>
        <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('tasbihSubtitle')}</Text>
        <View style={styles.card}>
          <Text style={styles.arabicText}>{current.arabic}</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, textAlignStyle]}>{t('counter')}</Text>
            <Text style={styles.rowValue}>
              {tasbihCount}/{current.target}
            </Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCount}>
            <Text style={styles.primaryButtonText}>{t('countButton')}</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, textAlignStyle]}>{t('sessionTotal')}</Text>
            <Text style={styles.rowValue}>{tasbihSessionTotal}</Text>
          </View>
        </View>
        <View style={styles.chipRow}>
          {Object.keys(dhikrs).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, selectedDhikr === key && styles.chipActive]}
              onPress={() => {
                setSelectedDhikr(key as typeof selectedDhikr)
                setTasbihCount(0)
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedDhikr === key && styles.chipTextActive,
                ]}
              >
                {dhikrs[key as keyof typeof dhikrs].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  const renderHadiths = () => {
    if (selectedHadith) {
      return (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedHadithId(null)}
          >
            <Text style={[styles.backButtonText, textAlignStyle]}>{t('backToHadiths')}</Text>
          </TouchableOpacity>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={[styles.sectionTitle, textAlignStyle]}>{selectedHadith.title}</Text>
              <TouchableOpacity
                onPress={() => toggleFavoriteHadith(selectedHadith)}
              >
                <Text style={styles.favoriteIcon}>
                  {favorites.hadiths.some((item) => item.id === selectedHadith.id) ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.arabicText}>{selectedHadith.arabic}</Text>
            {language !== 'ar' && (
              <Text style={styles.translationText}>{selectedHadith.transliteration}</Text>
            )}
            {language === 'en' && (
              <Text style={styles.translationText}>{selectedHadith.translation}</Text>
            )}
            <Text style={styles.listMeta}>
              {selectedHadith.collection} · {selectedHadith.reference}
            </Text>
          </View>
        </View>
      )
    }

    const filtered = hadithItems.filter((hadith) => {
      if (!hadithSearch) return true
      const query = hadithSearch.toLowerCase()
      return (
        hadith.title.toLowerCase().includes(query) ||
        hadith.collection.toLowerCase().includes(query) ||
        hadith.arabic.includes(hadithSearch) ||
        hadith.translation.toLowerCase().includes(query)
      )
    })
    const visibleItems = hadithSearch ? filtered : filtered.slice(0, hadithVisibleCount)

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textAlignStyle]}>{t('hadithsTitle')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {HADITH_COLLECTIONS.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              style={[
                styles.chip,
                selectedHadithCollection === collection.id && styles.chipActive,
              ]}
              onPress={() => {
                setSelectedHadithCollection(collection.id)
                setSelectedHadithId(null)
                setHadithHasMore(true)
                setHadithVisibleCount(HADITH_BATCH_SIZE)
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedHadithCollection === collection.id && styles.chipTextActive,
                ]}
              >
                {collection.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TextInput
          value={hadithSearch}
          onChangeText={setHadithSearch}
          placeholder={t('searchHadith')}
          style={[styles.searchInput, textAlignStyle]}
          placeholderTextColor="#6b6257"
        />
        <Text style={[styles.sectionSubtitle, textAlignStyle]}>
          {hadithSearch
            ? `${t('results')}: ${filtered.length}`
            : `${t('shown')}: ${Math.min(visibleItems.length, hadithItems.length)} / ${hadithItems.length}`}
        </Text>
        {hadithLoading && <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('loading')}</Text>}
        {hadithError && <Text style={[styles.sectionSubtitle, textAlignStyle]}>{hadithError}</Text>}
        <View style={styles.list}>
          {visibleItems.map((hadith) => (
            <TouchableOpacity
              key={hadith.id}
              style={styles.listCard}
              onPress={() => {
                setSelectedHadithId(hadith.id)
                bumpStat('hadithReads')
                const nextReads = { ...lastReads, hadith: { id: hadith.id, title: hadith.title } }
                setLastReads(nextReads)
                writeJson(LAST_READS_KEY, nextReads)
              }}
            >
              <Text style={styles.listTitle}>{hadith.title}</Text>
              <Text style={styles.listSubtitle}>{hadith.collection}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {hadithHasMore && !hadithSearch && filtered.length > hadithVisibleCount && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              if (hadithLoading) return
              const nextCount = Math.min(hadithVisibleCount + HADITH_BATCH_SIZE, hadithItems.length)
              setHadithVisibleCount(nextCount)
              setHadithHasMore(nextCount < hadithItems.length)
            }}
          >
            <Text style={styles.secondaryButtonText}>{t('loadMore')}</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderCalendar = () => {
    const today = new Date()
    const hijri = new HijriDate(today)
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textAlignStyle]}>{t('calendarTitle')}</Text>
        <View style={styles.card}>
          <Text style={styles.listTitle}>{format(today, 'EEEE d MMMM yyyy')}</Text>
          <Text style={styles.listSubtitle}>
            {hijri.getDate()} / {hijri.getMonth() + 1} / {hijri.getFullYear()} AH
          </Text>
        </View>
      </View>
    )
  }

  const renderFavorites = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, textAlignStyle]}>{t('favoritesTitle')}</Text>
      <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('favoritesSubtitle')}</Text>
      {favorites.verses.length === 0 && favorites.duaas.length === 0 && favorites.hadiths.length === 0 ? (
        <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('noFavorites')}</Text>
      ) : (
        <View style={styles.list}>
          {favorites.verses.map((item) => (
            <View key={item.id} style={styles.listCard}>
              <View style={styles.row}>
                <Text style={styles.listTitle}>
                  {item.surahName} · {t('ayahLabel')} {item.ayahNumber}
                </Text>
                <TouchableOpacity onPress={() => toggleFavoriteVerse(item)}>
                  <Text style={styles.favoriteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.arabicText}>{item.text}</Text>
              {language === 'en' && item.translation && (
                <Text style={styles.translationText}>{item.translation}</Text>
              )}
            </View>
          ))}
          {favorites.duaas.map((item) => (
            <View key={`duaa-${item.id}`} style={styles.listCard}>
              <View style={styles.row}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => toggleFavoriteDuaa(item)}>
                  <Text style={styles.favoriteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.arabicText}>{item.arabic}</Text>
              {language === 'fr' && (
                <Text style={styles.translationText}>{item.translation}</Text>
              )}
            </View>
          ))}
          {favorites.hadiths.map((item) => (
            <View key={`hadith-${item.id}`} style={styles.listCard}>
              <View style={styles.row}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => toggleFavoriteHadith(item)}>
                  <Text style={styles.favoriteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.arabicText}>{item.arabic}</Text>
              {language === 'en' && (
                <Text style={styles.translationText}>{item.translation}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  )

  const renderStats = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, textAlignStyle]}>{t('statsTitle')}</Text>
      <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('statsSubtitle')}</Text>
      <View style={styles.list}>
        {[
          {
            key: 'quran',
            icon: '📖',
            label: t('statsQuran'),
            value: Math.ceil((stats.quranAyahs || 0) / 20),
            last: lastReads.quran ? `${lastReads.quran.surahName}` : t('statsNone'),
          },
          {
            key: 'duaa',
            icon: '🤲',
            label: t('statsDuaas'),
            value: stats.duaaReads || 0,
            last: lastReads.duaa ? `${lastReads.duaa.title}` : t('statsNone'),
          },
          {
            key: 'azkar',
            icon: '📿',
            label: t('statsAzkar'),
            value: stats.azkarReads || 0,
            last: t('statsNone'),
          },
          {
            key: 'hadith',
            icon: '📚',
            label: t('statsHadiths'),
            value: stats.hadithReads || 0,
            last: lastReads.hadith ? `${lastReads.hadith.title}` : t('statsNone'),
          },
          {
            key: 'tasbih',
            icon: '🧿',
            label: t('statsTasbih'),
            value: stats.tasbihCounts || 0,
            last: t('sessionTotal'),
          },
        ].map((item) => (
          <View key={item.key} style={styles.listCard}>
            <View style={styles.row}>
              <Text style={styles.actionIcon}>{item.icon}</Text>
              <Text style={[styles.listTitle, textAlignStyle]}>{item.label}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
            <Text style={[styles.listSubtitle, textAlignStyle]}>
              {t('statsLastRead')}: {item.last}
            </Text>
            <View style={styles.row}>
              <Text style={[styles.rowLabel, textAlignStyle]}>
                {item.key === 'quran' ? t('statsPages') : t('statsTime')}
              </Text>
              <Text style={styles.rowValue}>
                {item.key === 'quran'
                  ? Math.max(0, Math.ceil((stats.quranAyahs || 0) / 20))
                  : formatDuration(stats[`time_${item.key}`] || 0)}
              </Text>
            </View>
            {item.key === 'quran' && (
              <View style={styles.row}>
                <Text style={[styles.rowLabel, textAlignStyle]}>{t('statsTime')}</Text>
                <Text style={styles.rowValue}>
                  {formatDuration(stats.time_quran || 0)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  )

  const renderQibla = () => {
    const rotationAvailable = heading !== null && qiblaHeading !== null
    const animatedRotation = needleRotation.current.interpolate({
      inputRange: [-720, 720],
      outputRange: ['-720deg', '720deg'],
    })
    const animatedFaceRotation = faceRotation.current.interpolate({
      inputRange: [-720, 720],
      outputRange: ['-720deg', '720deg'],
    })
    const ticks = Array.from({ length: 60 }, (_, index) => index)

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textAlignStyle]}>{t('qiblaTitle')}</Text>
        <View style={styles.card}>
          <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('qiblaOrientation')}</Text>
          {!rotationAvailable ? (
            <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('qiblaUnavailable')}</Text>
          ) : (
            <View style={styles.compassContainer}>
              <View style={styles.compassCircle}>
                <Animated.View style={[styles.compassFace, { transform: [{ rotate: animatedFaceRotation }] }]}>
                  {ticks.map((tick) => (
                    <View
                      key={`tick-${tick}`}
                      style={[
                        styles.compassTick,
                        tick % 5 === 0 ? styles.compassTickMajor : styles.compassTickMinor,
                        { transform: [{ rotate: `${tick * 6}deg` }] },
                      ]}
                    />
                  ))}
                  <Text style={[styles.compassCardinal, styles.compassNorth]}>N</Text>
                  <Text style={[styles.compassCardinal, styles.compassEast]}>E</Text>
                  <Text style={[styles.compassCardinal, styles.compassSouth]}>S</Text>
                  <Text style={[styles.compassCardinal, styles.compassWest]}>W</Text>
                </Animated.View>
                <Animated.View style={[styles.compassNeedle, { transform: [{ rotate: animatedRotation }] }]}>
                  <View style={styles.compassNeedleHead} />
                  <Text style={styles.compassKaaba}>🕋</Text>
                  <View style={styles.compassNeedleShaft} />
                </Animated.View>
              </View>
            </View>
          )}
          <Text style={styles.qiblaValue}>
            {qiblaHeading === null ? '—' : `${qiblaHeading.toFixed(0)}°`}
          </Text>
          {headingAccuracy !== null && rotationAvailable && (
          <Text style={styles.sectionSubtitle}>
              {t('qiblaAccuracy')}: ±{Math.round(headingAccuracy)}°
          </Text>
          )}
          <Text style={[styles.sectionSubtitle, textAlignStyle]}>{t('qiblaHint')}</Text>
        </View>
      </View>
    )
  }

  const renderDailyReminder = () => {
    const reminder = getDailyReminderMessage(new Date())
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textAlignStyle]}>{t('dailyReminder')}</Text>
        <View style={styles.card}>
          <Text style={styles.translationText}>{reminder}</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, textAlignStyle]}>{t('notifications')}</Text>
            <Switch
              value={dailyReminderEnabled}
              onValueChange={async (value) => {
                if (value) {
                  const allowed = await requestNotificationPermission()
                  if (!allowed) return
                }
                setDailyReminderEnabled(value)
              }}
            />
          </View>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowDailyPicker(true)}
          >
            <Text style={styles.secondaryButtonText}>
              {t('timeLabel')}: {format(dailyReminderTime, 'HH:mm')}
            </Text>
          </TouchableOpacity>
          {showDailyPicker && (
            <DateTimePicker
              mode="time"
              value={dailyReminderTime}
              onChange={(_: unknown, date?: Date) => {
                setShowDailyPicker(false)
                if (date) setDailyReminderTime(date)
              }}
            />
          )}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={async () => {
              const allowed = notificationPermission === 'granted' || (await requestNotificationPermission())
              if (!allowed) return
              await Notifications.presentNotificationAsync({
                title: t('dailyReminder'),
                body: reminder,
              })
            }}
          >
            <Text style={styles.primaryButtonText}>{t('testNotification')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderLanguage = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, textAlignStyle]}>{t('languageTitle')}</Text>
      <View style={styles.card}>
        <View style={styles.chipRow}>
          {(['fr', 'en', 'ar'] as const).map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.chip, language === value && styles.chipActive]}
              onPress={() => setLanguage(value)}
            >
              <Text style={[styles.chipText, language === value && styles.chipTextActive]}>
                {value.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  const getDaysUntilRamadan = () => {
    const today = new Date()
    for (let offset = 0; offset < 370; offset += 1) {
      const check = new Date(today)
      check.setDate(today.getDate() + offset)
      const hijri = new HijriDate(check)
      if (hijri.getMonth() + 1 === 9 && hijri.getDate() === 1) {
        return offset
      }
    }
    return null
  }

  const renderHome = () => (
    <View>
      <View style={styles.hero}>
        <Text style={[styles.heroTitle, textAlignStyle]}>{t('heroTitle')}</Text>
        <Text style={[styles.heroSubtitle, textAlignStyle]}>{t('heroSubtitle')}</Text>
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardLabel, textAlignStyle]}>{t('nextPrayer')}</Text>
        <Text style={styles.cardValue}>{nextPrayerLabel}</Text>
        <Text style={styles.cardTime}>{nextPrayerTime}</Text>
      </View>
      {renderDailyReminder()}
      {(lastReads.quran || lastReads.duaa || lastReads.hadith) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, textAlignStyle]}>{t('continueReading')}</Text>
          <View style={styles.list}>
            {lastReads.quran && (
              <TouchableOpacity
                style={styles.listCard}
                onPress={() => {
                  const surah = surahs.find((item) => item.number === lastReads.quran?.surahNumber)
                  if (surah) setSelectedSurah(surah)
                  setActiveTab('quran')
                }}
              >
                <Text style={[styles.listTitle, textAlignStyle]}>
                  {t('tabQuran')} · {lastReads.quran.surahName}
                </Text>
                <Text style={[styles.listSubtitle, textAlignStyle]}>{t('resume')}</Text>
              </TouchableOpacity>
            )}
            {lastReads.duaa && (
              <TouchableOpacity
                style={styles.listCard}
                onPress={() => {
                  setActiveTab('duaas')
                  setSelectedDuaaId(lastReads.duaa?.id ?? null)
                }}
              >
                <Text style={[styles.listTitle, textAlignStyle]}>
                  {t('tabDuaas')} · {lastReads.duaa.title}
                </Text>
                <Text style={[styles.listSubtitle, textAlignStyle]}>{t('resume')}</Text>
              </TouchableOpacity>
            )}
            {lastReads.hadith && (
              <TouchableOpacity
                style={styles.listCard}
                onPress={() => {
                  setActiveTab('hadiths')
                  setSelectedHadithId(lastReads.hadith?.id ?? null)
                }}
              >
                <Text style={[styles.listTitle, textAlignStyle]}>
                  {t('tabHadiths')} · {lastReads.hadith.title}
                </Text>
                <Text style={[styles.listSubtitle, textAlignStyle]}>{t('resume')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
      {(() => {
        const hijri = new HijriDate(new Date())
        const isRamadan = hijri.getMonth() + 1 === 9
        const daysUntilRamadan = isRamadan ? 0 : getDaysUntilRamadan()
        return (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, textAlignStyle]}>{t('ramadanTitle')}</Text>
            <View style={styles.card}>
              {isRamadan ? (
                <Text style={[styles.listTitle, textAlignStyle]}>{t('ramadanKareem')}</Text>
              ) : (
                <Text style={[styles.listTitle, textAlignStyle]}>
                  {daysUntilRamadan !== null
                    ? t('ramadanIn', { days: daysUntilRamadan })
                    : t('ramadanNext')}
                </Text>
              )}
              <Text style={[styles.listSubtitle, textAlignStyle]}>{t('ramadanPrompt')}</Text>
            </View>
          </View>
        )
      })()}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, textAlignStyle]}>{t('shortcuts')}</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionCard}
              onPress={() => setActiveTab(action.key)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome()
      case 'prayer':
        return renderPrayerTimes()
      case 'quran':
        return renderQuran()
      case 'duaas':
        return renderDuaas()
      case 'azkar':
        return renderAzkar()
      case 'tasbih':
        return renderTasbih()
      case 'hadiths':
        return renderHadiths()
      case 'calendar':
        return renderCalendar()
      case 'favorites':
        return renderFavorites()
      case 'stats':
        return renderStats()
      case 'qibla':
        return renderQibla()
      case 'language':
        return renderLanguage()
      default:
        return renderHome()
    }
  }

  const content = renderContent()
  const stickyHeaderIndices =
    activeTab === 'quran' && selectedSurah ? [0] : undefined

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={stickyHeaderIndices}
      >
        {content}
      </ScrollView>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1e8',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 180,
  },
  hero: {
    paddingVertical: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1714',
  },
  heroSubtitle: {
    marginTop: 6,
    color: '#6b6257',
    fontSize: 14,
  },
  card: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
    shadowColor: '#120e0a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cardLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#6b6257',
  },
  cardValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1714',
  },
  cardTime: {
    marginTop: 4,
    fontSize: 16,
    color: '#1a1714',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1714',
  },
  sectionSubtitle: {
    marginTop: 6,
    color: '#6b6257',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    color: '#1a1714',
    fontSize: 15,
  },
  rowValue: {
    color: '#1a1714',
    fontWeight: '600',
  },
  actionGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flexBasis: '48%',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    marginTop: 8,
    color: '#1a1714',
    fontWeight: '600',
  },
  list: {
    marginTop: 12,
    gap: 12,
  },
  listCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1714',
  },
  listSubtitle: {
    marginTop: 4,
    color: '#6b6257',
    fontSize: 13,
  },
  listMeta: {
    marginTop: 8,
    color: '#8a7f71',
    fontSize: 12,
  },
  arabicText: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'right',
    fontFamily: 'Times New Roman',
    color: '#1a1714',
  },
  translationText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b6257',
  },
  searchInput: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5ded0',
    backgroundColor: '#fffdf8',
    color: '#1a1714',
  },
  inlineInput: {
    minWidth: 56,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5ded0',
    backgroundColor: '#fffdf8',
    textAlign: 'center',
    color: '#1a1714',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonRTL: {
    marginRight: 0,
    marginLeft: 12,
  },
  backButtonText: {
    color: '#6b6257',
  },
  toggleButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#efe6d8',
  },
  toggleButtonText: {
    color: '#1a1714',
    fontSize: 12,
    fontWeight: '600',
  },
  chipRow: {
    marginTop: 12,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#efe6d8',
    borderColor: '#c9aa5a',
  },
  chipText: {
    color: '#6b6257',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#1a1714',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1c1a17',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#efe6d8',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1a1714',
    fontWeight: '600',
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#c9aa5a',
  },
  qiblaValue: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1714',
  },
  compassContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  compassCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 110,
  },
  compassTick: {
    position: 'absolute',
    top: 8,
    left: '50%',
    backgroundColor: '#c9aa5a',
  },
  compassTickMajor: {
    width: 3,
    height: 16,
    transform: [{ translateX: -1.5 }],
  },
  compassTickMinor: {
    width: 2,
    height: 10,
    transform: [{ translateX: -1 }],
    opacity: 0.6,
  },
  compassCardinal: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1714',
  },
  compassNorth: {
    top: 12,
    left: '50%',
    transform: [{ translateX: -6 }],
  },
  compassEast: {
    right: 14,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  compassSouth: {
    bottom: 10,
    left: '50%',
    transform: [{ translateX: -6 }],
  },
  compassWest: {
    left: 14,
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  compassNeedle: {
    width: 24,
    height: 140,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compassNeedleHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#c0392b',
    marginBottom: 6,
  },
  compassKaaba: {
    fontSize: 24,
  },
  compassNeedleShaft: {
    width: 3,
    flex: 1,
    backgroundColor: '#1a1714',
    borderRadius: 2,
    marginTop: 6,
  },
  compassNeedleTail: {
    width: 2,
    height: 40,
    backgroundColor: '#1a1714',
  },
  placeholderCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5ded0',
    backgroundColor: '#fffdf8',
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1714',
  },
  placeholderText: {
    marginTop: 6,
    color: '#6b6257',
    fontSize: 13,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fffdf8',
    borderTopWidth: 1,
    borderTopColor: '#e5ded0',
    gap: 6,
  },
  quranHeader: {
    paddingTop: 6,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f1e8',
  },
  quranHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  quranHeaderTitles: {
    flex: 1,
  },
  tabItem: {
    flexBasis: '23%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: '#f0e8da',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#6b6257',
  },
  tabLabelActive: {
    color: '#1a1714',
    fontWeight: '600',
  },
})
