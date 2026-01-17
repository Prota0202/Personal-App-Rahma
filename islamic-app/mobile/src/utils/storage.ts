import AsyncStorage from '@react-native-async-storage/async-storage'

export const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  const raw = await AsyncStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export const writeJson = async <T>(key: string, value: T) => {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

export const updateCounter = async (key: string, field: string, delta = 1) => {
  const current = await readJson<Record<string, number>>(key, {})
  const next = { ...current, [field]: (current[field] || 0) + delta }
  await writeJson(key, next)
  return next
}
