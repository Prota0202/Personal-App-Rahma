import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useReadingTracker } from '../contexts/ReadingTrackerContext'
import { useReadingTime } from '../hooks/useReadingTime'
import { nawawiHadiths } from '../data/nawawiHadiths'
import './Hadiths.css'

// API endpoint for Hadiths - using fawazahmed0/hadith-api
// This API provides 40 Hadiths Nawawi in multiple languages
const HADITH_API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'
const HADITH_API_LANGUAGES = {
  en: ['eng-nawawi', 'eng-nawawi40', 'eng-arbain-nawawi'], // Try in order of likelihood
  ar: ['ara-nawawi', 'ara-nawawi40', 'ara-arbain-nawawi'],
  fr: ['fra-nawawi', 'fra-nawawi40'],
  nl: ['nld-nawawi', 'nld-nawawi40'],
  // Note: French and Dutch may not be available in this API
  // We'll use the local data with translations as fallback
}

// Alternative URLs as fallback (only use if primary fails)
const HADITH_API_FALLBACK_BASES = [
  'https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions'
]

// Authentic Hadiths from Sahih Bukhari and Sahih Muslim (Sunni sources only)
const hadithsByCollection = {
  'Sahih Bukhari': [
    {
      id: 1,
      number: 1,
      arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
      transliteration: 'Innama al-a\'malu bi an-niyyat',
      translation: 'Actions are but by intention and every man shall have but that which he intended.',
      fullText: 'The Prophet (ﷺ) said, "Actions are but by intention and every man shall have but that which he intended. Thus he whose migration was for Allah and His messenger, his migration was for Allah and His messenger, and he whose migration was to achieve some worldly benefit or to take some woman in marriage, his migration was for that for which he migrated."',
      reference: 'Sahih Bukhari 1',
      chapter: 'The Book of Revelation',
    },
    {
      id: 2,
      number: 2,
      arabic: 'الإِسْلاَمُ بُنِيَ عَلَى خَمْسٍ',
      transliteration: 'Al-Islamu buniyya \'ala khamsin',
      translation: 'Islam is built upon five [pillars]',
      fullText: 'The Prophet (ﷺ) said: "Islam is built upon five [pillars]: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing the salah (prayer), paying the zakat (obligatory charity), making the hajj (pilgrimage) to the House, and fasting in Ramadan."',
      reference: 'Sahih Bukhari 8',
      chapter: 'The Book of Faith',
    },
    {
      id: 3,
      number: 3,
      arabic: 'طُهِّرُوا فَإِنَّ الْحَيَاةَ لَا تَحْيَا بِغَيْرِ طُهْرٍ',
      transliteration: 'Tuhhiru fa inna al-hayata la tahya bi ghayri tuhurin',
      translation: 'Purification is half of faith',
      fullText: 'The Prophet (ﷺ) said: "Purification is half of faith. Alhamdulillah (Praise be to Allah) fills the scale, and SubhanAllah (Glory be to Allah) and Alhamdulillah fill up what is between the heavens and the earth."',
      reference: 'Sahih Bukhari 3290',
      chapter: 'The Book of Purification',
    },
    {
      id: 4,
      number: 4,
      arabic: 'مَنْ صَلَّى الصُّبْحَ فِي جَمَاعَةٍ',
      transliteration: 'Man salla as-subha fi jama\'atin',
      translation: 'Whoever prays the dawn prayer in congregation',
      fullText: 'The Prophet (ﷺ) said: "Whoever prays the dawn prayer in congregation, it is as if he had prayed the whole night long."',
      reference: 'Sahih Bukhari 657',
      chapter: 'The Book of Prayer',
    },
    {
      id: 5,
      number: 5,
      arabic: 'صَلاَةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلاَةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً',
      transliteration: 'Salatu al-jama\'ati afdalu min salati al-fadhdhi bi sab\'in wa \'ishrin darajatan',
      translation: 'The prayer in congregation is twenty-seven times superior to the prayer offered by a person alone.',
      fullText: 'The Prophet (ﷺ) said: "The prayer in congregation is twenty-seven times superior to the prayer offered by a person alone."',
      reference: 'Sahih Bukhari 645',
      chapter: 'The Book of Prayer',
    },
  ],
  'Sahih Muslim': [
    {
      id: 6,
      number: 1,
      arabic: 'الْبِرُّ حُسْنُ الْخُلُقِ',
      transliteration: 'Al-birru husnu al-khuluq',
      translation: 'Righteousness is good character',
      fullText: 'The Prophet (ﷺ) said: "Righteousness is good character, and sin is that which wavers in your heart and which you do not want people to know about."',
      reference: 'Sahih Muslim 2553',
      chapter: 'The Book of Righteousness',
    },
    {
      id: 7,
      number: 2,
      arabic: 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
      transliteration: 'La yu\'minu ahadukum hatta yuhibba li akhihi ma yuhibbu li nafsihi',
      translation: 'None of you [truly] believes until he loves for his brother what he loves for himself',
      fullText: 'The Prophet (ﷺ) said: "None of you [truly] believes until he loves for his brother what he loves for himself."',
      reference: 'Sahih Muslim 45',
      chapter: 'The Book of Faith',
    },
    {
      id: 8,
      number: 3,
      arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا',
      transliteration: 'Man salaka tareeqan yaltamisu fihi \'ilman',
      translation: 'Whoever travels a path in search of knowledge',
      fullText: 'The Prophet (ﷺ) said: "Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise."',
      reference: 'Sahih Muslim 2699',
      chapter: 'The Book of Knowledge',
    },
    {
      id: 9,
      number: 4,
      arabic: 'إِنَّ اللَّهَ طَيِّبٌ لا يَقْبَلُ إِلا طَيِّبًا',
      transliteration: 'Inna Allaha tayyibun la yaqabalu illa tayyiban',
      translation: 'Indeed, Allah is pure and only accepts what is pure',
      fullText: 'The Prophet (ﷺ) said: "Indeed, Allah is pure and only accepts what is pure. And indeed, Allah has commanded the believers with what He has commanded the Messengers."',
      reference: 'Sahih Muslim 1015',
      chapter: 'The Book of Zakat',
    },
    {
      id: 10,
      number: 5,
      arabic: 'مَنْ عَمِلَ صَالِحًا مِنْ ذَكَرٍ أَوْ أُنثَى وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً',
      transliteration: 'Man \'amila salihan min dhakarin aw untha wa huwa mu\'minun falanuhyiyannahu hayatan tayyibatan',
      translation: 'Whoever does righteousness, whether male or female, while he is a believer - We will surely cause him to live a good life',
      fullText: 'Allah says in the Quran (16:97), and the Prophet (ﷺ) emphasized: "Whoever does righteousness, whether male or female, while he is a believer - We will surely cause him to live a good life, and We will surely give them their reward [in the Hereafter] according to the best of what they used to do."',
      reference: 'Sahih Muslim (related)',
      chapter: 'The Book of Righteousness',
    },
  ],
}

const Hadiths = () => {
  const { language, t } = useLanguage()
  const [selectedCollection, setSelectedCollection] = useState('Nawawi 40')
  const [selectedHadith, setSelectedHadith] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showExplanation, setShowExplanation] = useState(true)
  const [apiHadiths, setApiHadiths] = useState(null)
  const [loadingHadiths, setLoadingHadiths] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [useAPI, setUseAPI] = useState(true) // API activée par défaut - collection complète
  const { updateDailyStats, saveReadingPosition, getLastPosition, clearBookmark } = useReadingTracker()
  const [readHadiths, setReadHadiths] = useState(new Set())

  // Suivre le temps passé sur la page Hadiths
  useReadingTime('hadiths', selectedHadith?.id)

  // Récupérer le marque-page au chargement
  useEffect(() => {
    const lastPos = getLastPosition('hadiths')
    if (lastPos && lastPos.hadithId) {
      // Charger le hadith depuis le marque-page après que les hadiths soient chargés
      if (apiHadiths && apiHadiths.length > 0) {
        const hadith = apiHadiths.find(h => String(h.id) === String(lastPos.hadithId))
        if (hadith) {
          // Ne pas auto-charger, juste permettre le bouton "continuer"
        }
      } else if (!useAPI && nawawiHadiths.length > 0) {
        const hadith = nawawiHadiths.find(h => String(h.id) === String(lastPos.hadithId))
        if (hadith) {
          // Ne pas auto-charger
        }
      }
    }
  }, [apiHadiths, useAPI, getLastPosition])

  // Sauvegarder la position quand on sélectionne un hadith
  useEffect(() => {
    if (selectedHadith) {
      saveReadingPosition('hadiths', {
        hadithId: selectedHadith.id || selectedHadith.number,
        hadithNumber: selectedHadith.number,
        collection: selectedCollection,
        timestamp: Date.now()
      })
    }
  }, [selectedHadith, selectedCollection, saveReadingPosition])

  // Fonction pour reprendre la lecture depuis le marque-page
  const continueFromBookmark = () => {
    const lastPos = getLastPosition('hadiths')
    if (lastPos && lastPos.hadithId) {
      const hadithsList = useAPI ? apiHadiths : nawawiHadiths
      if (hadithsList && hadithsList.length > 0) {
        const hadith = hadithsList.find(h => String(h.id || h.number) === String(lastPos.hadithId))
        if (hadith) {
          setSelectedHadith(hadith)
          // Scroll vers le hadith dans la liste
          setTimeout(() => {
            const hadithElement = document.querySelector(`[data-hadith-id="${lastPos.hadithId}"]`)
            if (hadithElement) {
              hadithElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 100)
        }
      }
    }
  }

  // Fetch hadiths from API when collection is Nawawi 40
  useEffect(() => {
    if (selectedCollection === 'Nawawi 40' && useAPI) {
      const fetchHadithsFromAPI = async () => {
        setLoadingHadiths(true)
        setApiError(null)
        
        try {
          // Optimized: Try most likely working URLs first
          const langVariants = HADITH_API_LANGUAGES[language] || HADITH_API_LANGUAGES.en
          const endpoints = []
          
          // First, try the most likely working format (eng-nawawi.min.json works)
          for (const langVariant of langVariants) {
            // Try .min.json first (smaller file, faster)
            endpoints.push(`${HADITH_API_BASE}/${langVariant}.min.json`)
            endpoints.push(`${HADITH_API_BASE}/${langVariant}.json`)
          }
          
          // Fallback: try other bases only if primary fails
          for (const base of HADITH_API_FALLBACK_BASES) {
            for (const langVariant of langVariants.slice(0, 1)) { // Only try first variant on fallback
              endpoints.push(`${base}/${langVariant}.min.json`)
              endpoints.push(`${base}/${langVariant}.json`)
            }
          }
          
          let lastError = null
          let apiData = null
          
          // Try each endpoint until one works
          let successfulUrl = null
          for (const apiUrl of endpoints) {
            try {
              const response = await fetch(apiUrl, {
                headers: {
                  'Accept': 'application/json'
                }
              })
              
              if (response.ok) {
                apiData = await response.json()
                successfulUrl = apiUrl
                // Only log successful URL, not errors (to reduce console noise)
                if (endpoints.indexOf(apiUrl) > 0) {
                  console.log('✅ Successfully loaded from:', apiUrl)
                }
                break // Success, exit loop
              }
              // Don't log individual failures to reduce console noise
            } catch (err) {
              lastError = err
              continue // Try next endpoint
            }
          }
          
          if (!apiData) {
            console.warn('⚠️ API: Could not load from API. Using local data as fallback.')
            setApiError('API unavailable. Using local data.')
            // Don't throw error, just use local data
          }
          
          // Handle different API response formats
          // The API might return: { hadiths: [...] } or directly an array
          // Or it might return: { book: {...}, hadith: [...] }
          let hadithsData = []
          
          if (Array.isArray(apiData)) {
            hadithsData = apiData
          } else if (apiData.hadith && Array.isArray(apiData.hadith)) {
            // Format: { book: {...}, hadith: [...] }
            hadithsData = apiData.hadith
          } else if (apiData.hadiths && Array.isArray(apiData.hadiths)) {
            hadithsData = apiData.hadiths
          } else if (apiData.data && Array.isArray(apiData.data)) {
            hadithsData = apiData.data
          } else {
            // Try to find any array in the response
            const keys = Object.keys(apiData)
            for (const key of keys) {
              if (Array.isArray(apiData[key])) {
                hadithsData = apiData[key]
                break
              }
            }
          }
          
          if (hadithsData.length === 0) {
            console.warn('⚠️ API: No hadiths found in API response. Using local data.')
            setApiError('API response invalid. Using local data.')
            setApiHadiths(null)
            setLoadingHadiths(false)
            return
          }
          
          // Transform API data to our format
          const formattedHadiths = hadithsData.map((item, index) => {
            // Handle different API response formats
            const hadithNumber = item.hadithnumber || item.number || item.id || (index + 1)
            
            // Extract Arabic text
            let arabicText = ''
            if (typeof item.text === 'string') {
              arabicText = item.text
            } else if (item.text?.arabic) {
              arabicText = item.text.arabic
            } else if (item.arabic) {
              arabicText = item.arabic
            }
            
            // Extract translation
            let translationText = ''
            if (typeof item.text === 'string') {
              translationText = item.text
            } else if (item.text?.translation) {
              translationText = item.text.translation
            } else if (item.translation) {
              translationText = item.translation
            } else if (item.text) {
              translationText = typeof item.text === 'string' ? item.text : ''
            }
            
            // Ensure all values are strings, not objects
            const safeReference = typeof item.reference === 'string' 
              ? item.reference 
              : (typeof item.book === 'string' ? item.book : (item.bookName || `Nawawi ${hadithNumber}`))
            
            const safeChapter = typeof item.chapter === 'string'
              ? item.chapter
              : (typeof item.bookName === 'string' ? item.bookName : (item.chapterName || ''))
            
            return {
              id: hadithNumber,
              number: hadithNumber,
              arabic: String(arabicText || ''),
              transliteration: String(item.transliteration || ''),
              translations: {
                [language]: String(translationText || ''),
                // Keep existing translations from local data if available
                ...(nawawiHadiths[index]?.translations || {})
              },
              fullText: {
                [language]: String(translationText || ''),
                ...(nawawiHadiths[index]?.fullText || {})
              },
              explanation: {
                // Use local explanations if available
                ...(nawawiHadiths[index]?.explanation || {})
              },
              reference: String(safeReference),
              chapter: String(safeChapter)
            }
          })
          
          setApiHadiths(formattedHadiths)
          setApiError(null)
        } catch (error) {
          console.error('Error fetching hadiths from API:', error)
          setApiError(error.message || 'Failed to load hadiths from API')
          // Keep API enabled but show error - user can switch to local data if needed
        } finally {
          setLoadingHadiths(false)
        }
      }

      fetchHadithsFromAPI()
    } else if (!useAPI) {
      // Reset API state when switching to local data
      setApiHadiths(null)
      setApiError(null)
    }
  }, [selectedCollection, useAPI, language])

  const collections = {
    'Nawawi 40': '40 Hadiths Nawawi',
    'Sahih Bukhari': 'Sahih Bukhari',
    'Sahih Muslim': 'Sahih Muslim'
  }
  
  const getCurrentHadiths = () => {
    if (selectedCollection === 'Nawawi 40') {
      // Use API hadiths if available, otherwise use local data
      return (useAPI && apiHadiths) ? apiHadiths : nawawiHadiths
    }
    return hadithsByCollection[selectedCollection] || []
  }
  
  const currentHadiths = getCurrentHadiths()

  const filteredHadiths = currentHadiths.filter(hadith => {
    const translation = selectedCollection === 'Nawawi 40' 
      ? (hadith.translations?.[language] || hadith.translations?.en || '')
      : (hadith.translation || '')
    
    return translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hadith.arabic.includes(searchQuery) ||
      hadith.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hadith.reference.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const lastPos = getLastPosition('hadiths')

  return (
    <div className="hadiths-container">
      <div className="hadiths-header">
        <h1>📚 {t('hadiths')}</h1>
        <p className="subtitle">40 Hadiths Nawawi, Sahih Bukhari, and Sahih Muslim</p>
        {lastPos && !selectedHadith && (
          <div className="bookmark-banner">
            <span className="bookmark-icon">🔖</span>
            <div className="bookmark-info">
              <span className="bookmark-text">
                {t('continueReadingFrom') || 'Continue reading from'} {selectedCollection === 'Nawawi 40' ? `Hadith ${lastPos.hadithNumber}` : lastPos.hadithId}
              </span>
            </div>
            <button onClick={continueFromBookmark} className="continue-reading-btn">
              {t('continueReading') || 'Continue'} →
            </button>
            <button 
              onClick={() => clearBookmark('hadiths')} 
              className="clear-bookmark-btn"
              title={t('clearBookmark') || 'Clear bookmark'}
            >
              ✕
            </button>
          </div>
        )}
        {selectedCollection === 'Nawawi 40' && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useAPI}
                onChange={(e) => {
                  setUseAPI(e.target.checked)
                  setApiError(null)
                }}
                disabled={loadingHadiths}
              />
              <span><strong>API activée</strong> (recommandé - collection complète des 40 hadiths)</span>
              {loadingHadiths && <span style={{ color: '#007bff' }}>⏳ Chargement...</span>}
            </label>
            {apiError && useAPI && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                background: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '4px',
                color: '#856404'
              }}>
                <strong>⚠️ Erreur API:</strong> {apiError}
                <br />
                <small>Utilisation des données locales comme fallback ({nawawiHadiths.length} hadiths)</small>
              </div>
            )}
            {!apiError && !loadingHadiths && (
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px', marginLeft: '24px' }}>
                {useAPI 
                  ? `✅ Utilisation de l'API: ${apiHadiths?.length || 0} hadiths chargés` 
                  : `📁 Données locales: ${nawawiHadiths.length}/40 hadiths disponibles`}
              </p>
            )}
          </div>
        )}
        
        {loadingHadiths && selectedCollection === 'Nawawi 40' && useAPI && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p>⏳ Chargement des hadiths depuis l'API...</p>
          </div>
        )}
      </div>

      {!selectedHadith ? (
        <>
          <div className="collections-section">
            <div className="collections-list">
              {Object.entries(collections).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCollection(key)
                    setSearchQuery('')
                  }}
                  className={`collection-button ${selectedCollection === key ? 'active' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="search-section">
            <input
              type="text"
              placeholder={`${t('search')} ${t('hadiths').toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="hadiths-grid">
            {filteredHadiths.map((hadith) => {
              const translation = selectedCollection === 'Nawawi 40'
                ? (hadith.translations?.[language] || hadith.translations?.en || '')
                : (hadith.translation || '')
              
              // Tronquer le texte pour l'aperçu
              const arabicPreview = hadith.arabic && hadith.arabic.length > 80 
                ? hadith.arabic.substring(0, 80) + '...' 
                : hadith.arabic
              
              const translationPreview = translation && translation.length > 120
                ? translation.substring(0, 120) + '...'
                : translation
              
              const hadithId = hadith.id || hadith.number
              const hasBookmark = lastPos && String(lastPos.hadithId) === String(hadithId)
              return (
                <div
                  key={hadithId}
                  className={`hadith-card ${hasBookmark ? 'has-bookmark' : ''}`}
                  data-hadith-id={hadithId}
                  onClick={() => {
                    setSelectedHadith(hadith)
                    // Marquer le hadith comme lu
                    const readId = `hadith-${hadithId}`
                    if (!readHadiths.has(readId)) {
                      setReadHadiths(prev => {
                        const newSet = new Set(prev)
                        newSet.add(readId)
                        return newSet
                      })
                      updateDailyStats('hadiths', { count: 1 })
                    }
                  }}
                >
                  {hasBookmark && (
                    <div className="bookmark-indicator" title={t('continueReadingFrom') || 'Continue reading'}>
                      🔖
                    </div>
                  )}
                  <div className="hadith-reference">
                    {selectedCollection === 'Nawawi 40' ? `Hadith ${hadith.number}` : hadith.reference}
                  </div>
                  {hadith.arabic && (
                    <div className="hadith-arabic arabic-text">
                      {arabicPreview}
                    </div>
                  )}
                  {translationPreview && (
                    <div className="hadith-translation-preview">
                      {translationPreview}
                    </div>
                  )}
                  <div className="hadith-chapter">{hadith.chapter}</div>
                  <div className="hadith-click-hint">👆 Cliquez pour voir le hadith complet</div>
                </div>
              )
            })}
          </div>
        </>
      ) : selectedHadith ? (
        <div className="hadith-reader">
          <div className="reader-header">
            <button onClick={() => setSelectedHadith(null)} className="back-button">
              ← {t('back')} to {t('hadiths')}
            </button>
            <div className="reader-title">
              <h2>
                {selectedCollection === 'Nawawi 40' 
                  ? `Hadith ${selectedHadith.number || selectedHadith.id || ''}` 
                  : (selectedHadith.reference || 'Hadith')}
              </h2>
              <p className="reader-subtitle">{selectedHadith.chapter || ''}</p>
            </div>
            {selectedCollection === 'Nawawi 40' && (
              <div className="reader-controls">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showExplanation}
                    onChange={(e) => setShowExplanation(e.target.checked)}
                  />
                  {t('showExplanation')}
                </label>
              </div>
            )}
          </div>

          <div className="hadith-content">
            {selectedHadith.arabic && (
              <div className="hadith-arabic-full arabic-text">
                {selectedHadith.arabic}
              </div>
            )}
            {selectedHadith.transliteration && (
              <div className="hadith-transliteration-full">
                {selectedHadith.transliteration}
              </div>
            )}
            <div className="hadith-full-text">
              {selectedCollection === 'Nawawi 40'
                ? (selectedHadith.fullText?.[language] || selectedHadith.fullText?.en || selectedHadith.translations?.[language] || selectedHadith.translations?.en || '')
                : (selectedHadith.fullText || selectedHadith.translation || '')}
            </div>
            {(selectedCollection === 'Nawawi 40' 
              ? (selectedHadith.translations?.[language] || selectedHadith.translations?.en)
              : selectedHadith.translation) && (
              <div className="hadith-translation-full">
                <strong>{t('translation')}</strong> {
                  selectedCollection === 'Nawawi 40'
                    ? (selectedHadith.translations?.[language] || selectedHadith.translations?.en || '')
                    : (selectedHadith.translation || '')
                }
              </div>
            )}
            {selectedCollection === 'Nawawi 40' && showExplanation && selectedHadith.explanation && (
              <div className="hadith-explanation">
                <h3>{t('explanation')}</h3>
                <p>{selectedHadith.explanation[language] || selectedHadith.explanation.en || ''}</p>
              </div>
            )}
            {selectedHadith.reference && (
              <div className="hadith-reference-footer">
                <strong>{t('reference')}</strong> {selectedHadith.reference}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Hadith introuvable. Veuillez réessayer.</p>
          <button onClick={() => setSelectedHadith(null)} className="back-button">
            ← Retour
          </button>
        </div>
      )}
    </div>
  )
}

export default Hadiths

