import AsyncStorage from '@react-native-async-storage/async-storage'

export type WidgetSnapshot = {
  updatedAt: number
  nextPrayerName: string
  nextPrayerTime: string
  latitude?: number
  longitude?: number
}

const STORAGE_KEY = 'rahma.widget.snapshot'

export const saveWidgetSnapshot = async (snapshot: WidgetSnapshot) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}

export const loadWidgetSnapshot = async () => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return JSON.parse(raw) as WidgetSnapshot
}
