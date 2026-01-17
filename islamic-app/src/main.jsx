import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { BookmarksProvider } from './contexts/BookmarksContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ReadingTrackerProvider } from './contexts/ReadingTrackerContext'
import './index.css'

const isMobileMode = () => {
  if (typeof window === 'undefined') return false
  if (window.ReactNativeWebView) return true
  if (window.location.search.includes('mobile=1')) return true
  return window.innerWidth <= 900
}

if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('mobile-mode', isMobileMode())
}

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

const shouldRegisterServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return false
  if (window.ReactNativeWebView) return false
  if (window.location.search.includes('no-sw=1')) return false
  return true
}

if (shouldRegisterServiceWorker()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Service worker registration failed:', error)
    })
  })
}
