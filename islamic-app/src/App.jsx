import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useTheme } from './contexts/ThemeContext'
import { useLanguage } from './contexts/LanguageContext'
import PrayerTimes from './components/PrayerTimes'
import Quran from './components/Quran'
import Duaas from './components/Duaas'
import Qibla from './components/Qibla'
import Tasbih from './components/Tasbih'
import IslamicCalendar from './components/IslamicCalendar'
import Hadiths from './components/Hadiths'
import Favorites from './components/Favorites'
import Dashboard from './components/Dashboard'
import Statistics from './components/Statistics'
import './App.css'

function Navigation() {
  const location = useLocation()
  const { isDarkMode, toggleTheme } = useTheme()
  const { language, changeLanguage, t } = useLanguage()
  
  const navItems = [
    { path: '/', label: t('home'), icon: '🏠' },
    { path: '/prayer-times', label: t('prayerTimes'), icon: '🕌' },
    { path: '/quran', label: t('quran'), icon: '📖' },
    { path: '/duaas', label: t('duaas'), icon: '🤲' },
    { path: '/tasbih', label: t('tasbih'), icon: '📿' },
    { path: '/hadiths', label: t('hadiths'), icon: '📚' },
    { path: '/calendar', label: t('calendar'), icon: '📅' },
    { path: '/favorites', label: t('favorites'), icon: '⭐' },
    { path: '/statistics', label: t('statistics'), icon: '📊' },
    { path: '/qibla', label: t('qibla'), icon: '🧭' },
  ]

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">☪️</span>
          <span className="brand-text">Rahma</span>
        </div>
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          <div className="nav-controls">
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="language-selector"
              aria-label="Select language"
            >
              <option value="fr">🇫🇷 FR</option>
              <option value="en">🇬🇧 EN</option>
              <option value="nl">🇳🇱 NL</option>
              <option value="ar">🇸🇦 AR</option>
            </select>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/prayer-times" element={<PrayerTimes />} />
            <Route path="/quran" element={<Quran />} />
            <Route path="/duaas" element={<Duaas />} />
            <Route path="/tasbih" element={<Tasbih />} />
            <Route path="/hadiths" element={<Hadiths />} />
            <Route path="/calendar" element={<IslamicCalendar />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/qibla" element={<Qibla />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

