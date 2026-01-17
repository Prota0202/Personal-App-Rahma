import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes } from 'adhan'
import { format } from 'date-fns'

export type PrayerTimesResult = {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export const buildPrayerTimes = (latitude: number, longitude: number, methodKey = 'MuslimWorldLeague') => {
  const methods = {
    MuslimWorldLeague: CalculationMethod.MuslimWorldLeague(),
    Egyptian: CalculationMethod.Egyptian(),
    Karachi: CalculationMethod.Karachi(),
    UmmAlQura: CalculationMethod.UmmAlQura(),
    Dubai: CalculationMethod.Dubai(),
    MoonsightingCommittee: CalculationMethod.MoonsightingCommittee(),
    NorthAmerica: CalculationMethod.NorthAmerica(),
    Kuwait: CalculationMethod.Kuwait(),
    Qatar: CalculationMethod.Qatar(),
    Singapore: CalculationMethod.Singapore(),
    Tehran: CalculationMethod.Tehran(),
    Turkey: CalculationMethod.Turkey(),
  }

  const params = methods[methodKey] || methods.MuslimWorldLeague
  const coordinates = new Coordinates(latitude, longitude)
  const today = new Date()
  const prayers = new AdhanPrayerTimes(coordinates, today, params)

  return {
    fajr: prayers.fajr,
    sunrise: prayers.sunrise,
    dhuhr: prayers.dhuhr,
    asr: prayers.asr,
    maghrib: prayers.maghrib,
    isha: prayers.isha,
  }
}

export const getNextPrayer = (prayerTimes: PrayerTimesResult) => {
  const now = new Date()
  const order: Array<keyof PrayerTimesResult> = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
  for (const key of order) {
    if (now < prayerTimes[key]) {
      return { key, time: prayerTimes[key] }
    }
  }
  return { key: 'fajr', time: prayerTimes.fajr }
}

export const formatTime = (date: Date) => format(date, 'h:mm a')
