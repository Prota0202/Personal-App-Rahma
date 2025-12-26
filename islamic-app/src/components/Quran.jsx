import React, { useState, useEffect } from 'react'
import { useBookmarks } from '../contexts/BookmarksContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useReadingTracker } from '../contexts/ReadingTrackerContext'
import { useReadingTime } from '../hooks/useReadingTime'
import './Quran.css'

const Quran = () => {
  const { t } = useLanguage()
  const [surahs, setSurahs] = useState([])
  const [selectedSurah, setSelectedSurah] = useState(null)
  const [ayahs, setAyahs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showTranslation, setShowTranslation] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingAyahs, setLoadingAyahs] = useState(false)
  const [error, setError] = useState(null)
  const { addVerse, removeVerse, isVerseBookmarked } = useBookmarks()
  const { updateDailyStats, markSurahRead, saveReadingPosition, getLastPosition, clearBookmark } = useReadingTracker()
  const [readVerses, setReadVerses] = useState(new Set())
  const [lastReadAyah, setLastReadAyah] = useState(null)

  // Suivre le temps passé sur la page Quran
  useReadingTime('quran', selectedSurah?.number)

  // Récupérer le marque-page au chargement
  useEffect(() => {
    const lastPos = getLastPosition('quran')
    if (lastPos && lastPos.surahNumber) {
      setLastReadAyah(lastPos)
    }
  }, [getLastPosition])

  // Fetch all surahs on component mount
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://api.alquran.cloud/v1/surah')
        const data = await response.json()
        
        if (data.code === 200 && data.data) {
          // Map the API data to our format
          const formattedSurahs = data.data.map(surah => ({
            number: surah.number,
            name: surah.englishName,
            arabic: surah.name,
            english: surah.englishNameTranslation,
            ayahs: surah.numberOfAyahs,
            revelationType: surah.revelationType
          }))
          setSurahs(formattedSurahs)
        } else {
          setError('Failed to load surahs. Please try again later.')
        }
      } catch (err) {
        console.error('Error fetching surahs:', err)
        setError(t('unableToConnectAPI'))
      } finally {
        setLoading(false)
      }
    }

    fetchSurahs()
  }, [])

  // Fetch ayahs when a surah is selected
  useEffect(() => {
    if (selectedSurah) {
      const fetchAyahs = async () => {
        try {
          setLoadingAyahs(true)
          setAyahs([])
          setReadVerses(new Set()) // Reset les versets lus
          
          // Fetch Arabic text and English translation
          const [arabicResponse, translationResponse] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}`),
            fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/en.sahih`)
          ])
          
          const arabicData = await arabicResponse.json()
          const translationData = await translationResponse.json()
          
          if (arabicData.code === 200 && arabicData.data && translationData.code === 200 && translationData.data) {
            const arabicAyahs = arabicData.data.ayahs || []
            const translationAyahs = translationData.data.ayahs || []
            
            // Combine Arabic and translation
            const combinedAyahs = arabicAyahs.map((ayah, index) => ({
              number: ayah.numberInSurah,
              text: ayah.text,
              translation: translationAyahs[index]?.text || ''
            }))
            
            setAyahs(combinedAyahs)
          } else {
            setError('Failed to load surah content. Please try again.')
          }
        } catch (err) {
          console.error('Error fetching ayahs:', err)
          setError(t('unableToLoadContent'))
        } finally {
          setLoadingAyahs(false)
        }
      }

      fetchAyahs()
    }
  }, [selectedSurah])

  // Observer pour détecter quand un verset entre dans la vue
  useEffect(() => {
    if (!selectedSurah || ayahs.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const verseId = entry.target.dataset.verseId
            if (verseId && !readVerses.has(verseId)) {
              setReadVerses(prev => {
                const newSet = new Set(prev)
                newSet.add(verseId)
                return newSet
              })
              // Compter le verset comme lu
              updateDailyStats('quran', { count: 1 })
            }
          }
        })
      },
      { threshold: 0.5 } // 50% visible
    )

    const verseElements = document.querySelectorAll('[data-verse-id]')
    verseElements.forEach(el => observer.observe(el))

    return () => {
      verseElements.forEach(el => observer.unobserve(el))
      observer.disconnect()
    }
  }, [selectedSurah, ayahs, readVerses, updateDailyStats])

  // Marquer la surah comme lue si tous les versets sont lus
  useEffect(() => {
    if (selectedSurah && ayahs.length > 0 && readVerses.size === ayahs.length) {
      markSurahRead(selectedSurah.number)
    }
  }, [selectedSurah, ayahs.length, readVerses.size, markSurahRead])

  // Sauvegarder automatiquement le marque-page quand on lit un verset
  useEffect(() => {
    if (selectedSurah && readVerses.size > 0) {
      // Trouver le dernier verset lu dans cette sourate
      const versesArray = Array.from(readVerses).filter(v => v.startsWith(`${selectedSurah.number}-`))
      if (versesArray.length > 0) {
        const lastVerse = versesArray[versesArray.length - 1]
        const [, ayahNumber] = lastVerse.split('-')
        saveReadingPosition('quran', {
          surahNumber: selectedSurah.number,
          surahName: selectedSurah.name,
          surahArabic: selectedSurah.arabic,
          ayahNumber: parseInt(ayahNumber),
          totalAyahs: ayahs.length,
          versesReadInSurah: versesArray.length
        })
      }
    }
  }, [selectedSurah, readVerses, ayahs.length, saveReadingPosition])

  // Fonction pour reprendre la lecture depuis le marque-page
  const continueFromBookmark = () => {
    const lastPos = getLastPosition('quran')
    if (lastPos && lastPos.surahNumber) {
      // Trouver la sourate correspondante
      const surah = surahs.find(s => s.number === lastPos.surahNumber)
      if (surah) {
        setSelectedSurah(surah)
        // Scroll vers le verset après un court délai pour laisser les ayahs se charger
        setTimeout(() => {
          const verseElement = document.querySelector(`[data-verse-id="${lastPos.surahNumber}-${lastPos.ayahNumber}"]`)
          if (verseElement) {
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Ajouter un effet visuel temporaire
            verseElement.style.backgroundColor = 'var(--primary-color)'
            verseElement.style.transition = 'background-color 0.3s'
            setTimeout(() => {
              verseElement.style.backgroundColor = ''
            }, 2000)
          }
        }, 500)
      }
    }
  }

  const filteredSurahs = surahs.filter(surah =>
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.arabic.includes(searchQuery)
  )

  const handleSurahClick = (surah) => {
    setSelectedSurah(surah)
    setError(null)
  }

  const lastPos = getLastPosition('quran')

  return (
    <div className="quran-container">
      <div className="quran-header">
        <h1>📖 {t('theHolyQuran')}</h1>
        <p className="subtitle">{t('readAndReflect')}</p>
        {lastPos && !selectedSurah && (
          <div className="bookmark-banner">
            <span className="bookmark-icon">🔖</span>
            <div className="bookmark-info">
              <span className="bookmark-text">
                {t('continueReadingFrom') || 'Continue reading from'} {lastPos.surahName} - {t('ayah') || 'Ayah'} {lastPos.ayahNumber}
              </span>
              <span className="bookmark-progress">
                {lastPos.versesReadInSurah} / {lastPos.totalAyahs} {t('versesRead') || 'verses read'}
              </span>
            </div>
            <button onClick={continueFromBookmark} className="continue-reading-btn">
              {t('continueReading') || 'Continue'} →
            </button>
            <button 
              onClick={() => clearBookmark('quran')} 
              className="clear-bookmark-btn"
              title={t('clearBookmark') || 'Clear bookmark'}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            {t('retry')}
          </button>
        </div>
      )}

      {!selectedSurah ? (
        <>
          {loading ? (
            <div className="loading-container">
              <p>{t('loading')}</p>
            </div>
          ) : (
            <>
              <div className="search-section">
                <input
                  type="text"
                  placeholder={t('searchSurah')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="surahs-grid">
                {filteredSurahs.map((surah) => {
                  const hasBookmark = lastPos && lastPos.surahNumber === surah.number
                  return (
                    <div
                      key={surah.number}
                      className={`surah-card ${hasBookmark ? 'has-bookmark' : ''}`}
                      onClick={() => handleSurahClick(surah)}
                    >
                      {hasBookmark && (
                        <div className="bookmark-indicator" title={`${t('continueFromAyah') || 'Continue from Ayah'} ${lastPos.ayahNumber}`}>
                          🔖 {t('ayah') || 'Ayah'} {lastPos.ayahNumber}
                        </div>
                      )}
                      <div className="surah-number">{surah.number}</div>
                      <div className="surah-info">
                        <div className="surah-name-arabic arabic-text">{surah.arabic}</div>
                        <div className="surah-name-english">{surah.name}</div>
                        <div className="surah-name-translation">{surah.english}</div>
                        <div className="surah-ayahs">
                          {surah.ayahs} Ayahs • {surah.revelationType}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="surah-reader">
          <div className="reader-header">
            <button onClick={() => setSelectedSurah(null)} className="back-button">
              ← {t('backToSurahs')}
            </button>
            <div className="reader-title">
              <h2>{selectedSurah.name}</h2>
              <p className="arabic-text">{selectedSurah.arabic}</p>
              <p className="reader-subtitle">{selectedSurah.english} • {selectedSurah.ayahs} Ayahs</p>
            </div>
            <div className="reader-controls">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(e) => setShowTranslation(e.target.checked)}
                />
                {t('showTranslation')}
              </label>
            </div>
          </div>

          <div className="ayahs-container">
            {loadingAyahs ? (
              <div className="loading-container">
                <p>Loading Ayahs...</p>
              </div>
            ) : ayahs.length > 0 ? (
              ayahs.map((ayah) => {
                const verseId = `${selectedSurah.number}-${ayah.number}`
                const isBookmarked = isVerseBookmarked(verseId)
                
                return (
                  <div 
                    key={ayah.number} 
                    className="ayah-card"
                    data-verse-id={verseId}
                  >
                    <div className="ayah-number-container">
                      <div className="ayah-number">{ayah.number}</div>
                      <button
                        className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isBookmarked) {
                            removeVerse(verseId)
                          } else {
                            addVerse({
                              id: verseId,
                              surahNumber: selectedSurah.number,
                              surahName: selectedSurah.name,
                              surahArabic: selectedSurah.arabic,
                              ayahNumber: ayah.number,
                              ayahText: ayah.text,
                              translation: ayah.translation,
                              timestamp: new Date().toISOString()
                            })
                          }
                        }}
                        title={isBookmarked ? t('removeBookmark') : t('bookmarkThis')}
                      >
                        {isBookmarked ? '★' : '☆'}
                      </button>
                    </div>
                    <div className="ayah-content">
                      <div className="ayah-arabic arabic-text" dangerouslySetInnerHTML={{ __html: ayah.text }} />
                      {showTranslation && ayah.translation && (
                        <div className="ayah-translation">{ayah.translation}</div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="no-ayahs">
                <p>📝 {t('unableToLoadContent')}</p>
              </div>
            )}
            {/* Bouton pour passer à la sourate suivante */}
            {ayahs.length > 0 && selectedSurah && (
              <div className="next-surah-section">
                <button 
                  onClick={() => {
                    const nextSurah = surahs.find(s => s.number === selectedSurah.number + 1)
                    if (nextSurah) {
                      setSelectedSurah(nextSurah)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                  className="next-surah-button"
                  disabled={!surahs.find(s => s.number === selectedSurah.number + 1)}
                >
                  {surahs.find(s => s.number === selectedSurah.number + 1) 
                    ? `→ ${t('nextSurah') || 'Next Surah'} (${surahs.find(s => s.number === selectedSurah.number + 1)?.name})`
                    : `✓ ${t('lastSurah') || 'Last Surah'}`
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Quran

