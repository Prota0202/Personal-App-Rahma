import React, { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './Tasbih.css'

const Tasbih = () => {
  const { t } = useLanguage()
  const [count, setCount] = useState(0)
  const [selectedDhikr, setSelectedDhikr] = useState('SubhanAllah')
  const [sessionTotal, setSessionTotal] = useState(0)
  const [vibration, setVibration] = useState(false)

  const dhikrs = {
    SubhanAllah: {
      arabic: 'سُبْحَانَ اللَّهِ',
      transliteration: 'SubhanAllah',
      translation: 'Glory be to Allah',
      target: 33,
      color: '#1a472a'
    },
    Alhamdulillah: {
      arabic: 'الْحَمْدُ لِلَّهِ',
      transliteration: 'Alhamdulillah',
      translation: 'Praise be to Allah',
      target: 33,
      color: '#2d5a3d'
    },
    AllahuAkbar: {
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      translation: 'Allah is the Greatest',
      target: 33,
      color: '#d4af37'
    },
    LaIlahaIllallah: {
      arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
      transliteration: 'La Ilaha Illallah',
      translation: 'There is no god but Allah',
      target: 33,
      color: '#1a472a'
    },
    Astaghfirullah: {
      arabic: 'أَسْتَغْفِرُ اللَّهِ',
      transliteration: 'Astaghfirullah',
      translation: 'I seek forgiveness from Allah',
      target: 100,
      color: '#2d5a3d'
    },
    LaHawlaWalaQuwwata: {
      arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
      transliteration: 'La Hawla Wala Quwwata Illa Billah',
      translation: 'There is no power except with Allah',
      target: 33,
      color: '#d4af37'
    }
  }

  // Load saved session total from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tasbihSessionTotal')
    if (saved) {
      setSessionTotal(parseInt(saved))
    }
  }, [])

  // Vibrate on count (if supported)
  const handleCount = () => {
    const newCount = count + 1
    setCount(newCount)
    setSessionTotal(sessionTotal + 1)
    
    // Save to localStorage
    localStorage.setItem('tasbihSessionTotal', (sessionTotal + 1).toString())
    
    // Vibrate if supported and enabled
    if (vibration && navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    // Reset when target reached
    if (newCount >= dhikrs[selectedDhikr].target) {
      setTimeout(() => {
        setCount(0)
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
      }, 300)
    }
  }

  const resetCount = () => {
    setCount(0)
  }

  const resetSession = () => {
    if (window.confirm('Reset total session count?')) {
      setCount(0)
      setSessionTotal(0)
      localStorage.setItem('tasbihSessionTotal', '0')
    }
  }

  const handleDhikrChange = (dhikr) => {
    setSelectedDhikr(dhikr)
    setCount(0)
  }

  const currentDhikr = dhikrs[selectedDhikr]
  const progress = (count / currentDhikr.target) * 100

  return (
    <div className="tasbih-container">
      <div className="tasbih-header">
        <h1>📿 {t('tasbihDhikrCounter')}</h1>
        <p className="subtitle">{t('countYourRemembrance')}</p>
      </div>

      <div className="dhikr-selector">
        <label>{t('selectDhikr')}</label>
        <select
          value={selectedDhikr}
          onChange={(e) => handleDhikrChange(e.target.value)}
          className="dhikr-select"
        >
          {Object.keys(dhikrs).map((key) => (
            <option key={key} value={key}>
              {dhikrs[key].transliteration} - {dhikrs[key].translation}
            </option>
          ))}
        </select>
      </div>

      <div className="tasbih-display">
        <div className="dhikr-card" style={{ borderColor: currentDhikr.color }}>
          <div className="dhikr-arabic arabic-text">{currentDhikr.arabic}</div>
          <div className="dhikr-transliteration">{currentDhikr.transliteration}</div>
          <div className="dhikr-translation">{currentDhikr.translation}</div>
          
          <div className="count-display">
            <div className="current-count">{count}</div>
            <div className="target-count">/ {currentDhikr.target}</div>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: currentDhikr.color
              }}
            />
          </div>

          <button
            className="count-button"
            onClick={handleCount}
            style={{ backgroundColor: currentDhikr.color }}
          >
            {t('tapToCount')}
          </button>

          <div className="tasbih-controls">
            <button className="reset-button" onClick={resetCount}>
              {t('reset')}
            </button>
            <label className="vibration-toggle">
              <input
                type="checkbox"
                checked={vibration}
                onChange={(e) => setVibration(e.target.checked)}
              />
              {t('vibration')}
            </label>
          </div>
        </div>

        <div className="session-stats">
          <div className="stat-card">
            <div className="stat-label">{t('sessionTotal')}</div>
            <div className="stat-value">{sessionTotal}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">{t('currentRound')}</div>
            <div className="stat-value">{Math.floor(count / currentDhikr.target)}</div>
          </div>
        </div>

        <div className="session-controls">
          <button className="reset-session-button" onClick={resetSession}>
            {t('resetSessionTotal')}
          </button>
        </div>
      </div>

      <div className="tasbih-info">
        <h3>💡 {t('tasbihTips')}</h3>
        <ul>
          <li>{t('useThumb')}</li>
          <li>{t('complete33Rounds')}</li>
          <li>{t('trackDailyDhikr')}</li>
          <li>{t('enableVibration')}</li>
        </ul>
      </div>
    </div>
  )
}

export default Tasbih

