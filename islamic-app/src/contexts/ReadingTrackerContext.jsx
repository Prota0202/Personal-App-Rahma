import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const ReadingTrackerContext = createContext()

export const useReadingTracker = () => {
  const context = useContext(ReadingTrackerContext)
  if (!context) {
    throw new Error('useReadingTracker must be used within a ReadingTrackerProvider')
  }
  return context
}

// Structure des données de suivi
// {
//   quran: {
//     totalTime: 0, // en secondes
//     versesRead: 0,
//     surahsRead: [],
//     sessions: []
//   },
//   hadiths: {
//     totalTime: 0,
//     hadithsRead: 0,
//     sessions: []
//   },
//   duaas: {
//     totalTime: 0,
//     duaasRead: 0,
//     sessions: []
//   },
//   dailyStats: {
//     '2024-01-15': {
//       quran: { time: 0, verses: 0 },
//       hadiths: { time: 0, count: 0 },
//       duaas: { time: 0, count: 0 }
//     }
//   }
// }

export const ReadingTrackerProvider = ({ children }) => {
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('readingStats')
    return saved ? JSON.parse(saved) : {
      quran: { totalTime: 0, versesRead: 0, surahsRead: [], sessions: [], lastPosition: null },
      hadiths: { totalTime: 0, hadithsRead: 0, sessions: [], lastPosition: null },
      duaas: { totalTime: 0, duaasRead: 0, sessions: [], lastPosition: null },
      dailyStats: {}
    }
  })

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('readingStats', JSON.stringify(stats))
  }, [stats])

  // Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayKey = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Mettre à jour les stats du jour
  const updateDailyStats = (section, updates) => {
    setStats(prev => {
      const today = getTodayKey()
      const newStats = { ...prev }
      
      if (!newStats.dailyStats[today]) {
        newStats.dailyStats[today] = {
          quran: { time: 0, verses: 0 },
          hadiths: { time: 0, count: 0 },
          duaas: { time: 0, count: 0 }
        }
      }

      if (updates.time) {
        newStats.dailyStats[today][section].time += updates.time
        newStats[section].totalTime += updates.time
      }

      if (updates.count !== undefined) {
        if (section === 'quran') {
          newStats.dailyStats[today][section].verses += updates.count
          newStats[section].versesRead += updates.count
        } else {
          newStats.dailyStats[today][section].count += updates.count
          newStats[section][section === 'hadiths' ? 'hadithsRead' : 'duaasRead'] += updates.count
        }
      }

      return newStats
    })
  }

  // Enregistrer une session de lecture
  const recordSession = (section, sessionData) => {
    setStats(prev => {
      const newStats = { ...prev }
      if (!newStats[section].sessions) {
        newStats[section].sessions = []
      }
      newStats[section].sessions.push({
        ...sessionData,
        date: getTodayKey(),
        timestamp: Date.now()
      })
      // Garder seulement les 100 dernières sessions
      if (newStats[section].sessions.length > 100) {
        newStats[section].sessions = newStats[section].sessions.slice(-100)
      }
      return newStats
    })
  }

  // Marquer une surah comme lue
  const markSurahRead = (surahNumber) => {
    setStats(prev => {
      const newStats = { ...prev }
      if (!newStats.quran.surahsRead.includes(surahNumber)) {
        newStats.quran.surahsRead.push(surahNumber)
      }
      // Assurer que lastPosition existe
      if (!newStats.quran.lastPosition) {
        newStats.quran.lastPosition = null
      }
      return newStats
    })
  }

  // Obtenir les statistiques du jour
  const getTodayStats = () => {
    const today = getTodayKey()
    return stats.dailyStats[today] || {
      quran: { time: 0, verses: 0 },
      hadiths: { time: 0, count: 0 },
      duaas: { time: 0, count: 0 }
    }
  }

  // Obtenir les statistiques de la semaine
  const getWeekStats = () => {
    const weekStats = {
      quran: { time: 0, verses: 0 },
      hadiths: { time: 0, count: 0 },
      duaas: { time: 0, count: 0 }
    }

    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      const dayStats = stats.dailyStats[dateKey]
      
      if (dayStats) {
        weekStats.quran.time += dayStats.quran.time
        weekStats.quran.verses += dayStats.quran.verses
        weekStats.hadiths.time += dayStats.hadiths.time
        weekStats.hadiths.count += dayStats.hadiths.count
        weekStats.duaas.time += dayStats.duaas.time
        weekStats.duaas.count += dayStats.duaas.count
      }
    }

    return weekStats
  }

  // Formater le temps en format lisible
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
    } else {
      const hours = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
  }

  // Sauvegarder la position de lecture (marque-page)
  const saveReadingPosition = (section, position) => {
    setStats(prev => {
      const newStats = { ...prev }
      if (!newStats[section]) {
        newStats[section] = { totalTime: 0, [section === 'quran' ? 'versesRead' : section === 'hadiths' ? 'hadithsRead' : 'duaasRead']: 0, sessions: [], lastPosition: null }
      }
      newStats[section].lastPosition = {
        ...position,
        timestamp: Date.now()
      }
      return newStats
    })
  }

  // Obtenir la dernière position de lecture
  const getLastPosition = (section) => {
    return stats[section]?.lastPosition || null
  }

  // Effacer le marque-page
  const clearBookmark = (section) => {
    setStats(prev => {
      const newStats = { ...prev }
      if (newStats[section]) {
        newStats[section].lastPosition = null
      }
      return newStats
    })
  }

  // Réinitialiser les stats
  const resetStats = () => {
    setStats({
      quran: { totalTime: 0, versesRead: 0, surahsRead: [], sessions: [], lastPosition: null },
      hadiths: { totalTime: 0, hadithsRead: 0, sessions: [], lastPosition: null },
      duaas: { totalTime: 0, duaasRead: 0, sessions: [], lastPosition: null },
      dailyStats: {}
    })
  }

  return (
    <ReadingTrackerContext.Provider
      value={{
        stats,
        updateDailyStats,
        recordSession,
        markSurahRead,
        getTodayStats,
        getWeekStats,
        formatTime,
        resetStats,
        saveReadingPosition,
        getLastPosition,
        clearBookmark
      }}
    >
      {children}
    </ReadingTrackerContext.Provider>
  )
}

