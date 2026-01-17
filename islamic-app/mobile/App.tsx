import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { NativeModules, Platform, StyleSheet, Text, View } from 'react-native'
import * as Location from 'expo-location'
import { buildPrayerTimes, formatTime, getNextPrayer } from './src/utils/prayerTimes'
import { loadWidgetSnapshot, saveWidgetSnapshot } from './src/utils/widgetStore'

export default function App() {
  const [status, setStatus] = useState('Requesting location...')
  const [nextPrayerLabel, setNextPrayerLabel] = useState('—')
  const [nextPrayerTime, setNextPrayerTime] = useState('—')

  useEffect(() => {
    const init = async () => {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync()
      if (permissionStatus !== 'granted') {
        setStatus('Location permission denied.')
        return
      }

      const position = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = position.coords
      const prayerTimes = buildPrayerTimes(latitude, longitude)
      const nextPrayer = getNextPrayer(prayerTimes)

      setNextPrayerLabel(nextPrayer.key.toUpperCase())
      setNextPrayerTime(formatTime(nextPrayer.time))
      setStatus(`Location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)

      const snapshot = {
        updatedAt: Date.now(),
        nextPrayerName: nextPrayer.key,
        nextPrayerTime: formatTime(nextPrayer.time),
        latitude,
        longitude,
      }

      await saveWidgetSnapshot(snapshot)
      if (NativeModules.WidgetStorage?.setSnapshot) {
        NativeModules.WidgetStorage.setSnapshot(JSON.stringify(snapshot))
      }
    }

    init().catch(() => setStatus('Unable to fetch location.'))
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rahma Mobile</Text>
      <Text style={styles.subtitle}>Native widgets + background notifications.</Text>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Next prayer</Text>
        <Text style={styles.cardValue}>{nextPrayerLabel}</Text>
        <Text style={styles.cardTime}>{nextPrayerTime}</Text>
      </View>
      <Text style={styles.status}>{status}</Text>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1e8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1714',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b6257',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fffdf8',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5ded0',
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6b6257',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1714',
    marginBottom: 4,
  },
  cardTime: {
    fontSize: 18,
    color: '#1a1714',
  },
  status: {
    fontSize: 14,
    color: '#6b6257',
    textAlign: 'center',
  },
})
