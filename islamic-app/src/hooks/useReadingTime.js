import { useEffect, useRef } from 'react'
import { useReadingTracker } from '../contexts/ReadingTrackerContext'

// Hook pour suivre le temps passé sur une page/section
export const useReadingTime = (section, itemId = null) => {
  const { updateDailyStats, recordSession } = useReadingTracker()
  const startTimeRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Démarrer le suivi quand le composant est monté
    startTimeRef.current = Date.now()

    // Enregistrer le temps toutes les 30 secondes pour un suivi en temps réel
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        updateDailyStats(section, { time: 30 }) // Mettre à jour toutes les 30 secondes
        startTimeRef.current = Date.now() // Réinitialiser le compteur pour éviter la double comptabilisation
      }
    }, 30000) // Toutes les 30 secondes

    // Cleanup : enregistrer le temps restant quand on quitte
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      if (startTimeRef.current) {
        const totalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
        
        if (totalTime > 3) { // Seulement si l'utilisateur a passé plus de 3 secondes
          updateDailyStats(section, { time: totalTime })
          
          // Enregistrer la session
          recordSession(section, {
            itemId,
            duration: totalTime,
            startTime: startTimeRef.current,
            endTime: Date.now()
          })
        }
      }
    }
  }, [section, itemId, updateDailyStats, recordSession])
}

