import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import azkarCategories, { getLocalizedText } from '../data/azkar'
import './Azkar.css'

const Azkar = () => {
  const { t, language } = useLanguage()
  const [selectedCategoryId, setSelectedCategoryId] = useState(azkarCategories[0]?.id)
  const [showTransliteration, setShowTransliteration] = useState(true)
  const [showTranslation, setShowTranslation] = useState(true)

  const selectedCategory = azkarCategories.find((category) => category.id === selectedCategoryId)
  const currentAzkar = selectedCategory?.items || []

  return (
    <div className="azkar-container">
      <div className="azkar-header">
        <h1>📿 {t('azkarTitle')}</h1>
        <p className="subtitle">{t('azkarSubtitle')}</p>
        <div className="azkar-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showTransliteration}
              onChange={(event) => setShowTransliteration(event.target.checked)}
            />
            {t('showTransliteration')}
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showTranslation}
              onChange={(event) => setShowTranslation(event.target.checked)}
            />
            {t('showTranslation')}
          </label>
        </div>
      </div>

      <div className="categories-section">
        <div className="categories-list">
          {azkarCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              className={`category-button ${selectedCategoryId === category.id ? 'active' : ''}`}
            >
              {t(category.titleKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="azkar-grid">
        {currentAzkar.map((item) => (
          <div key={item.id} className="azkar-card">
            <div className="azkar-title">
              {getLocalizedText(item.title, language)}
            </div>
            <div className="azkar-arabic arabic-text">{item.arabic}</div>
            {showTransliteration && (
              <div className="azkar-transliteration">{item.transliteration}</div>
            )}
            {showTranslation && (
              <div className="azkar-translation">
                {getLocalizedText(item.translation, language)}
              </div>
            )}
            {item.reference && (
              <div className="azkar-reference">{item.reference}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Azkar
