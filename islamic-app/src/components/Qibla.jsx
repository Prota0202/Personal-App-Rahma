import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import './Qibla.css'

const Qibla = () => {
  const { t } = useLanguage()
  const [location, setLocation] = useState(null)
  const [qiblaDirection, setQiblaDirection] = useState(null)
  const [compassHeading, setCompassHeading] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const compassRef = useRef(null)

  // Kaaba coordinates in Mecca
  const KAABA_LAT = 21.4225241
  const KAABA_LON = 39.8261818

  // Calculate Qibla direction
  const calculateQibla = (lat, lon) => {
    const lat1 = (lat * Math.PI) / 180
    const lon1 = (lon * Math.PI) / 180
    const lat2 = (KAABA_LAT * Math.PI) / 180
    const lon2 = (KAABA_LON * Math.PI) / 180

    const y = Math.sin(lon2 - lon1) * Math.cos(lat2)
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)

    let bearing = (Math.atan2(y, x) * 180) / Math.PI
    bearing = (bearing + 360) % 360

    return bearing
  }

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setLocation({ latitude: lat, longitude: lon })
          const direction = calculateQibla(lat, lon)
          setQiblaDirection(direction)
          setLoading(false)
        },
        (error) => {
          setError(t('unableToGetLocation'))
          setLoading(false)
        }
      )
    } else {
      setError(t('browserNotSupported'))
      setLoading(false)
    }
  }, [])

  // Device orientation for compass
  useEffect(() => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ requires permission
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation)
          }
        })
        .catch(console.error)
    } else {
      // Other browsers
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  const handleOrientation = (event) => {
    if (event.alpha !== null) {
      setCompassHeading(event.alpha)
    }
  }

  // Calculate angle for compass needle
  const getCompassAngle = () => {
    if (compassHeading === null || qiblaDirection === null) return 0
    // Compass heading is 0-360 clockwise from north
    // Qibla direction is also 0-360 clockwise from north
    // We need to rotate the compass to show Qibla direction
    return qiblaDirection - compassHeading
  }

  const getCardinalDirection = (angle) => {
    const directions = ['North', 'NNE', 'NE', 'ENE', 'East', 'ESE', 'SE', 'SSE', 'South', 'SSW', 'SW', 'WSW', 'West', 'WNW', 'NW', 'NNW']
    return directions[Math.round(angle / 22.5) % 16]
  }

  return (
    <div className="qibla-container">
      <div className="qibla-header">
        <h1>🧭 {t('qiblaDirection')}</h1>
        <p className="subtitle">{t('findDirectionToKaaba')}</p>
      </div>

        {error && (
          <div className="error-message">
            <p>⚠️ {error}</p>
            {location && (
              <div className="location-inputs">
                <div className="input-group">
                  <label>{t('latitude')}</label>
                  <input
                    type="number"
                    value={location.latitude}
                    onChange={(e) => {
                      const newLoc = { ...location, latitude: parseFloat(e.target.value) }
                      setLocation(newLoc)
                      setQiblaDirection(calculateQibla(newLoc.latitude, newLoc.longitude))
                    }}
                    step="0.0001"
                  />
                </div>
                <div className="input-group">
                  <label>{t('longitude')}</label>
                  <input
                    type="number"
                    value={location.longitude}
                    onChange={(e) => {
                      const newLoc = { ...location, longitude: parseFloat(e.target.value) }
                      setLocation(newLoc)
                      setQiblaDirection(calculateQibla(newLoc.latitude, newLoc.longitude))
                    }}
                    step="0.0001"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {loading && !error && (
          <div className="loading-container">
            <p>{t('loading')}</p>
          </div>
        )}

      {!loading && !error && qiblaDirection !== null && (
        <>
          <div className="compass-container">
            <div className="compass" ref={compassRef}>
              <div className="compass-ring">
                <div className="compass-needle" style={{ transform: `rotate(${getCompassAngle()}deg)` }}>
                  <div className="needle-pointer"></div>
                </div>
                <div className="compass-center"></div>
                <div className="compass-north">N</div>
                <div className="compass-qibla-marker" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                  <div className="qibla-arrow">🕋</div>
                </div>
              </div>
            </div>
          </div>

          <div className="qibla-info">
            <div className="info-card">
              <div className="info-label">{t('qiblaDirectionLabel')}</div>
              <div className="info-value">
                {qiblaDirection.toFixed(1)}° {getCardinalDirection(qiblaDirection)}
              </div>
            </div>
            
            {compassHeading !== null && (
              <div className="info-card">
                <div className="info-label">{t('yourHeading')}</div>
                <div className="info-value">
                  {compassHeading.toFixed(1)}° {getCardinalDirection(compassHeading)}
                </div>
              </div>
            )}

            {location && (
              <div className="info-card">
                <div className="info-label">{t('yourLocation')}</div>
                <div className="info-value-small">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          <div className="instructions">
            <h3>{t('instructions')}</h3>
            <ul>
              <li>{t('holdDeviceFlat')}</li>
              <li>{t('redArrowShows')}</li>
              <li>{t('enableLocationServices')}</li>
              {compassHeading === null && (
                <li>📱 {t('compassFunctionality')}</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default Qibla

