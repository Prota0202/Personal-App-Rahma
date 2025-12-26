import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useReadingTracker } from '../contexts/ReadingTrackerContext'
import './Statistics.css'

const Statistics = () => {
  const { t } = useLanguage()
  const { stats, getTodayStats, getWeekStats, formatTime, resetStats } = useReadingTracker()
  const [confirmReset, setConfirmReset] = useState(false)

  const todayStats = getTodayStats()
  const weekStats = getWeekStats()

  const totalTime = stats.quran.totalTime + stats.hadiths.totalTime + stats.duaas.totalTime
  const totalTodayTime = todayStats.quran.time + todayStats.hadiths.time + todayStats.duaas.time

  const handleReset = () => {
    if (confirmReset) {
      resetStats()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1>📊 {t('readingStatistics') || 'Reading Statistics'}</h1>
        <p className="subtitle">{t('trackYourReadingProgress') || 'Track your reading progress and time spent'}</p>
      </div>

      {/* Statistiques du jour */}
      <div className="stats-section">
        <h2>📅 {t('today') || 'Today'}</h2>
        <div className="stats-grid">
          <div className="stat-card today-stat">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatTime(totalTodayTime)}</div>
            <div className="stat-label">{t('timeSpentToday') || 'Time spent today'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-value">{todayStats.quran.verses}</div>
            <div className="stat-label">{t('versesRead') || 'Verses read'}</div>
            <div className="stat-subvalue">{formatTime(todayStats.quran.time)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{todayStats.hadiths.count}</div>
            <div className="stat-label">{t('hadithsRead') || 'Hadiths read'}</div>
            <div className="stat-subvalue">{formatTime(todayStats.hadiths.time)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤲</div>
            <div className="stat-value">{todayStats.duaas.count}</div>
            <div className="stat-label">{t('duaasRead') || 'Duaas read'}</div>
            <div className="stat-subvalue">{formatTime(todayStats.duaas.time)}</div>
          </div>
        </div>
      </div>

      {/* Statistiques de la semaine */}
      <div className="stats-section">
        <h2>📆 {t('thisWeek') || 'This Week'}</h2>
        <div className="stats-grid">
          <div className="stat-card week-stat">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatTime(weekStats.quran.time + weekStats.hadiths.time + weekStats.duaas.time)}</div>
            <div className="stat-label">{t('totalTimeThisWeek') || 'Total time this week'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-value">{weekStats.quran.verses}</div>
            <div className="stat-label">{t('versesRead') || 'Verses read'}</div>
            <div className="stat-subvalue">{formatTime(weekStats.quran.time)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{weekStats.hadiths.count}</div>
            <div className="stat-label">{t('hadithsRead') || 'Hadiths read'}</div>
            <div className="stat-subvalue">{formatTime(weekStats.hadiths.time)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤲</div>
            <div className="stat-value">{weekStats.duaas.count}</div>
            <div className="stat-label">{t('duaasRead') || 'Duaas read'}</div>
            <div className="stat-subvalue">{formatTime(weekStats.duaas.time)}</div>
          </div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="stats-section">
        <h2>🌟 {t('allTime') || 'All Time'}</h2>
        <div className="stats-grid">
          <div className="stat-card alltime-stat">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{formatTime(totalTime)}</div>
            <div className="stat-label">{t('totalTimeSpent') || 'Total time spent'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-value">{stats.quran.versesRead}</div>
            <div className="stat-label">{t('totalVersesRead') || 'Total verses read'}</div>
            <div className="stat-subvalue">
              {stats.quran.surahsRead.length} {t('surahsCompleted') || 'surahs completed'}
            </div>
            <div className="stat-subvalue">{formatTime(stats.quran.totalTime)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{stats.hadiths.hadithsRead}</div>
            <div className="stat-label">{t('totalHadithsRead') || 'Total hadiths read'}</div>
            <div className="stat-subvalue">{formatTime(stats.hadiths.totalTime)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤲</div>
            <div className="stat-value">{stats.duaas.duaasRead}</div>
            <div className="stat-label">{t('totalDuaasRead') || 'Total duaas read'}</div>
            <div className="stat-subvalue">{formatTime(stats.duaas.totalTime)}</div>
          </div>
        </div>
      </div>

      {/* Liste des surahs complétées */}
      {stats.quran.surahsRead.length > 0 && (
        <div className="stats-section">
          <h2>✅ {t('completedSurahs') || 'Completed Surahs'}</h2>
          <div className="surahs-list">
            {stats.quran.surahsRead.map((surahNumber) => (
              <div key={surahNumber} className="surah-badge">
                {t('surah') || 'Surah'} {surahNumber}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bouton de réinitialisation */}
      <div className="stats-section">
        <button 
          onClick={handleReset}
          className={`reset-button ${confirmReset ? 'confirm' : ''}`}
        >
          {confirmReset 
            ? (t('clickAgainToConfirm') || 'Click again to confirm')
            : (t('resetStatistics') || 'Reset Statistics')
          }
        </button>
      </div>
    </div>
  )
}

export default Statistics

