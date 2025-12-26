import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan'
import { format } from 'date-fns'
import HijriDate from 'hijri-date'
import { useBookmarks } from '../contexts/BookmarksContext'
import { useLanguage } from '../contexts/LanguageContext'
import './Dashboard.css'

const Dashboard = () => {
  const [location, setLocation] = useState({ latitude: 51.5074, longitude: -0.1278 })
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [nextPrayer, setNextPrayer] = useState(null)
  const [hijriDate, setHijriDate] = useState(null)
  const { bookmarks } = useBookmarks()
  const { t } = useLanguage()

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🌅 {getGreeting()}</h1>
        <p className="dashboard-date">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
          {hijriDate && (
            <span className="hijri-date"> • {hijriDate.day} {hijriDate.month} {hijriDate.year} AH</span>
          )}
        </p>
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
            <p>{t('continueReading')}</p>
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
            <p>{t('authenticSayings')}</p>
          </div>
        </Link>

        <Link to="/calendar" className="dashboard-card quick-link-card">
          <div className="card-icon">📅</div>
          <div className="card-content">
            <h3>{t('islamicCalendar')}</h3>
            <p>{t('importantDatesLabel')}</p>
          </div>
        </Link>

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
            <p>{t('rememberAllah')}</p>
            <p className="reminder-arabic arabic-text">وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ</p>
            <p className="reminder-translation">"My success is only through Allah"</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

