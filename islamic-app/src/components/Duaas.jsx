import React, { useState, useEffect } from 'react'
import { useBookmarks } from '../contexts/BookmarksContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useReadingTracker } from '../contexts/ReadingTrackerContext'
import { useReadingTime } from '../hooks/useReadingTime'
import './Duaas.css'

const duaasByCategory = {
  'Daily': [
    {
      id: 1,
      title: 'Dua for Morning',
      arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
      transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilayka an-nushur',
      translation: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is our return.',
      reference: 'At-Tirmidhi',
    },
    {
      id: 2,
      title: 'Dua for Evening',
      arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
      transliteration: 'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilayka al-masir',
      translation: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is our destination.',
      reference: 'At-Tirmidhi',
    },
    {
      id: 3,
      title: 'Dua Before Sleeping',
      arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
      transliteration: 'Bismika Allahumma amutu wa ahya',
      translation: 'In Your name, O Allah, I die and I live.',
      reference: 'Al-Bukhari',
    },
    {
      id: 4,
      title: 'Dua Upon Waking',
      arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
      transliteration: 'Alhamdu lillahi alladhi ahyana ba\'da ma amatana wa ilayhi an-nushur',
      translation: 'Praise is to Allah who gives us life after He has caused us to die and to Him is the resurrection.',
      reference: 'Al-Bukhari',
    },
  ],
  'Before Eating': [
    {
      id: 5,
      title: 'Dua Before Eating',
      arabic: 'بِسْمِ اللَّهِ',
      transliteration: 'Bismillah',
      translation: 'In the name of Allah.',
      reference: 'Al-Bukhari',
    },
    {
      id: 6,
      title: 'Dua After Eating',
      arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
      transliteration: 'Alhamdu lillahi alladhi at\'amana wa saqana wa ja\'alana muslimeen',
      translation: 'Praise is to Allah who fed us and gave us drink and made us Muslims.',
      reference: 'At-Tirmidhi',
    },
  ],
  'Travel': [
    {
      id: 7,
      title: 'Dua for Travel',
      arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ',
      transliteration: 'Subhana alladhi sakhkhara lana hadha wa ma kunna lahu muqrineen, wa inna ila rabbina lamunqalibun',
      translation: 'Glory to Him who has subjected this to us, and we could never have it (by our efforts). And verily, to our Lord we indeed are to return.',
      reference: 'Quran 43:13-14',
    },
  ],
  'Protection': [
    {
      id: 8,
      title: 'Dua for Protection',
      arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      transliteration: 'A\'udhu bi kalimati allahi at-tammati min sharri ma khalaq',
      translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
      reference: 'Muslim',
    },
    {
      id: 9,
      title: 'Ayat al-Kursi',
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      transliteration: 'Allahu la ilaha illa huwa al-hayyu al-qayyum. La ta\'khudhuhu sinatun wa la nawm. Lahu ma fi as-samawati wa ma fi al-ard. Man dha alladhi yashfa\'u \'indahu illa bi idhnih. Ya\'lamu ma bayna aydeehim wa ma khalfahum wa la yuhituna bi shay\'in min \'ilmihi illa bi ma sha\'. Wasi\'a kursiyyuhu as-samawati wa al-ard wa la ya\'uduhu hifzuhuma wa huwa al-\'aliyyu al-\'azim',
      translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
      reference: 'Quran 2:255',
    },
  ],
  'Forgiveness': [
    {
      id: 10,
      title: 'Dua for Forgiveness',
      arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ',
      transliteration: 'Rabbi ighfir li wa tub \'alayya innaka anta at-tawwabu ar-raheem',
      translation: 'My Lord, forgive me and accept my repentance, for You are the Accepter of Repentance, the Merciful.',
      reference: 'Abu Dawud',
    },
    {
      id: 11,
      title: 'Dua for Forgiveness (Comprehensive)',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      transliteration: 'Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana \'abduka, wa ana \'ala \'ahdika wa wa\'dika ma istata\'tu. A\'udhu bika min sharri ma sana\'tu, abu\'u laka bi ni\'matika \'alayya, wa abu\'u laka bi dhanbi, faghfir li fa innahu la yaghfiru adh-dhunuba illa anta',
      translation: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I am faithful to my covenant and my promise to You as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for there is none who forgives sins except You.',
      reference: 'Al-Bukhari',
    },
  ],
}

const Duaas = () => {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('Daily')
  const [selectedDuaa, setSelectedDuaa] = useState(null)
  const [showTransliteration, setShowTransliteration] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)
  const { addDua, removeDua, isDuaBookmarked } = useBookmarks()
  const { updateDailyStats, saveReadingPosition, getLastPosition, clearBookmark } = useReadingTracker()
  const [readDuaas, setReadDuaas] = useState(new Set())

  // Suivre le temps passé sur la page Duaas
  useReadingTime('duaas', selectedDuaa?.id)

  // Sauvegarder la position quand on sélectionne un dua
  useEffect(() => {
    if (selectedDuaa) {
      saveReadingPosition('duaas', {
        duaId: selectedDuaa.id,
        duaTitle: selectedDuaa.title,
        category: selectedCategory,
        timestamp: Date.now()
      })
    }
  }, [selectedDuaa, selectedCategory, saveReadingPosition])

  // Fonction pour reprendre la lecture depuis le marque-page
  const continueFromBookmark = () => {
    const lastPos = getLastPosition('duaas')
    if (lastPos && lastPos.duaId) {
      const allDuaas = Object.values(duaasByCategory).flat()
      const dua = allDuaas.find(d => d.id === lastPos.duaId)
      if (dua) {
        setSelectedCategory(lastPos.category || 'Daily')
        setSelectedDuaa(dua)
      }
    }
  }

  const categories = Object.keys(duaasByCategory)
  const currentDuaas = duaasByCategory[selectedCategory] || []

  const lastPos = getLastPosition('duaas')

  return (
    <div className="duaas-container">
      <div className="duaas-header">
        <h1>🤲 {t('duaasSupplications')}</h1>
        <p className="subtitle">{t('authenticDuas')}</p>
        {lastPos && !selectedDuaa && (
          <div className="bookmark-banner">
            <span className="bookmark-icon">🔖</span>
            <div className="bookmark-info">
              <span className="bookmark-text">
                {t('continueReadingFrom') || 'Continue reading from'} {lastPos.duaTitle}
              </span>
            </div>
            <button onClick={continueFromBookmark} className="continue-reading-btn">
              {t('continueReading') || 'Continue'} →
            </button>
            <button 
              onClick={() => clearBookmark('duaas')} 
              className="clear-bookmark-btn"
              title={t('clearBookmark') || 'Clear bookmark'}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {!selectedDuaa ? (
        <>
          <div className="categories-section">
            <div className="categories-list">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="duaas-grid">
            {currentDuaas.map((duaa) => {
              const hasBookmark = lastPos && lastPos.duaId === duaa.id
              return (
              <div
                key={duaa.id}
                className={`duaa-card ${hasBookmark ? 'has-bookmark' : ''}`}
                onClick={() => {
                  setSelectedDuaa(duaa)
                  // Marquer le dua comme lu
                  if (!readDuaas.has(duaa.id)) {
                    setReadDuaas(prev => {
                      const newSet = new Set(prev)
                      newSet.add(duaa.id)
                      return newSet
                    })
                    updateDailyStats('duaas', { count: 1 })
                  }
                }}
              >
                {hasBookmark && (
                  <div className="bookmark-indicator" title={t('continueReadingFrom') || 'Continue reading'}>
                    🔖
                  </div>
                )}
                <div className="duaa-title">{duaa.title}</div>
                <div className="duaa-arabic-preview arabic-text">
                  {duaa.arabic.substring(0, 50)}...
                </div>
                <div className="duaa-reference">{duaa.reference}</div>
              </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="duaa-reader">
          <div className="reader-header">
            <button onClick={() => setSelectedDuaa(null)} className="back-button">
              ← {t('back')} to {t('duaas')}
            </button>
            <div className="reader-title">
              <h2>{selectedDuaa.title}</h2>
              <p className="reader-subtitle">{selectedDuaa.reference}</p>
            </div>
            <div className="reader-controls">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showTransliteration}
                  onChange={(e) => setShowTransliteration(e.target.checked)}
                />
                {t('showTransliteration')}
              </label>
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

          <div className="duaa-content">
            <div className="duaa-header-actions">
              <button
                className={`bookmark-button ${isDuaBookmarked(selectedDuaa.id) ? 'bookmarked' : ''}`}
                onClick={() => {
                  if (isDuaBookmarked(selectedDuaa.id)) {
                    removeDua(selectedDuaa.id)
                  } else {
                    addDua({
                      id: selectedDuaa.id,
                      title: selectedDuaa.title,
                      arabic: selectedDuaa.arabic,
                      transliteration: selectedDuaa.transliteration,
                      translation: selectedDuaa.translation,
                      reference: selectedDuaa.reference,
                      category: selectedCategory,
                      timestamp: new Date().toISOString()
                    })
                  }
                }}
                title={isDuaBookmarked(selectedDuaa.id) ? t('removeBookmark') : t('bookmarkThis')}
              >
                {isDuaBookmarked(selectedDuaa.id) ? `★ ${t('bookmarked')}` : `☆ ${t('bookmarkThis')}`}
              </button>
            </div>
            <div className="duaa-arabic arabic-text">
              {selectedDuaa.arabic}
            </div>
            {showTransliteration && (
              <div className="duaa-transliteration">
                {selectedDuaa.transliteration}
              </div>
            )}
            {showTranslation && (
              <div className="duaa-translation">
                {selectedDuaa.translation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Duaas

