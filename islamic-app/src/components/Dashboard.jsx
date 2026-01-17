import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan'
import { format, addDays } from 'date-fns'
import HijriDate from 'hijri-date'
import { useBookmarks } from '../contexts/BookmarksContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useReadingTracker } from '../contexts/ReadingTrackerContext'
import dailyReminders from '../data/dailyReminders'
import { getDailyReminder } from '../utils/dailyReminder'
import './Dashboard.css'

const Dashboard = () => {
  const [location, setLocation] = useState({ latitude: 51.5074, longitude: -0.1278 })
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [nextPrayer, setNextPrayer] = useState(null)
  const [hijriDate, setHijriDate] = useState(null)
  const { bookmarks } = useBookmarks()
  const { t } = useLanguage()
  const { getLastPosition } = useReadingTracker()
  const [dailyNotificationsEnabled, setDailyNotificationsEnabled] = useState(() => {
    return localStorage.getItem('dailyReminderNotificationsEnabled') === 'true'
  })
  const [dailyReminderTime, setDailyReminderTime] = useState(() => {
    return localStorage.getItem('dailyReminderTime') || '09:00'
  })
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
  })
  const notificationTimeoutRef = useRef(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => {}
      )
    }
  }, [])

  useEffect(() => {
    try {
      const hijri = new HijriDate(new Date())
      const monthNames = [
        'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
      ]
      setHijriDate({
        day: hijri.getDate(),
        month: monthNames[hijri.getMonth()],
        monthNumber: hijri.getMonth() + 1,
        year: hijri.getFullYear()
      })
    } catch (error) {
      console.error('Error converting to Hijri:', error)
    }
  }, [])

  useEffect(() => {
    if (location.latitude && location.longitude) {
      const coordinates = new Coordinates(location.latitude, location.longitude)
      const date = new Date()
      const params = CalculationMethod.MuslimWorldLeague()
      const today = new AdhanPrayerTimes(coordinates, date, params)

      const prayers = {
        fajr: today.fajr,
        sunrise: today.sunrise,
        dhuhr: today.dhuhr,
        asr: today.asr,
        maghrib: today.maghrib,
        isha: today.isha,
      }

      setPrayerTimes(prayers)

      const now = new Date()
      const prayerNames = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
      const prayerTimesArray = prayerNames.map(name => ({
        name,
        time: prayers[name],
      }))

      let next = null
      for (let i = 0; i < prayerTimesArray.length; i++) {
        if (now < prayerTimesArray[i].time) {
          next = prayerTimesArray[i]
          break
        }
      }

      if (!next) {
        const tomorrow = new Date(date)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowPrayers = new AdhanPrayerTimes(coordinates, tomorrow, params)
        next = { name: 'fajr', time: tomorrowPrayers.fajr }
      }

      setNextPrayer(next)
    }
  }, [location])

  const getTimeUntilNext = () => {
    if (!nextPrayer) return null
    const now = new Date()
    const diff = nextPrayer.time.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes }
  }

  const timeUntil = getTimeUntilNext()

  const prayerLabels = {
    fajr: { name: 'Fajr', icon: '🌅', arabic: 'الفجر' },
    sunrise: { name: 'Sunrise', icon: '☀️', arabic: 'الشروق' },
    dhuhr: { name: 'Dhuhr', icon: '☀️', arabic: 'الظهر' },
    asr: { name: 'Asr', icon: '🌤️', arabic: 'العصر' },
    maghrib: { name: 'Maghrib', icon: '🌇', arabic: 'المغرب' },
    isha: { name: 'Isha', icon: '🌙', arabic: 'العشاء' },
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('goodMorning')
    if (hour < 18) return t('goodAfternoon')
    return t('goodEvening')
  }

  const today = new Date()
  const dailyReminder = getDailyReminder(dailyReminders, today)
  const lastQuran = getLastPosition('quran')
  const lastHadith = getLastPosition('hadiths')
  const lastDuaa = getLastPosition('duaas')
  const isRamadan = hijriDate?.monthNumber === 9

  const getRamadanCountdown = () => {
    for (let offset = 0; offset < 370; offset += 1) {
      const checkDate = addDays(today, offset)
      const hijri = new HijriDate(checkDate)
      if (hijri.getMonth() + 1 === 9 && hijri.getDate() === 1) {
        return offset
      }
    }
    return null
  }

  const daysUntilRamadan = isRamadan ? 0 : getRamadanCountdown()

  const registerPeriodicSync = async () => {
    if (!('serviceWorker' in navigator)) return
    try {
      const registration = await navigator.serviceWorker.ready
      if ('periodicSync' in registration) {
        await registration.periodicSync.register('daily-reminder', {
          minInterval: 24 * 60 * 60 * 1000,
        })
      }
    } catch (error) {
      console.warn('Periodic sync registration failed:', error)
    }
  }

  const showDailyNotification = async (date = new Date(), isTest = false) => {
    if (notificationPermission !== 'granted') return
    const reminder = getDailyReminder(dailyReminders, date)
    const options = {
      body: isTest ? `${reminder} (test)` : reminder,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: isTest ? 'daily-reminder-test' : 'daily-reminder',
      data: { url: '/' },
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(t('dailyReminder'), options)
      return
    }

    new Notification(t('dailyReminder'), options)
  }

  const scheduleNextDailyNotification = () => {
    if (notificationPermission !== 'granted' || !dailyNotificationsEnabled) return
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }

    const now = new Date()
    const next = new Date()
    const [hours, minutes] = dailyReminderTime.split(':').map((value) => Number.parseInt(value, 10))
    next.setHours(hours, minutes, 0, 0)
    if (now >= next) {
      next.setDate(next.getDate() + 1)
    }

    const delay = next.getTime() - now.getTime()
    notificationTimeoutRef.current = window.setTimeout(() => {
      showDailyNotification(next)
      scheduleNextDailyNotification()
    }, delay)
  }

  const requestDailyReminderPermission = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
    if (permission === 'granted') {
      setDailyNotificationsEnabled(true)
      localStorage.setItem('dailyReminderNotificationsEnabled', 'true')
      scheduleNextDailyNotification()
      registerPeriodicSync()
    }
  }

  useEffect(() => {
    if (dailyNotificationsEnabled && notificationPermission === 'granted') {
      scheduleNextDailyNotification()
      registerPeriodicSync()
    }

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [dailyNotificationsEnabled, notificationPermission, dailyReminderTime])

  const hasLocation = location.latitude && location.longitude

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🌅 {getGreeting()}</h1>
        <div className="dashboard-meta">
          <p className="dashboard-date">
            {format(today, 'EEEE, MMMM d, yyyy')}
            {hijriDate && (
              <span className="hijri-date"> • {hijriDate.day} {hijriDate.month} {hijriDate.year} AH</span>
            )}
          </p>
          {hasLocation && (
            <div className="location-pill">
              <span className="location-label">📍 {t('location')}</span>
              <span className="location-coords">
                {t('latitude')} {location.latitude.toFixed(2)} • {t('longitude')} {location.longitude.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        {nextPrayer && timeUntil && (
          <div className="dashboard-card next-prayer-card">
            <div className="card-icon">{prayerLabels[nextPrayer.name]?.icon}</div>
            <div className="card-content">
              <h3>{t('nextPrayer')}</h3>
              <h2>{prayerLabels[nextPrayer.name]?.name}</h2>
              <p className="arabic-text">{prayerLabels[nextPrayer.name]?.arabic}</p>
              <div className="countdown">
                {timeUntil.hours}h {timeUntil.minutes}m
              </div>
              <p className="prayer-time">{t('at')} {format(nextPrayer.time, 'h:mm a')}</p>
            </div>
            <Link to="/prayer-times" className="card-link">{t('viewAll')} →</Link>
          </div>
        )}

        <Link to="/quran" className="dashboard-card quick-link-card">
          <div className="card-icon">📖</div>
          <div className="card-content">
            <h3>{t('readQuran')}</h3>
            <p>
              {lastQuran
                ? `${lastQuran.surahName} • ${t('ayah')} ${lastQuran.ayahNumber}`
                : t('continueReading')}
            </p>
          </div>
        </Link>

        <Link to="/tasbih" className="dashboard-card quick-link-card">
          <div className="card-icon">📿</div>
          <div className="card-content">
            <h3>{t('dhikrCounter')}</h3>
            <p>{t('countRemembrance')}</p>
          </div>
        </Link>

        <Link to="/favorites" className="dashboard-card favorites-card">
          <div className="card-icon">⭐</div>
          <div className="card-content">
            <h3>{t('myFavorites2')}</h3>
            <p>
              {bookmarks.verses.length} {t('verses')} • {bookmarks.duas.length} {t('duas')}
            </p>
          </div>
        </Link>

        <Link to="/hadiths" className="dashboard-card quick-link-card">
          <div className="card-icon">📚</div>
          <div className="card-content">
            <h3>{t('hadiths')}</h3>
            <p>
              {lastHadith
                ? `${t('lastReadHadith')}: ${lastHadith.hadithNumber || lastHadith.hadithId}`
                : t('authenticSayings')}
            </p>
          </div>
        </Link>

        <Link to="/calendar" className="dashboard-card quick-link-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>{t('islamicCalendar')}</h3>
            <p>{t('importantDatesLabel')}</p>
          </div>
        </Link>

        <div className="dashboard-card ramadan-card">
          <div className="card-icon">🌙</div>
          <div className="card-content">
            <h3>{t('ramadanTitle')}</h3>
            {isRamadan ? (
              <>
                <p className="ramadan-day">{t('ramadanDay')} {hijriDate?.day}</p>
                {prayerTimes ? (
                  <div className="ramadan-times">
                    <div>
                      <span className="ramadan-label">{t('suhoorEnds')}</span>
                      <span className="ramadan-time">{format(prayerTimes.fajr, 'h:mm a')}</span>
                    </div>
                    <div>
                      <span className="ramadan-label">{t('iftarTime')}</span>
                      <span className="ramadan-time">{format(prayerTimes.maghrib, 'h:mm a')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="ramadan-note">{t('locationNeeded')}</p>
                )}
              </>
            ) : (
              <p className="ramadan-countdown">
                {t('ramadanStartsIn')} {daysUntilRamadan !== null ? daysUntilRamadan : '—'} {t('days')}
              </p>
            )}
          </div>
          <Link to="/calendar" className="card-link">{t('ramadanSchedule')} →</Link>
        </div>

        {prayerTimes && (
          <div className="dashboard-card prayer-times-summary">
            <h3>{t('todaysPrayerTimes')}</h3>
            <div className="prayer-times-list">
              {Object.entries(prayerTimes).map(([key, time]) => {
                if (key === 'sunrise') return null
                const label = prayerLabels[key]
                return (
                  <div key={key} className="prayer-time-item">
                    <span className="prayer-name">{label.icon} {label.name}</span>
                    <span className="prayer-time-text">{format(time, 'h:mm a')}</span>
                  </div>
                )
              })}
            </div>
            <Link to="/prayer-times" className="card-link">{t('viewDetails')} →</Link>
          </div>
        )}

        <div className="dashboard-card daily-reminder">
          <div className="card-icon">💡</div>
          <div className="card-content">
            <h3>{t('dailyReminder')}</h3>
            <p className="reminder-text">{dailyReminder}</p>
            <div className="reminder-notifications">
              <h4>{t('dailyReminderNotifications')}</h4>
              {notificationPermission === 'unsupported' && (
                <p className="notification-status">{t('browserNotSupported')}</p>
              )}
              {notificationPermission === 'denied' && (
                <p className="notification-status">{t('notificationsBlocked')}</p>
              )}
              {notificationPermission === 'default' && (
                <button onClick={requestDailyReminderPermission} className="notification-button">
                  {t('enableDailyReminderNotifications')}
                </button>
              )}
              {notificationPermission === 'granted' && (
                <>
                  <label className="reminder-toggle-label">
                    <input
                      type="checkbox"
                      checked={dailyNotificationsEnabled}
                      onChange={(event) => {
                        const enabled = event.target.checked
                        setDailyNotificationsEnabled(enabled)
                        localStorage.setItem('dailyReminderNotificationsEnabled', enabled.toString())
                        if (!enabled && notificationTimeoutRef.current) {
                          clearTimeout(notificationTimeoutRef.current)
                        }
                      }}
                    />
                    {dailyNotificationsEnabled ? t('notificationsEnabledLabel') : t('notificationsDisabledLabel')}
                  </label>
                  {dailyNotificationsEnabled && (
                    <>
                      <div className="reminder-time-row">
                        <label className="reminder-time-label" htmlFor="daily-reminder-time">
                          {t('dailyReminderTime')}
                        </label>
                        <input
                          id="daily-reminder-time"
                          type="time"
                          value={dailyReminderTime}
                          onChange={(event) => {
                            const value = event.target.value || '09:00'
                            setDailyReminderTime(value)
                            localStorage.setItem('dailyReminderTime', value)
                          }}
                          className="reminder-time-input"
                        />
                      </div>
                      <p className="notification-status">{t('dailyReminderTimeHelp')}</p>
                      <button
                        onClick={() => showDailyNotification(new Date(), true)}
                        className="notification-button reminder-test-button"
                        type="button"
                      >
                        {t('sendTestNotification')}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-card continue-card">
          <div className="card-icon">🔖</div>
          <div className="card-content">
            <h3>{t('continueReadingTitle')}</h3>
            <div className="continue-list">
              {lastQuran && (
                <Link to="/quran" className="continue-item">
                  <span className="continue-label">{t('lastReadQuran')}</span>
                  <span className="continue-value">{lastQuran.surahName} • {t('ayah')} {lastQuran.ayahNumber}</span>
                  <span className="continue-action">{t('openSection')} →</span>
                </Link>
              )}
              {lastHadith && (
                <Link to="/hadiths" className="continue-item">
                  <span className="continue-label">{t('lastReadHadith')}</span>
                  <span className="continue-value">{lastHadith.collection || t('hadiths')} • {lastHadith.hadithNumber || lastHadith.hadithId}</span>
                  <span className="continue-action">{t('openSection')} →</span>
                </Link>
              )}
              {lastDuaa && (
                <Link to="/duaas" className="continue-item">
                  <span className="continue-label">{t('lastReadDuaa')}</span>
                  <span className="continue-value">{lastDuaa.duaTitle}</span>
                  <span className="continue-action">{t('openSection')} →</span>
                </Link>
              )}
              {!lastQuran && !lastHadith && !lastDuaa && (
                <p className="continue-empty">{t('noRecentReading')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

