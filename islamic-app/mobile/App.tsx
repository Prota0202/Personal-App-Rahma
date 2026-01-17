import { StatusBar } from 'expo-status-bar'
import { format } from 'date-fns'
import HijriDate from 'hijri-date'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  NativeModules,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import * as Location from 'expo-location'
import { azkarCategories } from './src/data/azkar'
import { duaaCategories } from './src/data/duaas'
import { hadiths } from './src/data/hadiths'
import { buildPrayerTimes, formatTime, getNextPrayer } from './src/utils/prayerTimes'
import { readJson, updateCounter, writeJson } from './src/utils/storage'
import { loadWidgetSnapshot, saveWidgetSnapshot } from './src/utils/widgetStore'

type TabKey =
  | 'home'
  | 'prayer'
  | 'quran'
  | 'duaas'
  | 'azkar'
  | 'tasbih'
  | 'hadiths'
  | 'calendar'
  | 'favorites'
  | 'stats'
  | 'qibla'

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'home', label: 'Accueil', icon: '🏠' },
  { key: 'prayer', label: 'Prière', icon: '🕌' },
  { key: 'quran', label: 'Coran', icon: '📖' },
  { key: 'duaas', label: 'Douas', icon: '🤲' },
  { key: 'azkar', label: 'Azkar', icon: '📿' },
  { key: 'tasbih', label: 'Tasbih', icon: '🧿' },
  { key: 'hadiths', label: 'Hadiths', icon: '📚' },
  { key: 'calendar', label: 'Calendrier', icon: '📅' },
  { key: 'favorites', label: 'Favoris', icon: '⭐' },
  { key: 'stats', label: 'Stats', icon: '📊' },
  { key: 'qibla', label: 'Qibla', icon: '🧭' },
]

type FavoriteVerse = {
  id: string
  surahNumber: number
  surahName: string
  ayahNumber: number
  text: string
  translation?: string
}

type FavoriteDuaa = {
  id: number
  title: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

type FavoriteHadith = {
  id: number
  title: string
  arabic: string
  transliteration: string
  translation: string
  reference: string
}

type FavoritesState = {
  verses: FavoriteVerse[]
  duaas: FavoriteDuaa[]
  hadiths: FavoriteHadith[]
}

type Surah = {
  number: number
  name: string
  arabic: string
  english: string
  ayahs: number
  revelationType: string
}

type Ayah = {
  number: number
  text: string
  translation: string
}

const FAVORITES_KEY = 'rahma.favorites'
const STATS_KEY = 'rahma.stats'
const TASBIH_KEY = 'rahma.tasbih.session'

export default function App() {
  const [status, setStatus] = useState('Requesting location...')
  const [nextPrayerLabel, setNextPrayerLabel] = useState('—')
  const [nextPrayerTime, setNextPrayerTime] = useState('—')
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [prayerTimes, setPrayerTimes] = useState<ReturnType<typeof buildPrayerTimes> | null>(
    null
  )
  const [locationLabel, setLocationLabel] = useState('—')
  const [favorites, setFavorites] = useState<FavoritesState>({
    verses: [],
    duaas: [],
    hadiths: [],
  })
  const [stats, setStats] = useState<Record<string, number>>({})
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null)
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [ayahs, setAyahs] = useState<Ayah[]>([])
  const [quranLoading, setQuranLoading] = useState(false)
  const [quranError, setQuranError] = useState<string | null>(null)
  const [quranSearch, setQuranSearch] = useState('')
  const [showTranslation, setShowTranslation] = useState(true)
  const [selectedDuaaCategory, setSelectedDuaaCategory] = useState(duaaCategories[0]?.key ?? '')
  const [selectedDuaaId, setSelectedDuaaId] = useState<number | null>(null)
  const [selectedAzkarCategory, setSelectedAzkarCategory] = useState(azkarCategories[0]?.key ?? '')
  const [selectedAzkarId, setSelectedAzkarId] = useState<number | null>(null)
  const [tasbihCount, setTasbihCount] = useState(0)
  const [tasbihSessionTotal, setTasbihSessionTotal] = useState(0)
  const [selectedDhikr, setSelectedDhikr] = useState<'SubhanAllah' | 'Alhamdulillah' | 'AllahuAkbar'>(
    'SubhanAllah'
  )
  const [selectedHadithId, setSelectedHadithId] = useState<number | null>(null)
  const [hadithSearch, setHadithSearch] = useState('')

  useEffect(() => {
    const init = async () => {
      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync()
      if (permissionStatus !== 'granted') {
        setStatus('Location permission denied.')
        return
      }

      const position = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = position.coords
      const prayers = buildPrayerTimes(latitude, longitude)
      const nextPrayer = getNextPrayer(prayers)

      setNextPrayerLabel(nextPrayer.key.toUpperCase())
      setNextPrayerTime(formatTime(nextPrayer.time))
      setStatus('Location ready')
      setLocationLabel(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
      setPrayerTimes(prayers)

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

  useEffect(() => {
    readJson<FavoritesState>(FAVORITES_KEY, { verses: [], duaas: [], hadiths: [] }).then(
      setFavorites
    )
    readJson<Record<string, number>>(STATS_KEY, {}).then(setStats)
    readJson<number>(TASBIH_KEY, 0).then(setTasbihSessionTotal)
  }, [])

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        setQuranLoading(true)
        const response = await fetch('https://api.alquran.cloud/v1/surah')
        const data = await response.json()
        if (data.code === 200 && data.data) {
          const formatted: Surah[] = data.data.map((surah: any) => ({
            number: surah.number,
            name: surah.englishName,
            arabic: surah.name,
            english: surah.englishNameTranslation,
            ayahs: surah.numberOfAyahs,
            revelationType: surah.revelationType,
          }))
          setSurahs(formatted)
        } else {
          setQuranError('Impossible de charger les sourates.')
        }
      } catch {
        setQuranError('Erreur de connexion.')
      } finally {
        setQuranLoading(false)
      }
    }

    fetchSurahs()
  }, [])

  useEffect(() => {
    if (!selectedSurah) return
    const fetchAyahs = async () => {
      try {
        setQuranLoading(true)
        setAyahs([])
        const [arabicRes, translationRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}`),
          fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah.number}/en.sahih`),
        ])
        const arabicData = await arabicRes.json()
        const translationData = await translationRes.json()
        if (arabicData.code === 200 && translationData.code === 200) {
          const arabicAyahs = arabicData.data.ayahs || []
          const translationAyahs = translationData.data.ayahs || []
          const combined: Ayah[] = arabicAyahs.map((ayah: any, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: translationAyahs[index]?.text || '',
          }))
          setAyahs(combined)
          setQuranError(null)
        } else {
          setQuranError('Impossible de charger la sourate.')
        }
      } catch {
        setQuranError('Erreur de connexion.')
      } finally {
        setQuranLoading(false)
      }
    }

    fetchAyahs()
  }, [selectedSurah])

  const quickActions = useMemo(
    () => [
      { key: 'prayer' as TabKey, label: 'Horaires', icon: '🕌' },
      { key: 'quran' as TabKey, label: 'Coran', icon: '📖' },
      { key: 'azkar' as TabKey, label: 'Azkar', icon: '📿' },
      { key: 'qibla' as TabKey, label: 'Qibla', icon: '🧭' },
    ],
    []
  )

  const bumpStat = useCallback(async (field: string) => {
    const next = await updateCounter(STATS_KEY, field, 1)
    setStats(next)
  }, [])

  const toggleFavoriteVerse = async (verse: FavoriteVerse) => {
    const exists = favorites.verses.some((item) => item.id === verse.id)
    const next = {
      ...favorites,
      verses: exists
        ? favorites.verses.filter((item) => item.id !== verse.id)
        : [...favorites.verses, verse],
    }
    setFavorites(next)
    await writeJson(FAVORITES_KEY, next)
  }

  const toggleFavoriteDuaa = async (duaa: FavoriteDuaa) => {
    const exists = favorites.duaas.some((item) => item.id === duaa.id)
    const next = {
      ...favorites,
      duaas: exists
        ? favorites.duaas.filter((item) => item.id !== duaa.id)
        : [...favorites.duaas, duaa],
    }
    setFavorites(next)
    await writeJson(FAVORITES_KEY, next)
  }

  const toggleFavoriteHadith = async (hadith: FavoriteHadith) => {
    const exists = favorites.hadiths.some((item) => item.id === hadith.id)
    const next = {
      ...favorites,
      hadiths: exists
        ? favorites.hadiths.filter((item) => item.id !== hadith.id)
        : [...favorites.hadiths, hadith],
    }
    setFavorites(next)
    await writeJson(FAVORITES_KEY, next)
  }

  const selectedDuaaCategoryData =
    duaaCategories.find((category) => category.key === selectedDuaaCategory) ?? duaaCategories[0]
  const selectedDuaa =
    selectedDuaaCategoryData?.items.find((item) => item.id === selectedDuaaId) ?? null
  const selectedAzkarCategoryData =
    azkarCategories.find((category) => category.key === selectedAzkarCategory) ??
    azkarCategories[0]
  const selectedAzkar =
    selectedAzkarCategoryData?.items.find((item) => item.id === selectedAzkarId) ?? null
  const selectedHadith = hadiths.find((item) => item.id === selectedHadithId) ?? null

  const renderPrayerTimes = () => {
    if (!prayerTimes) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horaires de prière</Text>
          <Text style={styles.sectionSubtitle}>{status}</Text>
        </View>
      )
    }

    const rows: Array<{ label: string; key: keyof typeof prayerTimes }> = [
      { label: 'Fajr', key: 'fajr' },
      { label: 'Sunrise', key: 'sunrise' },
      { label: 'Dhuhr', key: 'dhuhr' },
      { label: 'Asr', key: 'asr' },
      { label: 'Maghrib', key: 'maghrib' },
      { label: 'Isha', key: 'isha' },
    ]

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horaires de prière</Text>
        <Text style={styles.sectionSubtitle}>Coordonnées: {locationLabel}</Text>
        <View style={styles.card}>
          {rows.map((row) => (
            <View key={row.key} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{formatTime(prayerTimes[row.key])}</Text>
            </View>
          ))}
        </View>
      </View>
    )
  }

  const renderQuran = () => {
    if (selectedSurah) {
      return (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedSurah(null)}
          >
            <Text style={styles.backButtonText}>← Retour aux sourates</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>{selectedSurah.arabic}</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedSurah.name} · {selectedSurah.english}
          </Text>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowTranslation((prev) => !prev)}
          >
            <Text style={styles.toggleButtonText}>
              {showTranslation ? 'Masquer la traduction' : 'Afficher la traduction'}
            </Text>
          </TouchableOpacity>
          {quranLoading ? (
            <Text style={styles.sectionSubtitle}>Chargement...</Text>
          ) : quranError ? (
            <Text style={styles.sectionSubtitle}>{quranError}</Text>
          ) : (
            <View style={styles.list}>
              {ayahs.map((ayah) => {
                const verseId = `${selectedSurah.number}-${ayah.number}`
                const isFavorite = favorites.verses.some((item) => item.id === verseId)
                return (
                  <View key={verseId} style={styles.card}>
                    <View style={styles.row}>
                      <Text style={styles.rowLabel}>Ayah {ayah.number}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          toggleFavoriteVerse({
                            id: verseId,
                            surahNumber: selectedSurah.number,
                            surahName: selectedSurah.name,
                            ayahNumber: ayah.number,
                            text: ayah.text,
                            translation: ayah.translation,
                          })
                        }
                      >
                        <Text style={styles.favoriteIcon}>{isFavorite ? '★' : '☆'}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.arabicText}>{ayah.text}</Text>
                    {showTranslation && (
                      <Text style={styles.translationText}>{ayah.translation}</Text>
                    )}
                  </View>
                )
              })}
            </View>
          )}
        </View>
      )
    }

    const filteredSurahs = surahs.filter((surah) => {
      if (!quranSearch) return true
      const query = quranSearch.toLowerCase()
      return (
        surah.name.toLowerCase().includes(query) ||
        surah.english.toLowerCase().includes(query) ||
        surah.arabic.includes(quranSearch)
      )
    })

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Le Coran</Text>
        <Text style={styles.sectionSubtitle}>Choisis une sourate</Text>
        <TextInput
          value={quranSearch}
          onChangeText={setQuranSearch}
          placeholder="Rechercher une sourate"
          style={styles.searchInput}
          placeholderTextColor="#6b6257"
        />
        {quranLoading && <Text style={styles.sectionSubtitle}>Chargement...</Text>}
        {quranError && <Text style={styles.sectionSubtitle}>{quranError}</Text>}
        <View style={styles.list}>
          {filteredSurahs.map((surah) => (
            <TouchableOpacity
              key={surah.number}
              style={styles.listCard}
              onPress={() => {
                setSelectedSurah(surah)
                bumpStat('quranReads')
              }}
            >
              <Text style={styles.listTitle}>
                {surah.number}. {surah.name}
              </Text>
              <Text style={styles.listSubtitle}>{surah.arabic}</Text>
              <Text style={styles.listMeta}>{surah.ayahs} ayahs</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  const renderDuaas = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Douas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {duaaCategories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.chip,
              selectedDuaaCategory === category.key && styles.chipActive,
            ]}
            onPress={() => {
              setSelectedDuaaCategory(category.key)
              setSelectedDuaaId(null)
            }}
          >
            <Text
              style={[
                styles.chipText,
                selectedDuaaCategory === category.key && styles.chipTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedDuaa ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>{selectedDuaa.title}</Text>
            <TouchableOpacity
              onPress={() => toggleFavoriteDuaa(selectedDuaa)}
            >
              <Text style={styles.favoriteIcon}>
                {favorites.duaas.some((item) => item.id === selectedDuaa.id) ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.arabicText}>{selectedDuaa.arabic}</Text>
          <Text style={styles.translationText}>{selectedDuaa.transliteration}</Text>
          <Text style={styles.translationText}>{selectedDuaa.translation}</Text>
          <Text style={styles.listMeta}>{selectedDuaa.reference}</Text>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setSelectedDuaaId(null)}
          >
            <Text style={styles.secondaryButtonText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.list}>
          {selectedDuaaCategoryData?.items.map((duaa) => (
            <TouchableOpacity
              key={duaa.id}
              style={styles.listCard}
              onPress={() => {
                setSelectedDuaaId(duaa.id)
                bumpStat('duaaReads')
              }}
            >
              <Text style={styles.listTitle}>{duaa.title}</Text>
              <Text style={styles.listSubtitle}>{duaa.reference}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )

  const renderAzkar = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Azkar</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {azkarCategories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.chip,
              selectedAzkarCategory === category.key && styles.chipActive,
            ]}
            onPress={() => {
              setSelectedAzkarCategory(category.key)
              setSelectedAzkarId(null)
            }}
          >
            <Text
              style={[
                styles.chipText,
                selectedAzkarCategory === category.key && styles.chipTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedAzkar ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{selectedAzkar.title}</Text>
          <Text style={styles.arabicText}>{selectedAzkar.arabic}</Text>
          <Text style={styles.translationText}>{selectedAzkar.transliteration}</Text>
          <Text style={styles.translationText}>{selectedAzkar.translation}</Text>
          {selectedAzkar.reference && (
            <Text style={styles.listMeta}>{selectedAzkar.reference}</Text>
          )}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setSelectedAzkarId(null)}
          >
            <Text style={styles.secondaryButtonText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.list}>
          {selectedAzkarCategoryData?.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.listCard}
              onPress={() => {
                setSelectedAzkarId(item.id)
                bumpStat('azkarReads')
              }}
            >
              <Text style={styles.listTitle}>{item.title}</Text>
              {item.reference && <Text style={styles.listSubtitle}>{item.reference}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )

  const renderTasbih = () => {
    const dhikrs = {
      SubhanAllah: {
        label: 'SubhanAllah',
        arabic: 'سُبْحَانَ اللَّهِ',
        target: 33,
      },
      Alhamdulillah: {
        label: 'Alhamdulillah',
        arabic: 'الْحَمْدُ لِلَّهِ',
        target: 33,
      },
      AllahuAkbar: {
        label: 'Allahu Akbar',
        arabic: 'اللَّهُ أَكْبَرُ',
        target: 33,
      },
    }
    const current = dhikrs[selectedDhikr]
    const handleCount = async () => {
      const next = tasbihCount + 1
      setTasbihCount(next)
      const total = tasbihSessionTotal + 1
      setTasbihSessionTotal(total)
      await writeJson(TASBIH_KEY, total)
      bumpStat('tasbihCounts')
      if (next >= current.target) {
        setTasbihCount(0)
      }
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasbih</Text>
        <Text style={styles.sectionSubtitle}>Compteur de dhikr</Text>
        <View style={styles.card}>
          <Text style={styles.arabicText}>{current.arabic}</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Compteur</Text>
            <Text style={styles.rowValue}>
              {tasbihCount}/{current.target}
            </Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCount}>
            <Text style={styles.primaryButtonText}>Compter</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total session</Text>
            <Text style={styles.rowValue}>{tasbihSessionTotal}</Text>
          </View>
        </View>
        <View style={styles.chipRow}>
          {Object.keys(dhikrs).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.chip, selectedDhikr === key && styles.chipActive]}
              onPress={() => {
                setSelectedDhikr(key as typeof selectedDhikr)
                setTasbihCount(0)
              }}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedDhikr === key && styles.chipTextActive,
                ]}
              >
                {dhikrs[key as keyof typeof dhikrs].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  const renderHadiths = () => {
    if (selectedHadith) {
      return (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedHadithId(null)}
          >
            <Text style={styles.backButtonText}>← Retour aux hadiths</Text>
          </TouchableOpacity>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.sectionTitle}>{selectedHadith.title}</Text>
              <TouchableOpacity
                onPress={() => toggleFavoriteHadith(selectedHadith)}
              >
                <Text style={styles.favoriteIcon}>
                  {favorites.hadiths.some((item) => item.id === selectedHadith.id) ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.arabicText}>{selectedHadith.arabic}</Text>
            <Text style={styles.translationText}>{selectedHadith.transliteration}</Text>
            <Text style={styles.translationText}>{selectedHadith.translation}</Text>
            <Text style={styles.listMeta}>
              {selectedHadith.collection} · {selectedHadith.reference}
            </Text>
          </View>
        </View>
      )
    }

    const filtered = hadiths.filter((hadith) => {
      if (!hadithSearch) return true
      const query = hadithSearch.toLowerCase()
      return (
        hadith.title.toLowerCase().includes(query) ||
        hadith.collection.toLowerCase().includes(query)
      )
    })

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hadiths</Text>
        <TextInput
          value={hadithSearch}
          onChangeText={setHadithSearch}
          placeholder="Rechercher un hadith"
          style={styles.searchInput}
          placeholderTextColor="#6b6257"
        />
        <View style={styles.list}>
          {filtered.map((hadith) => (
            <TouchableOpacity
              key={hadith.id}
              style={styles.listCard}
              onPress={() => {
                setSelectedHadithId(hadith.id)
                bumpStat('hadithReads')
              }}
            >
              <Text style={styles.listTitle}>{hadith.title}</Text>
              <Text style={styles.listSubtitle}>{hadith.collection}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  }

  const renderCalendar = () => {
    const today = new Date()
    const hijri = new HijriDate(today)
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Calendrier</Text>
        <View style={styles.card}>
          <Text style={styles.listTitle}>{format(today, 'EEEE d MMMM yyyy')}</Text>
          <Text style={styles.listSubtitle}>
            {hijri.getDate()} / {hijri.getMonth() + 1} / {hijri.getFullYear()} AH
          </Text>
        </View>
      </View>
    )
  }

  const renderFavorites = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Favoris</Text>
      <Text style={styles.sectionSubtitle}>Versets, douas et hadiths</Text>
      {favorites.verses.length === 0 && favorites.duaas.length === 0 && favorites.hadiths.length === 0 ? (
        <Text style={styles.sectionSubtitle}>Aucun favori pour le moment.</Text>
      ) : (
        <View style={styles.list}>
          {favorites.verses.map((item) => (
            <View key={item.id} style={styles.listCard}>
              <View style={styles.row}>
                <Text style={styles.listTitle}>
                  {item.surahName} · Ayah {item.ayahNumber}
                </Text>
                <TouchableOpacity onPress={() => toggleFavoriteVerse(item)}>
                  <Text style={styles.favoriteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.arabicText}>{item.text}</Text>
              {item.translation && (
                <Text style={styles.translationText}>{item.translation}</Text>
              )}
            </View>
          ))}
          {favorites.duaas.map((item) => (
            <View key={`duaa-${item.id}`} style={styles.listCard}>
              <View style={styles.row}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => toggleFavoriteDuaa(item)}>
                  <Text style={styles.favoriteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.arabicText}>{item.arabic}</Text>
              <Text style={styles.translationText}>{item.translation}</Text>
            </View>
          ))}
          {favorites.hadiths.map((item) => (
            <View key={`hadith-${item.id}`} style={styles.listCard}>
              <View style={styles.row}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => toggleFavoriteHadith(item)}>
                  <Text style={styles.favoriteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.arabicText}>{item.arabic}</Text>
              <Text style={styles.translationText}>{item.translation}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )

  const renderStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Statistiques</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Coran</Text>
          <Text style={styles.rowValue}>{stats.quranReads || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Douas</Text>
          <Text style={styles.rowValue}>{stats.duaaReads || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Azkar</Text>
          <Text style={styles.rowValue}>{stats.azkarReads || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Hadiths</Text>
          <Text style={styles.rowValue}>{stats.hadithReads || 0}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Tasbih</Text>
          <Text style={styles.rowValue}>{stats.tasbihCounts || 0}</Text>
        </View>
      </View>
    </View>
  )

  const renderQibla = () => {
    const [latStr, lonStr] = locationLabel.split(',').map((item) => item.trim())
    const lat = Number(latStr)
    const lon = Number(lonStr)
    const kaabaLat = 21.4225
    const kaabaLon = 39.8262
    const toRad = (value: number) => (value * Math.PI) / 180
    const toDeg = (value: number) => (value * 180) / Math.PI
    const bearing =
      Number.isFinite(lat) && Number.isFinite(lon)
        ? (toDeg(
            Math.atan2(
              Math.sin(toRad(kaabaLon - lon)),
              Math.cos(toRad(lat)) * Math.tan(toRad(kaabaLat)) -
                Math.sin(toRad(lat)) * Math.cos(toRad(kaabaLon - lon))
            )
          ) + 360) % 360
        : null

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Qibla</Text>
        <View style={styles.card}>
          <Text style={styles.sectionSubtitle}>Orientation recommandée</Text>
          <Text style={styles.qiblaValue}>
            {bearing === null ? '—' : `${bearing.toFixed(0)}°`}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Tiens le téléphone à plat et oriente-toi vers cet angle.
          </Text>
        </View>
      </View>
    )
  }

  const renderHome = () => (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Rahma</Text>
        <Text style={styles.heroSubtitle}>Votre compagnon spirituel mobile.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Prochaine prière</Text>
        <Text style={styles.cardValue}>{nextPrayerLabel}</Text>
        <Text style={styles.cardTime}>{nextPrayerTime}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Raccourcis</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionCard}
              onPress={() => setActiveTab(action.key)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome()
      case 'prayer':
        return renderPrayerTimes()
      case 'quran':
        return renderQuran()
      case 'duaas':
        return renderDuaas()
      case 'azkar':
        return renderAzkar()
      case 'tasbih':
        return renderTasbih()
      case 'hadiths':
        return renderHadiths()
      case 'calendar':
        return renderCalendar()
      case 'favorites':
        return renderFavorites()
      case 'stats':
        return renderStats()
      case 'qibla':
        return renderQibla()
      default:
        return renderHome()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rahma Mobile</Text>
        <Text style={styles.headerStatus}>{status}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1e8',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1714',
  },
  headerStatus: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b6257',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  hero: {
    paddingVertical: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1714',
  },
  heroSubtitle: {
    marginTop: 6,
    color: '#6b6257',
    fontSize: 14,
  },
  card: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
    shadowColor: '#120e0a',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cardLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#6b6257',
  },
  cardValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1714',
  },
  cardTime: {
    marginTop: 4,
    fontSize: 16,
    color: '#1a1714',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1714',
  },
  sectionSubtitle: {
    marginTop: 6,
    color: '#6b6257',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: {
    color: '#1a1714',
    fontSize: 15,
  },
  rowValue: {
    color: '#1a1714',
    fontWeight: '600',
  },
  actionGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flexBasis: '48%',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    marginTop: 8,
    color: '#1a1714',
    fontWeight: '600',
  },
  list: {
    marginTop: 12,
    gap: 12,
  },
  listCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1714',
  },
  listSubtitle: {
    marginTop: 4,
    color: '#6b6257',
    fontSize: 13,
  },
  listMeta: {
    marginTop: 8,
    color: '#8a7f71',
    fontSize: 12,
  },
  arabicText: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'right',
    fontFamily: 'Times New Roman',
    color: '#1a1714',
  },
  translationText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6b6257',
  },
  searchInput: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5ded0',
    backgroundColor: '#fffdf8',
    color: '#1a1714',
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: '#6b6257',
  },
  toggleButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#efe6d8',
  },
  toggleButtonText: {
    color: '#1a1714',
    fontSize: 12,
    fontWeight: '600',
  },
  chipRow: {
    marginTop: 12,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#e5ded0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#efe6d8',
    borderColor: '#c9aa5a',
  },
  chipText: {
    color: '#6b6257',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#1a1714',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1c1a17',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#efe6d8',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1a1714',
    fontWeight: '600',
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#c9aa5a',
  },
  qiblaValue: {
    marginTop: 12,
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1714',
  },
  placeholderCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5ded0',
    backgroundColor: '#fffdf8',
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1714',
  },
  placeholderText: {
    marginTop: 6,
    color: '#6b6257',
    fontSize: 13,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fffdf8',
    borderTopWidth: 1,
    borderTopColor: '#e5ded0',
    gap: 6,
  },
  tabItem: {
    flexBasis: '23%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: '#f0e8da',
  },
  tabIcon: {
    fontSize: 16,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
    color: '#6b6257',
  },
  tabLabelActive: {
    color: '#1a1714',
    fontWeight: '600',
  },
})
