import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { BookmarksProvider } from './contexts/BookmarksContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ReadingTrackerProvider } from './contexts/ReadingTrackerContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <BookmarksProvider>
          <ReadingTrackerProvider>
            <App />
          </ReadingTrackerProvider>
        </BookmarksProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error)
    })
  })
}
