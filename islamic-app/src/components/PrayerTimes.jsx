import React, { useState, useEffect, useRef } from 'react'
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan'
import { format } from 'date-fns'
import HijriDate from 'hijri-date'
import { useLanguage } from '../contexts/LanguageContext'
import adhanSounds, { getAdhanSoundById } from '../data/adhanSounds'
import {
  getExistingSubscription,
  getPushPublicKey,
  getPushServerUrl,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '../utils/pushNotifications'
import './PrayerTimes.css'

const PrayerTimes = () => {
  const { t } = useLanguage()
  const [location, setLocation] = useState({ latitude: 51.5074, longitude: -0.1278 }) // Default: London
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [currentPrayer, setCurrentPrayer] = useState(null)
  const [nextPrayer, setNextPrayer] = useState(null)
  const [calculationMethod, setCalculationMethod] = useState('MuslimWorldLeague')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [reminderMinutes, setReminderMinutes] = useState(5)
  const [athanAlertsEnabled, setAthanAlertsEnabled] = useState(() => {
    return localStorage.getItem('athanAlertsEnabled') === 'true'
  })
  const [adhanSoundPreference, setAdhanSoundPreference] = useState(() => {
    return localStorage.getItem('adhanSoundPreference') || 'system'
  })
  const [adhanSoundId, setAdhanSoundId] = useState(() => {
    return localStorage.getItem('adhanSoundId') || adhanSounds[0]?.id
  })
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushStatus, setPushStatus] = useState('idle')
  const [pushMessage, setPushMessage] = useState('')
  const pushSyncTimeoutRef = useRef(null)
  const [prayerReminders, setPrayerReminders] = useState({
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  })

  const methods = {
    'MuslimWorldLeague': CalculationMethod.MuslimWorldLeague(),
    'Egyptian': CalculationMethod.Egyptian(),
    'Karachi': CalculationMethod.Karachi(),
    'UmmAlQura': CalculationMethod.UmmAlQura(),
    'Dubai': CalculationMethod.Dubai(),
    'MoonsightingCommittee': CalculationMethod.MoonsightingCommittee(),
    'NorthAmerica': CalculationMethod.NorthAmerica(),
    'Kuwait': CalculationMethod.Kuwait(),
    'Qatar': CalculationMethod.Qatar(),
    'Singapore': CalculationMethod.Singapore(),
    'Tehran': CalculationMethod.Tehran(),
    'Turkey': CalculationMethod.Turkey(),
  }

  // Load saved reminder settings
  useEffect(() => {
    const savedReminders = localStorage.getItem('prayerReminders')
    const savedReminderMinutes = localStorage.getItem('reminderMinutes')
    const savedNotificationsEnabled = localStorage.getItem('notificationsEnabled')
    const savedAthanAlertsEnabled = localStorage.getItem('athanAlertsEnabled')
    const savedAdhanSoundPreference = localStorage.getItem('adhanSoundPreference')
    const savedAdhanSoundId = localStorage.getItem('adhanSoundId')
    
    if (savedReminders) {
      setPrayerReminders(JSON.parse(savedReminders))
    }
    if (savedReminderMinutes) {
      setReminderMinutes(parseInt(savedReminderMinutes))
    }
    if (savedNotificationsEnabled) {
      setNotificationsEnabled(JSON.parse(savedNotificationsEnabled))
    }
    if (savedAthanAlertsEnabled) {
      setAthanAlertsEnabled(JSON.parse(savedAthanAlertsEnabled))
    }
    if (savedAdhanSoundPreference) {
      setAdhanSoundPreference(savedAdhanSoundPreference)
    }
    if (savedAdhanSoundId) {
      setAdhanSoundId(savedAdhanSoundId)
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    if (isPushSupported()) {
      getExistingSubscription().then((sub) => {
        setPushEnabled(Boolean(sub))
      })
    }
  }, [])

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.log('Location access denied, using default location')
        }
      )
    }
  }, [])

  useEffect(() => {
    if (location.latitude && location.longitude) {
      const coordinates = new Coordinates(location.latitude, location.longitude)
      const date = new Date()
      const params = methods[calculationMethod]
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

      // Find current and next prayer
      const now = new Date()
      const prayerNames = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
      const prayerTimesArray = prayerNames.map(name => ({
        name,
        time: prayers[name],
      }))

      let current = null
      let next = null

      for (let i = 0; i < prayerTimesArray.length; i++) {
        if (now < prayerTimesArray[i].time) {
          next = prayerTimesArray[i]
          if (i > 0) {
            current = prayerTimesArray[i - 1]
          }
          break
        }
      }

      // If no next prayer found, next is tomorrow's fajr
      if (!next) {
        const tomorrow = new Date(date)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowPrayers = new AdhanPrayerTimes(coordinates, tomorrow, params)
        next = { name: 'fajr', time: tomorrowPrayers.fajr }
        current = prayerTimesArray[prayerTimesArray.length - 1]
      }

      setCurrentPrayer(current)
      setNextPrayer(next)
    }
  }, [location, calculationMethod])

  // Prayer reminder notifications
  useEffect(() => {
    if (!prayerTimes || notificationPermission !== 'granted') {
      return
    }

    const playAdhanAudio = () => {
      if (adhanSoundPreference !== 'adhan') return
      const selectedSound = getAdhanSoundById(adhanSoundId)
      if (!selectedSound?.src) return
      try {
        const audio = new Audio(selectedSound.src)
        audio.play().catch(() => {})
      } catch (error) {
        console.warn('Unable to play adhan audio:', error)
      }
    }

    const checkAndNotify = () => {
      const now = new Date()
      const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

      prayerNames.forEach((prayerName) => {
        const prayerTime = prayerTimes[prayerName]
        if (!prayerTime) return

        const reminderTime = new Date(prayerTime.getTime() - reminderMinutes * 60 * 1000)
        const timeDiff = reminderTime.getTime() - now.getTime()

        // Notify if within 1 minute of reminder time (and not already notified today)
        if (notificationsEnabled && prayerReminders[prayerName] && timeDiff > 0 && timeDiff < 60000) {
          const notificationKey = `reminder_${prayerName}_${format(now, 'yyyy-MM-dd')}`
          if (!localStorage.getItem(notificationKey)) {
            const label = prayerLabels[prayerName]
            new Notification(`Time for ${label.name}`, {
              body: `${label.name} (${label.arabic}) prayer is in ${reminderMinutes} minutes at ${format(prayerTime, 'h:mm a')}`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `prayer-${prayerName}`,
            })
            localStorage.setItem(notificationKey, 'sent')
          }
        }

        if (athanAlertsEnabled) {
          const athanTimeDiff = prayerTime.getTime() - now.getTime()
          if (athanTimeDiff > 0 && athanTimeDiff < 60000) {
            const athanKey = `athan_${prayerName}_${format(now, 'yyyy-MM-dd')}`
            if (!localStorage.getItem(athanKey)) {
              const label = prayerLabels[prayerName]
              new Notification(`${label.name} (${label.arabic})`, {
                body: `${label.name} prayer time has arrived.`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `athan-${prayerName}`,
              })
              playAdhanAudio()
              localStorage.setItem(athanKey, 'sent')
            }
          }
        }
      })
    }

    // Check every minute
    const interval = setInterval(checkAndNotify, 60000)
    checkAndNotify() // Check immediately

    return () => clearInterval(interval)
  }, [
    prayerTimes,
    notificationsEnabled,
    notificationPermission,
    reminderMinutes,
    prayerReminders,
    athanAlertsEnabled,
    adhanSoundPreference,
    adhanSoundId,
  ])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        localStorage.setItem('notificationsEnabled', 'true')
      }
    } else {
      alert(t('browserNotSupported'))
    }
  }

  const sendPushSubscription = async (subscription, enabled) => {
    const serverUrl = getPushServerUrl()
    if (!serverUrl) {
      setPushStatus('missing-config')
      return
    }

    await fetch(`${serverUrl}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        enabled,
        location,
        calculationMethod,
        prayers: prayerReminders,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    })
  }

  const syncPushSettings = async () => {
    const serverUrl = getPushServerUrl()
    if (!serverUrl) {
      return
    }
    const subscription = await getExistingSubscription()
    if (!subscription) {
      return
    }
    await sendPushSubscription(subscription, true)
  }

  const handlePushToggle = async () => {
    if (!isPushSupported()) {
      setPushStatus('unsupported')
      return
    }

    if (Notification.permission !== 'granted') {
      await requestNotificationPermission()
    }

    if (Notification.permission !== 'granted') {
      return
    }

    const publicKey = getPushPublicKey()
    if (!publicKey) {
      setPushStatus('missing-config')
      return
    }

    try {
      setPushStatus('loading')
      if (pushEnabled) {
        const existing = await getExistingSubscription()
        if (existing) {
          await fetch(`${getPushServerUrl()}/api/push/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: existing }),
          })
        }
        await unsubscribeFromPush()
        setPushEnabled(false)
        setPushStatus('disabled')
      } else {
        const subscription = await subscribeToPush()
        await sendPushSubscription(subscription, true)
        setPushEnabled(true)
        setPushStatus('enabled')
      }
    } catch (error) {
      console.error('Push setup failed:', error)
      setPushStatus('error')
    }
  }

  const handlePushTest = async () => {
    try {
      const serverUrl = getPushServerUrl()
      if (!serverUrl) {
        setPushStatus('missing-config')
        return
      }
      const subscription = await getExistingSubscription()
      if (!subscription) {
        return
      }
      await fetch(`${serverUrl}/api/push/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      })
      setPushMessage(t('pushTestSent'))
    } catch (error) {
      setPushMessage(t('pushTestFailed'))
    } finally {
      setTimeout(() => setPushMessage(''), 3000)
    }
  }

  useEffect(() => {
    if (!pushEnabled) return
    if (pushSyncTimeoutRef.current) {
      clearTimeout(pushSyncTimeoutRef.current)
    }
    pushSyncTimeoutRef.current = setTimeout(() => {
      syncPushSettings().catch(() => {})
    }, 800)

    return () => {
      if (pushSyncTimeoutRef.current) {
        clearTimeout(pushSyncTimeoutRef.current)
      }
    }
  }, [pushEnabled, prayerReminders, calculationMethod, location])

  const handleReminderToggle = (prayer) => {
    const updated = { ...prayerReminders, [prayer]: !prayerReminders[prayer] }
    setPrayerReminders(updated)
    localStorage.setItem('prayerReminders', JSON.stringify(updated))
  }

  const handleReminderMinutesChange = (minutes) => {
    setReminderMinutes(minutes)
    localStorage.setItem('reminderMinutes', minutes.toString())
  }

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

  const getHijriDate = () => {
    try {
      const today = new Date()
      const hijri = new HijriDate(today)
      const monthNames = [
        'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
      ]
      return `${hijri.getDate()} ${monthNames[hijri.getMonth()]} ${hijri.getFullYear()} AH`
    } catch (error) {
      return ''
    }
  }

  const hijriDate = getHijriDate()

  return (
    <div className="prayer-times-container">
      <div className="prayer-header">
        <h1>🕌 {t('prayerTimesHeader')}</h1>
        <div className="date-section">
          <p className="date-text">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          {hijriDate && (
            <p className="hijri-date-text">{hijriDate}</p>
          )}
        </div>
      </div>

      {nextPrayer && timeUntil && (
        <div className="next-prayer-card">
          <div className="next-prayer-content">
            <div className="next-prayer-icon">{prayerLabels[nextPrayer.name]?.icon}</div>
            <div className="next-prayer-info">
              <h2>{t('nextPrayer')}: {prayerLabels[nextPrayer.name]?.name}</h2>
              <p className="arabic-text">{prayerLabels[nextPrayer.name]?.arabic}</p>
              <div className="countdown">
                <span className="countdown-time">
                  {timeUntil.hours}h {timeUntil.minutes}m
                </span>
                <span className="countdown-label">{t('at')} {format(nextPrayer.time, 'h:mm a')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="settings-section">
        <label htmlFor="calculation-method">{t('calculationMethod')}</label>
        <select
          id="calculation-method"
          value={calculationMethod}
          onChange={(e) => setCalculationMethod(e.target.value)}
          className="method-select"
        >
          {Object.keys(methods).map((method) => (
            <option key={method} value={method}>
              {method.replace(/([A-Z])/g, ' $1').trim()}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-section">
        <h3>🔔 {t('prayerTimesHeader')} - {t('enableReminders')}</h3>
        {notificationPermission === 'default' && (
          <button onClick={requestNotificationPermission} className="notification-button">
            {t('enableNotifications')}
          </button>
        )}
        {notificationPermission === 'granted' && (
          <>
            <div className="reminder-controls">
              <label className="reminder-toggle-label">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => {
                    setNotificationsEnabled(e.target.checked)
                    localStorage.setItem('notificationsEnabled', e.target.checked.toString())
                  }}
                />
                {t('enableReminders')}
              </label>
              <label className="reminder-toggle-label">
                <input
                  type="checkbox"
                  checked={athanAlertsEnabled}
                  onChange={(e) => {
                    setAthanAlertsEnabled(e.target.checked)
                    localStorage.setItem('athanAlertsEnabled', e.target.checked.toString())
                  }}
                />
                {t('enableAthanAlerts')}
              </label>
              <div className="reminder-time-selector">
                <label>{t('remindMe')}:</label>
                <select
                  value={reminderMinutes}
                  onChange={(e) => handleReminderMinutesChange(parseInt(e.target.value))}
                  className="reminder-select"
                >
                  <option value={5}>5 {t('minutesBefore')}</option>
                  <option value={10}>10 {t('minutesBefore')}</option>
                  <option value={15}>15 {t('minutesBefore')}</option>
                  <option value={30}>30 {t('minutesBefore')}</option>
                </select>
              </div>
            </div>
            {athanAlertsEnabled && (
              <div className="athan-controls">
                <label className="sound-label">{t('soundPreference')}</label>
                <div className="sound-options">
                  <label className="sound-option">
                    <input
                      type="radio"
                      name="adhan-sound"
                      value="system"
                      checked={adhanSoundPreference === 'system'}
                      onChange={() => {
                        setAdhanSoundPreference('system')
                        localStorage.setItem('adhanSoundPreference', 'system')
                      }}
                    />
                    {t('soundSystem')}
                  </label>
                  <label className="sound-option">
                    <input
                      type="radio"
                      name="adhan-sound"
                      value="adhan"
                      checked={adhanSoundPreference === 'adhan'}
                      onChange={() => {
                        setAdhanSoundPreference('adhan')
                        localStorage.setItem('adhanSoundPreference', 'adhan')
                      }}
                    />
                    {t('soundAdhan')}
                  </label>
                </div>
                {adhanSoundPreference === 'adhan' && (
                  <>
                    <label className="sound-label" htmlFor="adhan-sound-select">
                      {t('adhanVoice')}
                    </label>
                    <select
                      id="adhan-sound-select"
                      value={adhanSoundId}
                      onChange={(e) => {
                        setAdhanSoundId(e.target.value)
                        localStorage.setItem('adhanSoundId', e.target.value)
                      }}
                      className="adhan-select"
                    >
                      {adhanSounds.map((sound) => (
                        <option key={sound.id} value={sound.id}>
                          {sound.label}
                        </option>
                      ))}
                    </select>
                    <p className="adhan-audio-help">{t('adhanVoiceHelp')}</p>
                    <button
                      type="button"
                      className="notification-button adhan-test-button"
                      onClick={() => {
                        const selectedSound = getAdhanSoundById(adhanSoundId)
                        if (!selectedSound?.src) return
                        const audio = new Audio(selectedSound.src)
                        audio.play().catch(() => {})
                      }}
                    >
                      {t('testAdhanAudio')}
                    </button>
                  </>
                )}
              </div>
            )}
            <div className="athan-push">
              <div>
                <h4>{t('adhanPushTitle')}</h4>
                <p className="push-help">{t('adhanPushHelp')}</p>
              </div>
              <button
                type="button"
                className="notification-button"
                onClick={handlePushToggle}
                disabled={pushStatus === 'loading'}
              >
                {t('enableAthanPush')}
              </button>
              {pushEnabled && (
                <button
                  type="button"
                  className="notification-button adhan-test-button"
                  onClick={handlePushTest}
                >
                  {t('sendPushTest')}
                </button>
              )}
              {pushStatus === 'missing-config' && (
                <p className="push-status">{t('pushSetupRequired')}</p>
              )}
              {pushStatus === 'unsupported' && (
                <p className="push-status">{t('pushUnsupported')}</p>
              )}
              {pushEnabled && (
                <p className="push-status">{t('pushEnabled')}</p>
              )}
              {!pushEnabled && pushStatus === 'disabled' && (
                <p className="push-status">{t('pushDisabled')}</p>
              )}
              {pushMessage && <p className="push-status">{pushMessage}</p>}
            </div>
            {notificationsEnabled && (
              <div className="prayer-reminder-list">
                {Object.keys(prayerLabels).filter(p => p !== 'sunrise').map((prayer) => (
                  <label key={prayer} className="prayer-reminder-item">
                    <input
                      type="checkbox"
                      checked={prayerReminders[prayer] || false}
                      onChange={() => handleReminderToggle(prayer)}
                    />
                    <span>{prayerLabels[prayer].icon} {prayerLabels[prayer].name}</span>
                  </label>
                ))}
              </div>
            )}
          </>
        )}
        {notificationPermission === 'denied' && (
          <p className="notification-denied">
            {t('notificationsBlocked')}
          </p>
        )}
      </div>

      <div className="location-section">
        <h3>{t('location')}</h3>
        <div className="location-inputs">
          <div className="input-group">
            <label>{t('latitude')}</label>
            <input
              type="number"
              value={location.latitude}
              onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) })}
              step="0.0001"
            />
          </div>
          <div className="input-group">
            <label>{t('longitude')}</label>
            <input
              type="number"
              value={location.longitude}
              onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) })}
              step="0.0001"
            />
          </div>
        </div>
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  })
                },
                (error) => alert(t('unableToGetLocation'))
              )
            }
          }}
          className="location-button"
        >
          📍 {t('useMyLocation')}
        </button>
      </div>

      {prayerTimes && (
        <div className="prayer-times-grid">
          {Object.entries(prayerTimes).map(([key, time]) => {
            const label = prayerLabels[key]
            const isCurrent = currentPrayer?.name === key
            const isNext = nextPrayer?.name === key

            return (
              <div
                key={key}
                className={`prayer-card ${isCurrent ? 'current' : ''} ${isNext ? 'next' : ''}`}
              >
                <div className="prayer-icon">{label.icon}</div>
                <div className="prayer-name">{label.name}</div>
                <div className="prayer-arabic arabic-text">{label.arabic}</div>
                <div className="prayer-time">{format(time, 'h:mm a')}</div>
                {isCurrent && <div className="current-badge">{t('current')}</div>}
                {isNext && <div className="next-badge">{t('next')}</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PrayerTimes

