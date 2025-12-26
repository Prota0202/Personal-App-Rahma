import React, { useState, useEffect } from 'react'
import HijriDate from 'hijri-date'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { useLanguage } from '../contexts/LanguageContext'
import './IslamicCalendar.css'

const IslamicCalendar = () => {
  const { t } = useLanguage()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [hijriDate, setHijriDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarMode, setCalendarMode] = useState('gregorian') // 'gregorian' or 'hijri'
  const [currentHijriMonth, setCurrentHijriMonth] = useState(() => {
    try {
      const hijri = new HijriDate(new Date())
      const month = hijri.getMonth() + 1
      const year = hijri.getFullYear()
      return { month, year }
    } catch (error) {
      console.error('Error initializing hijri month:', error)
      return { month: 1, year: 1445 }
    }
  })

  // Important Islamic dates (Hijri calendar dates - month-day format)
  // Note: Dates may vary by 1-2 days based on moon sighting observations in different regions
  const importantDates = {
    '1-1': { name: 'Muharram (New Year)', arabic: 'المحرم', type: 'month', description: 'Islamic New Year' },
    '1-10': { name: 'Day of Ashura', arabic: 'عاشوراء', type: 'important', description: 'Fasting on this day is recommended (Sunnah)' },
    '3-12': { name: 'Mawlid an-Nabi', arabic: 'المولد النبوي', type: 'important', description: 'Birth of Prophet Muhammad (PBUH) - Note: This is not a religious celebration in Sunni tradition, but a historical date' },
    '7-27': { name: 'Laylat al-Mi\'raj', arabic: 'ليلة المعراج', type: 'important', description: 'Night Journey and Ascension' },
    '8-15': { name: 'Laylat al-Bara\'ah', arabic: 'ليلة البراءة', type: 'important', description: 'Night of Forgiveness (Mid-Sha\'ban)' },
    '9-1': { name: 'Ramadan Begins', arabic: 'رمضان', type: 'month', description: 'First day of Ramadan - confirmed by moon sighting' },
    '9-21': { name: 'Laylat al-Qadr (Odd Nights)', arabic: 'ليلة القدر', type: 'very-important', description: 'Night of Power - one of the odd nights' },
    '9-23': { name: 'Laylat al-Qadr (Odd Nights)', arabic: 'ليلة القدر', type: 'very-important', description: 'Night of Power - one of the odd nights' },
    '9-25': { name: 'Laylat al-Qadr (Odd Nights)', arabic: 'ليلة القدر', type: 'very-important', description: 'Night of Power - one of the odd nights' },
    '9-27': { name: 'Laylat al-Qadr (Odd Nights)', arabic: 'ليلة القدر', type: 'very-important', description: 'Most likely Night of Power (27th Ramadan)' },
    '9-29': { name: 'Laylat al-Qadr (Odd Nights)', arabic: 'ليلة القدر', type: 'very-important', description: 'Night of Power - one of the odd nights' },
    '10-1': { name: 'Eid al-Fitr', arabic: 'عيد الفطر', type: 'eid', description: 'Festival of Breaking the Fast - confirmed by moon sighting' },
    '12-8': { name: 'Hajj Begins', arabic: 'الحج', type: 'important', description: 'Day of Tarwiyah - Pilgrimage to Mecca begins' },
    '12-9': { name: 'Day of Arafah', arabic: 'يوم عرفة', type: 'very-important', description: 'Day of Arafah (fasting recommended for non-pilgrims)' },
    '12-10': { name: 'Eid al-Adha', arabic: 'عيد الأضحى', type: 'eid', description: 'Festival of Sacrifice - confirmed by moon sighting' },
  }

  // Check if date is in the last 10 days of Ramadan (Laylat al-Qadr period)
  const isLaylatAlQadrPeriod = (hijriDay, hijriMonth) => {
    return hijriMonth === 9 && hijriDay >= 21 && hijriDay <= 30 && hijriDay % 2 === 1
  }

  useEffect(() => {
    updateHijriDate(selectedDate)
  }, [selectedDate])

  const updateHijriDate = (date) => {
    try {
      const hijri = new HijriDate(date)
      setHijriDate({
        day: hijri.getDate(),
        month: hijri.getMonth() + 1,
        year: hijri.getFullYear(),
        monthName: getMonthName(hijri.getMonth()),
        dayName: getDayName(date)
      })
    } catch (error) {
      console.error('Error converting to Hijri:', error)
    }
  }

  const getMonthName = (month) => {
    const months = [
      'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ]
    return months[month]
  }

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[date.getDay()]
  }

  const getImportantDate = (hijriDay, hijriMonth) => {
    // Format: month-day (hijri calendar)
    // Example: '9-1' = 1st day of Ramadan (month 9, day 1)
    const key = `${hijriMonth}-${hijriDay}`
    const date = importantDates[key]
    
    // Special handling for Laylat al-Qadr - highlight odd nights in last 10 days of Ramadan
    if (!date && isLaylatAlQadrPeriod(hijriDay, hijriMonth)) {
      return {
        name: 'Laylat al-Qadr (Possible)',
        arabic: 'ليلة القدر',
        type: 'very-important',
        description: 'Possible Night of Power (odd night in last 10 days)'
      }
    }
    
    return date
  }

  // Debug function to verify conversion (can be removed in production)
  const verifyDateConversion = (gregorianDate) => {
    try {
      const hijri = new HijriDate(gregorianDate)
      return {
        gregorian: format(gregorianDate, 'yyyy-MM-dd'),
        hijri: `${hijri.getFullYear()}-${hijri.getMonth() + 1}-${hijri.getDate()}`,
        month: hijri.getMonth() + 1,
        day: hijri.getDate()
      }
    } catch (error) {
      console.error('Conversion error:', error)
      return null
    }
  }

  const getCurrentMonthDates = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    return days
  }

  // Convert hijri date to gregorian by finding matching dates
  // Optimized version that uses approximate date calculation
  const findGregorianDate = (hijriYear, hijriMonth, hijriDay) => {
    if (!hijriYear || !hijriMonth || !hijriDay) return null
    
    // Calculate approximate gregorian year
    // Hijri year 1445 ≈ 2024 CE
    // Formula: Gregorian year ≈ 622 + (Hijri year - 1) * 0.97
    const approxGregYear = Math.round(622 + (hijriYear - 1) * 0.97)
    
    // Start search from approximate date (middle of expected hijri month)
    // Hijri months can span 29-30 days and may overlap with gregorian months
    const approxMonth = hijriMonth - 1 // Convert to 0-based
    const startDate = new Date(approxGregYear, approxMonth, 15) // Start from middle of month
    const searchRange = 60 // Search ±60 days from approximate date
    
    // Try dates around the approximate date
    for (let offset = -searchRange; offset <= searchRange; offset++) {
      const testDate = addDays(startDate, offset)
      try {
        const hijri = new HijriDate(testDate)
        if (hijri.getFullYear() === hijriYear && 
            hijri.getMonth() + 1 === hijriMonth && 
            hijri.getDate() === hijriDay) {
          return new Date(testDate)
        }
      } catch (e) {
        continue
      }
    }
    
    // If not found in first range, try adjacent years
    for (let yearOffset = -1; yearOffset <= 1; yearOffset++) {
      if (yearOffset === 0) continue // Already searched
      const altStartDate = new Date(approxGregYear + yearOffset, approxMonth, 15)
      for (let offset = -30; offset <= 30; offset++) {
        const testDate = addDays(altStartDate, offset)
        try {
          const hijri = new HijriDate(testDate)
          if (hijri.getFullYear() === hijriYear && 
              hijri.getMonth() + 1 === hijriMonth && 
              hijri.getDate() === hijriDay) {
            return new Date(testDate)
          }
        } catch (e) {
          continue
        }
      }
    }
    
    return null
  }

  // Get days in hijri month (29 or 30 days)
  const getDaysInHijriMonth = (year, month) => {
    // Hijri months alternate between 29 and 30 days, with some adjustments
    // For simplicity, we'll use 30 days for odd months and 29 for even, with adjustments
    const daysInMonth = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]
    // Check if this is a leap year (hijri leap years have 355 days instead of 354)
    const isLeapYear = (year * 11 + 14) % 30 < 11
    if (isLeapYear && month === 12) return 30
    return daysInMonth[month - 1]
  }

  // Generate calendar days for hijri mode
  const getHijriCalendarDays = () => {
    const { month, year } = currentHijriMonth
    
    if (!year || !month) {
      console.error('Invalid hijri month/year:', currentHijriMonth)
      return []
    }
    
    const calendarDays = []
    
    // Calculate approximate gregorian year: Hijri year 1445 ≈ 2024 CE
    // Formula: Gregorian year ≈ 622 + (Hijri year - 1) * 0.97
    const baseYear = Math.round(622 + (year - 1) * 0.97)
    
    // Calculate approximate month (hijri months can span across gregorian months)
    // Safar (month 2) in 1445 AH ≈ September 2023
    const approxMonth = Math.max(0, Math.min(11, month - 1)) // 0-based
    
    // Start search from approximate date (middle of expected hijri month period)
    const startDate = new Date(baseYear, approxMonth, 15)
    const searchRange = 90 // Search ±90 days (hijri months are 29-30 days, but can span gregorian months)
    
    // Collect all dates in this hijri month
    const monthDates = []
    
    // Search backwards and forwards from approximate date
    for (let offset = -searchRange; offset <= searchRange; offset++) {
      const testDate = addDays(startDate, offset)
      try {
        const hijri = new HijriDate(testDate)
        const hijriYear = hijri.getFullYear()
        const hijriMonthNum = hijri.getMonth() + 1
        
        if (hijriYear === year && hijriMonthNum === month) {
          monthDates.push({
            date: new Date(testDate),
            hijriDay: hijri.getDate()
          })
        }
      } catch (e) {
        // Skip invalid dates
        continue
      }
    }
    
    // If not found, try adjacent years
    if (monthDates.length === 0) {
      for (let yearOffset = -1; yearOffset <= 1; yearOffset++) {
        if (yearOffset === 0) continue
        const altStartDate = new Date(baseYear + yearOffset, approxMonth, 15)
        for (let offset = -60; offset <= 60; offset++) {
          const testDate = addDays(altStartDate, offset)
          try {
            const hijri = new HijriDate(testDate)
            const hijriYear = hijri.getFullYear()
            const hijriMonthNum = hijri.getMonth() + 1
            
            if (hijriYear === year && hijriMonthNum === month) {
              monthDates.push({
                date: new Date(testDate),
                hijriDay: hijri.getDate()
              })
            }
          } catch (e) {
            continue
          }
        }
        if (monthDates.length > 0) break
      }
    }
    
    if (monthDates.length === 0) {
      console.error('No dates found for hijri month:', month, year, 'baseYear:', baseYear)
      return []
    }
    
    // Sort by hijri day
    monthDates.sort((a, b) => a.hijriDay - b.hijriDay)
    
    // Find first and last dates of the month
    const firstDate = monthDates[0].date
    const lastDate = monthDates[monthDates.length - 1].date
    const startDayOfWeek = firstDate.getDay()
    
    // Previous month padding
    let prevDate = addDays(firstDate, -1)
    const prevDates = []
    for (let i = 0; i < startDayOfWeek; i++) {
      try {
        const hijri = new HijriDate(prevDate)
        prevDates.unshift({
          date: new Date(prevDate),
          hijriDay: hijri.getDate(),
          hijriMonth: hijri.getMonth() + 1
        })
      } catch (e) {
        // If conversion fails, create placeholder
        prevDates.unshift({
          date: new Date(prevDate),
          hijriDay: 0,
          hijriMonth: month === 1 ? 12 : month - 1
        })
      }
      prevDate = addDays(prevDate, -1)
      if (i >= 6) break // Safety limit for padding
    }
    
    prevDates.forEach(item => {
      calendarDays.push({ 
        date: item.date, 
        isCurrentMonth: false, 
        hijriDay: item.hijriDay, 
        hijriMonth: item.hijriMonth 
      })
    })
    
    // Current month days
    monthDates.forEach(({ date, hijriDay }) => {
      calendarDays.push({ 
        date, 
        isCurrentMonth: true, 
        hijriDay, 
        hijriMonth: month 
      })
    })
    
    // Next month padding
    const remaining = 42 - calendarDays.length
    let nextDate = addDays(lastDate, 1)
    for (let i = 0; i < remaining; i++) {
      try {
        const hijri = new HijriDate(nextDate)
        calendarDays.push({ 
          date: new Date(nextDate), 
          isCurrentMonth: false, 
          hijriDay: hijri.getDate(), 
          hijriMonth: hijri.getMonth() + 1 
        })
      } catch (e) {
        // If conversion fails, create placeholder
        calendarDays.push({ 
          date: new Date(nextDate), 
          isCurrentMonth: false, 
          hijriDay: 0, 
          hijriMonth: month === 12 ? 1 : month + 1 
        })
      }
      nextDate = addDays(nextDate, 1)
    }
    
    return calendarDays
  }

  // Get calendar days for gregorian mode
  const getGregorianCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const startDay = monthStart.getDay()
    const calendarDays = []
    
    // Previous month padding
    for (let i = 0; i < startDay; i++) {
      const date = addDays(monthStart, -startDay + i)
      calendarDays.push({ date, isCurrentMonth: false })
    }
    
    // Current month days
    monthDays.forEach(date => {
      calendarDays.push({ date, isCurrentMonth: true })
    })
    
    // Next month padding
    const remaining = 42 - calendarDays.length
    for (let i = 1; i <= remaining; i++) {
      const date = addDays(monthEnd, i)
      calendarDays.push({ date, isCurrentMonth: false })
    }
    
    return calendarDays
  }

  const calendarDays = calendarMode === 'hijri' ? getHijriCalendarDays() : getGregorianCalendarDays()

  const navigateMonth = (direction) => {
    if (calendarMode === 'hijri') {
      const newMonth = currentHijriMonth.month + direction
      const newYear = currentHijriMonth.year
      
      if (newMonth < 1) {
        setCurrentHijriMonth({ month: 12, year: newYear - 1 })
      } else if (newMonth > 12) {
        setCurrentHijriMonth({ month: 1, year: newYear + 1 })
      } else {
        setCurrentHijriMonth({ month: newMonth, year: newYear })
      }
    } else {
      const newMonth = new Date(currentMonth)
      newMonth.setMonth(currentMonth.getMonth() + direction)
      setCurrentMonth(newMonth)
    }
  }

  return (
    <div className="islamic-calendar-container">
      <div className="calendar-header">
        <h1>📅 {t('islamicCalendar')}</h1>
        <p className="subtitle">{t('hijriCalendar')}</p>
        <div className="calendar-note">
          <small>⚠️ {t('calendarNote') || 'Note: Dates may vary by 1-2 days based on moon sighting in your region. Please verify with local authorities for religious observances.'}</small>
        </div>
      </div>

      <div className="current-date-display">
        <div className="date-card">
          <div className="date-gregorian">
            <h2>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</h2>
          </div>
          {hijriDate && (
            <div className="date-hijri">
              <div className="hijri-arabic arabic-text">
                {hijriDate.day} {hijriDate.monthName} {hijriDate.year} AH
              </div>
              <div className="hijri-english">
                {hijriDate.day} {hijriDate.monthName} {hijriDate.year} AH
              </div>
            </div>
          )}
          {hijriDate && getImportantDate(hijriDate.day, hijriDate.month) && (
            <div className={`important-date-badge ${getImportantDate(hijriDate.day, hijriDate.month).type}`}>
              <div className="important-date-name">
                {getImportantDate(hijriDate.day, hijriDate.month).name}
              </div>
              {getImportantDate(hijriDate.day, hijriDate.month).description && (
                <div className="important-date-desc">
                  {getImportantDate(hijriDate.day, hijriDate.month).description}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="calendar-controls">
        <div className="calendar-mode-toggle">
          <button
            onClick={() => setCalendarMode('gregorian')}
            className={`mode-button ${calendarMode === 'gregorian' ? 'active' : ''}`}
          >
            {t('gregorianCalendar') || 'Gregorian'}
          </button>
          <button
            onClick={() => setCalendarMode('hijri')}
            className={`mode-button ${calendarMode === 'hijri' ? 'active' : ''}`}
          >
            {t('hijriCalendar') || 'Hijri'}
          </button>
        </div>
        <button onClick={() => navigateMonth(-1)} className="nav-button">← {t('previous')}</button>
        <h2>
          {calendarMode === 'hijri' 
            ? `${getMonthName(currentHijriMonth.month - 1)} ${currentHijriMonth.year || 1445} AH`
            : format(currentMonth, 'MMMM yyyy')
          }
        </h2>
        <button onClick={() => navigateMonth(1)} className="nav-button">{t('next')} →</button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {calendarDays.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              {calendarMode === 'hijri' ? 'Chargement du calendrier Hijri...' : 'Chargement du calendrier...'}
            </div>
          ) : (
            calendarDays.map(({ date, isCurrentMonth, hijriDay: preCalcHijriDay, hijriMonth: preCalcHijriMonth }, index) => {
            try {
              const hijri = new HijriDate(date)
              const hijriDay = preCalcHijriDay !== undefined ? preCalcHijriDay : hijri.getDate()
              const hijriMonth = preCalcHijriMonth !== undefined ? preCalcHijriMonth : hijri.getMonth() + 1
              const gregorianDay = date.getDate()
              const importantDate = getImportantDate(hijriDay, hijriMonth)
              const isSelected = isSameDay(date, selectedDate)
              const isToday = isSameDay(date, new Date())

              return (
                <div
                  key={index}
                  className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${importantDate ? importantDate.type : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {calendarMode === 'hijri' ? (
                    <>
                      <div className="day-number">{hijriDay}</div>
                      <div className="hijri-day" title={`Gregorian: ${format(date, 'dd/MM/yyyy')}`}>
                        {format(date, 'd')}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="day-number">{gregorianDay}</div>
                      <div className="hijri-day" title={`Hijri: ${hijriDay}/${hijriMonth}/${hijri.getFullYear()}`}>
                        {hijriDay}/{hijriMonth}
                      </div>
                    </>
                  )}
                  {importantDate && (
                    <div className="important-indicator" title={`${importantDate.name} (${hijriMonth}-${hijriDay} Hijri)`}>●</div>
                  )}
                </div>
              )
            } catch (error) {
              return (
                <div key={index} className="calendar-day other-month">
                  <div className="day-number">{calendarMode === 'hijri' ? (preCalcHijriDay || '?') : format(date, 'd')}</div>
                </div>
              )
            }
          })
          )}
        </div>
      </div>

      <div className="important-dates-list">
        <h3>📋 {t('importantDates')}</h3>
        <div className="dates-explanation">
          <p><strong>
            {calendarMode === 'hijri' 
              ? t('datesFormatExplanation') || 'Format: Month-Day (Hijri Calendar)'
              : t('datesInGregorian') || 'Important dates shown in Gregorian calendar for this year'
            }
          </strong></p>
          <p>
            {calendarMode === 'hijri'
              ? t('datesFormatExample') || 'Example: "9-1" = 1st day of Ramadan (month 9, day 1 in Hijri calendar).'
              : t('datesGregorianNote') || 'These are approximate dates. Actual dates may vary by 1-2 days based on moon sighting.'
            }
          </p>
          <div className="dates-disclaimer">
            <p><strong>⚠️ {t('importantDatesDisclaimer') || 'Important Note:'}</strong></p>
            <p>{t('importantDatesDisclaimerText') || 'Not all important dates are religious celebrations (Eid). Some dates are historical events or recommended days for worship. For example, the birth of Prophet Muhammad (PBUH) is not celebrated as a religious festival in Sunni tradition. Only Eid al-Fitr and Eid al-Adha are official Islamic festivals.'}</p>
          </div>
        </div>
        <div className="dates-grid">
          {Object.entries(importantDates).map(([key, info]) => {
            const [hijriMonth, hijriDay] = key.split('-').map(Number)
            
            // Find gregorian date - try current hijri year and adjacent years
            let gregorianDate = null
            
            // Get current hijri year
            const today = new Date()
            let currentHijriYear = currentHijriMonth.year
            
            // If we don't have the current hijri year, get it from today's date
            if (!currentHijriYear) {
              try {
                const todayHijri = new HijriDate(today)
                currentHijriYear = todayHijri.getFullYear()
              } catch {
                currentHijriYear = 1445 // Fallback
              }
            }
            
            // In gregorian mode, show dates for this year and next year's occurrences
            // In hijri mode, show dates for the current hijri year
            const yearsToTry = calendarMode === 'gregorian' 
              ? [currentHijriYear, currentHijriYear + 1, currentHijriYear - 1] // Show current, next, and previous
              : [currentHijriYear, currentHijriYear - 1, currentHijriYear + 1] // Show current year primarily
            
            // Try each year until we find a match
            for (const year of yearsToTry) {
              gregorianDate = findGregorianDate(year, hijriMonth, hijriDay)
              if (gregorianDate) {
                // If in gregorian mode and date is in the past, prefer next year
                if (calendarMode === 'gregorian' && gregorianDate < today) {
                  const nextYearDate = findGregorianDate(currentHijriYear + 1, hijriMonth, hijriDay)
                  if (nextYearDate && nextYearDate > today) {
                    gregorianDate = nextYearDate
                  }
                }
                break
              }
            }
            
            // Determine what to display based on calendar mode
            const isHijriMode = calendarMode === 'hijri'
            
            return (
              <div key={key} className={`important-date-card ${info.type}`}>
                {isHijriMode ? (
                  // HIJRI MODE: Show Hijri date prominently, Gregorian as secondary
                  <>
                    <div className="date-key" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {key} <small style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>({t('hijri') || 'Hijri'})</small>
                    </div>
                    {gregorianDate ? (
                      <div className="date-gregorian-display" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {format(gregorianDate, 'dd MMM yyyy')} ({t('gregorian') || 'Gregorian'})
                      </div>
                    ) : (
                      <div className="date-gregorian-display" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                        {t('dateNotFound') || 'Date not found'}
                      </div>
                    )}
                  </>
                ) : (
                  // GREGORIAN MODE: Show Gregorian date prominently, Hijri as secondary
                  <>
                    {gregorianDate ? (
                      <>
                        <div className="date-key" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {format(gregorianDate, 'dd MMM yyyy')}
                        </div>
                        <div className="date-hijri-display" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {key} <small>({t('hijri') || 'Hijri'})</small>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="date-key" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                          {key} <small style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>({t('hijri') || 'Hijri'})</small>
                        </div>
                        <div className="date-gregorian-display" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', fontStyle: 'italic' }}>
                          {t('dateNotFound') || 'Date not found'}
                        </div>
                      </>
                    )}
                  </>
                )}
                <div className="date-name">{info.name}</div>
                {info.arabic && (
                  <div className="date-arabic arabic-text">{info.arabic}</div>
                )}
                {info.description && (
                  <div className="date-description">{info.description}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default IslamicCalendar

