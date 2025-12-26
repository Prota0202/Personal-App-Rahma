import React, { useState } from 'react'
import { useBookmarks } from '../contexts/BookmarksContext'
import { useLanguage } from '../contexts/LanguageContext'
import { format } from 'date-fns'
import './Favorites.css'

const Favorites = () => {
  const { bookmarks, removeVerse, removeDua } = useBookmarks()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('verses')

  const exportBookmarks = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `islamic-app-bookmarks-${format(new Date(), 'yyyy-MM-dd')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importBookmarks = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result)
          // Merge with existing bookmarks
          const merged = {
            verses: [...bookmarks.verses, ...imported.verses].filter((v, i, self) =>
              i === self.findIndex(t => t.id === v.id)
            ),
            duas: [...bookmarks.duas, ...imported.duas].filter((d, i, self) =>
              i === self.findIndex(t => t.id === d.id)
            )
          }
          localStorage.setItem('bookmarks', JSON.stringify(merged))
          window.location.reload()
        } catch (error) {
          alert(t('errorImportingBookmarks'))
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>⭐ {t('myFavorites')}</h1>
        <p className="subtitle">{t('bookmarkedVerses')}</p>
      </div>

      <div className="favorites-actions">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'verses' ? 'active' : ''}`}
            onClick={() => setActiveTab('verses')}
          >
            📖 {t('verses')} ({bookmarks.verses.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'duas' ? 'active' : ''}`}
            onClick={() => setActiveTab('duas')}
          >
            🤲 {t('duas')} ({bookmarks.duas.length})
          </button>
        </div>

        <div className="export-import-buttons">
          <button onClick={exportBookmarks} className="export-button">
            💾 {t('export')}
          </button>
          <label className="import-button">
            📥 {t('import')}
            <input
              type="file"
              accept=".json"
              onChange={importBookmarks}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {activeTab === 'verses' && (
        <div className="favorites-content">
          {bookmarks.verses.length === 0 ? (
            <div className="empty-state">
              <p>📖 {t('noBookmarkedVerses')}</p>
              <p className="empty-subtitle">{t('bookmarkFromQuran')}</p>
            </div>
          ) : (
            <div className="verses-list">
              {bookmarks.verses.map((verse) => (
                <div key={verse.id} className="favorite-card">
                  <div className="favorite-header">
                    <div className="favorite-meta">
                      <div className="favorite-title">
                        {verse.surahName} ({verse.surahArabic})
                      </div>
                      <div className="favorite-subtitle">
                        Verse {verse.ayahNumber} • {format(new Date(verse.timestamp), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <button
                    onClick={() => removeVerse(verse.id)}
                    className="remove-button"
                    title={t('back')}
                  >
                    ✕
                  </button>
                  </div>
                  <div className="favorite-content">
                    <div className="verse-arabic arabic-text" dangerouslySetInnerHTML={{ __html: verse.ayahText }} />
                    {verse.translation && (
                      <div className="verse-translation">{verse.translation}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'duas' && (
        <div className="favorites-content">
          {bookmarks.duas.length === 0 ? (
            <div className="empty-state">
              <p>🤲 {t('noBookmarkedDuas')}</p>
              <p className="empty-subtitle">{t('bookmarkFromDuas')}</p>
            </div>
          ) : (
            <div className="duas-list">
              {bookmarks.duas.map((dua) => (
                <div key={dua.id} className="favorite-card">
                  <div className="favorite-header">
                    <div className="favorite-meta">
                      <div className="favorite-title">{dua.title}</div>
                      <div className="favorite-subtitle">
                        {dua.reference} • {dua.category} • {format(new Date(dua.timestamp), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <button
                      onClick={() => removeDua(dua.id)}
                      className="remove-button"
                      title={t('removeBookmark')}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="favorite-content">
                    <div className="dua-arabic arabic-text">{dua.arabic}</div>
                    {dua.transliteration && (
                      <div className="dua-transliteration">{dua.transliteration}</div>
                    )}
                    {dua.translation && (
                      <div className="dua-translation">{dua.translation}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Favorites

