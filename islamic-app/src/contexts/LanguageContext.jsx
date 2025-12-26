import React, { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    prayerTimes: 'Prayer Times',
    quran: 'Quran',
    duaas: 'Duaas',
    tasbih: 'Tasbih',
    hadiths: 'Hadiths',
    calendar: 'Calendar',
    favorites: 'Favorites',
    statistics: 'Statistics',
    qibla: 'Qibla',
    
    // Common
    search: 'Search',
    loading: 'Loading...',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    retry: 'Retry',
    at: 'at',
    
    // Prayer Times
    prayerTimesHeader: 'Prayer Times',
    nextPrayer: 'Next Prayer',
    currentPrayer: 'Current Prayer',
    current: 'Current',
    enableNotifications: 'Enable Notifications',
    enableReminders: 'Enable Reminders',
    remindMe: 'Remind me',
    minutesBefore: 'minutes before',
    calculationMethod: 'Calculation Method:',
    location: 'Location',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    useMyLocation: 'Use My Location',
    
    // Quran
    theHolyQuran: 'The Holy Quran',
    readAndReflect: 'Read and reflect upon the words of Allah',
    searchSurah: 'Search for a Surah...',
    backToSurahs: 'Back to Surahs',
    showTranslation: 'Show Translation',
    ayahs: 'Ayahs',
    nextSurah: 'Next Surah',
    lastSurah: 'Last Surah',
    
    // Duaas
    duaasSupplications: 'Duaas & Supplications',
    authenticDuas: 'Authentic duas from the Quran and Sunnah',
    showTransliteration: 'Show Transliteration',
    
    // Favorites
    myFavorites: 'My Favorites',
    bookmarkedVerses: 'Your bookmarked verses and duas',
    noBookmarkedVerses: 'No bookmarked verses yet',
    noBookmarkedDuas: 'No bookmarked duas yet',
    bookmarkFromQuran: 'Bookmark verses from the Quran page to see them here',
    bookmarkFromDuas: 'Bookmark duas from the Duaas page to see them here',
    export: 'Export',
    import: 'Import',
    verses: 'Verses',
    duas: 'Duaas',
    
    // Statistics
    readingStatistics: 'Reading Statistics',
    trackYourReadingProgress: 'Track your reading progress and time spent',
    today: 'Today',
    thisWeek: 'This Week',
    allTime: 'All Time',
    timeSpentToday: 'Time spent today',
    versesRead: 'Verses read',
    hadithsRead: 'Hadiths read',
    duaasRead: 'Duaas read',
    totalTimeThisWeek: 'Total time this week',
    totalTimeSpent: 'Total time spent',
    totalVersesRead: 'Total verses read',
    totalHadithsRead: 'Total hadiths read',
    totalDuaasRead: 'Total duaas read',
    surahsCompleted: 'surahs completed',
    surah: 'Surah',
    completedSurahs: 'Completed Surahs',
    resetStatistics: 'Reset Statistics',
    clickAgainToConfirm: 'Click again to confirm',
    
    // Bookmarks
    continueReading: 'Continue Reading',
    continueReadingFrom: 'Continue reading from',
    continueFromAyah: 'Continue from Ayah',
    ayah: 'Ayah',
    clearBookmark: 'Clear bookmark',
    
    // Calendar
    islamicCalendar: 'Islamic Calendar',
    hijriCalendar: 'Hijri Calendar',
    gregorianCalendar: 'Gregorian Calendar',
    importantDates: 'Important Dates This Year',
    calendarNote: 'Note: Dates may vary by 1-2 days based on moon sighting in your region. Please verify with local authorities for religious observances.',
    datesFormatExplanation: 'Format: Month-Day (Hijri Calendar)',
    datesFormatExample: 'Example: "9-1" = 1st day of Ramadan (month 9, day 1 in Hijri calendar). Dates are automatically converted from Gregorian to Hijri.',
    datesInGregorian: 'Important dates shown in Gregorian calendar for this year',
    datesGregorianNote: 'These are approximate dates. Actual dates may vary by 1-2 days based on moon sighting.',
    importantDatesDisclaimer: 'Important Note',
    importantDatesDisclaimerText: 'Not all important dates are religious celebrations (Eid). Some dates are historical events or recommended days for worship. For example, the birth of Prophet Muhammad (PBUH) is not celebrated as a religious festival in Sunni tradition. Only Eid al-Fitr and Eid al-Adha are official Islamic festivals.',
    hijriDate: 'Hijri Date',
    gregorianDate: 'Gregorian Date',
    hijri: 'Hijri',
    dateNotFound: 'Date not found',
    
    // Dashboard
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon',
    goodEvening: 'Good Evening',
    readQuran: 'Read Quran',
    continueReading: 'Continue your reading',
    dhikrCounter: 'Dhikr Counter',
    countRemembrance: 'Count your remembrance',
    myFavorites2: 'My Favorites',
    todaysPrayerTimes: "Today's Prayer Times",
    viewDetails: 'View Details',
    viewAll: 'View All',
    dailyReminder: 'Daily Reminder',
    rememberAllah: 'Remember Allah in all that you do',
    authenticSayings: 'Authentic sayings',
    importantDatesLabel: 'Important dates',
    
    // Tasbih
    tasbihDhikrCounter: 'Tasbih (Dhikr Counter)',
    countYourRemembrance: 'Count your remembrance of Allah',
    selectDhikr: 'Select Dhikr:',
    tapToCount: 'Tap to Count',
    reset: 'Reset',
    vibration: 'Vibration',
    sessionTotal: 'Session Total',
    currentRound: 'Current Round',
    resetSessionTotal: 'Reset Session Total',
    tasbihTips: 'Tips:',
    useThumb: 'Use your thumb to count on your fingers for traditional Tasbih',
    complete33Rounds: 'Complete 33 rounds of each: SubhanAllah, Alhamdulillah, Allahu Akbar',
    trackDailyDhikr: 'The app helps you track your daily Dhikr',
    enableVibration: 'Enable vibration for haptic feedback when counting',
    
    // Qibla
    qiblaDirection: 'Qibla Direction',
    findDirectionToKaaba: 'Find the direction to the Kaaba in Mecca',
    qiblaDirectionLabel: 'Qibla Direction',
    yourHeading: 'Your Heading',
    yourLocation: 'Your Location',
    instructions: 'Instructions:',
    holdDeviceFlat: 'Hold your device flat and rotate until the 🕋 marker points up',
    redArrowShows: 'The red arrow shows the direction to face',
    enableLocationServices: 'Make sure location services are enabled for best accuracy',
    compassFunctionality: 'For compass functionality, allow device orientation access when prompted',
    
    // Hadiths
    translation: 'Translation:',
    explanation: 'Explanation:',
    reference: 'Reference:',
    showExplanation: 'Show Explanation',
    
    // Errors and Messages
    unableToGetLocation: 'Unable to get your location. Please enable location services.',
    unableToConnectAPI: 'Unable to connect to the API. Please check your internet connection.',
    unableToLoadContent: 'Unable to load content. Please check your internet connection.',
    notificationsBlocked: 'Notifications are blocked. Please enable them in your browser settings.',
    browserNotSupported: 'Your browser does not support notifications',
    errorImportingBookmarks: 'Error importing bookmarks. Please check the file format.',
    bookmarkThis: 'Bookmark this',
    removeBookmark: 'Remove bookmark',
    bookmarked: 'Bookmarked',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    prayerTimes: 'Horaires de Prière',
    quran: 'Coran',
    duaas: 'Douas',
    tasbih: 'Tasbih',
    hadiths: 'Hadiths',
    calendar: 'Calendrier',
    favorites: 'Favoris',
    statistics: 'Statistiques',
    qibla: 'Qibla',
    
    // Common
    search: 'Rechercher',
    loading: 'Chargement...',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    retry: 'Réessayer',
    at: 'à',
    
    // Prayer Times
    prayerTimesHeader: 'Horaires de Prière',
    nextPrayer: 'Prochaine Prière',
    currentPrayer: 'Prière Actuelle',
    current: 'Actuelle',
    enableNotifications: 'Activer les Notifications',
    enableReminders: 'Activer les Rappels',
    remindMe: 'Me rappeler',
    minutesBefore: 'minutes avant',
    calculationMethod: 'Méthode de Calcul:',
    location: 'Localisation',
    latitude: 'Latitude:',
    longitude: 'Longitude:',
    useMyLocation: 'Utiliser Ma Localisation',
    
    // Quran
    theHolyQuran: 'Le Saint Coran',
    readAndReflect: 'Lisez et méditez sur les paroles d\'Allah',
    searchSurah: 'Rechercher une Sourate...',
    backToSurahs: 'Retour aux Sourates',
    showTranslation: 'Afficher la Traduction',
    ayahs: 'Versets',
    nextSurah: 'Sourate Suivante',
    lastSurah: 'Dernière Sourate',
    
    // Duaas
    duaasSupplications: 'Douas & Invocations',
    authenticDuas: 'Douas authentiques du Coran et de la Sunnah',
    showTransliteration: 'Afficher la Translittération',
    
    // Favorites
    myFavorites: 'Mes Favoris',
    bookmarkedVerses: 'Vos versets et douas favoris',
    noBookmarkedVerses: 'Aucun verset favori pour le moment',
    noBookmarkedDuas: 'Aucune doua favorite pour le moment',
    bookmarkFromQuran: 'Ajoutez des versets favoris depuis la page Coran pour les voir ici',
    bookmarkFromDuas: 'Ajoutez des douas favorites depuis la page Douas pour les voir ici',
    export: 'Exporter',
    import: 'Importer',
    verses: 'Versets',
    duas: 'Douas',
    
    // Statistics
    readingStatistics: 'Statistiques de Lecture',
    trackYourReadingProgress: 'Suivez vos progrès de lecture et le temps passé',
    today: 'Aujourd\'hui',
    thisWeek: 'Cette Semaine',
    allTime: 'Tout Temps',
    timeSpentToday: 'Temps passé aujourd\'hui',
    versesRead: 'Versets lus',
    hadithsRead: 'Hadiths lus',
    duaasRead: 'Douas lues',
    totalTimeThisWeek: 'Temps total cette semaine',
    totalTimeSpent: 'Temps total passé',
    totalVersesRead: 'Total versets lus',
    totalHadithsRead: 'Total hadiths lus',
    totalDuaasRead: 'Total douas lues',
    surahsCompleted: 'sourates complétées',
    surah: 'Sourate',
    completedSurahs: 'Sourates Complétées',
    resetStatistics: 'Réinitialiser les Statistiques',
    clickAgainToConfirm: 'Cliquez à nouveau pour confirmer',
    
    // Bookmarks
    continueReading: 'Continuer la Lecture',
    continueReadingFrom: 'Continuer la lecture depuis',
    continueFromAyah: 'Continuer depuis l\'Ayah',
    ayah: 'Ayah',
    clearBookmark: 'Effacer le marque-page',
    
    // Calendar
    islamicCalendar: 'Calendrier Islamique',
    hijriCalendar: 'Calendrier Hijri',
    gregorianCalendar: 'Calendrier Grégorien',
    importantDates: 'Dates Importantes Cette Année',
    calendarNote: 'Note : Les dates peuvent varier de 1 à 2 jours selon l\'observation de la lune dans votre région. Veuillez vérifier auprès des autorités locales pour les observances religieuses.',
    datesFormatExplanation: 'Format : Mois-Jour (Calendrier Hijri)',
    datesFormatExample: 'Exemple : "9-1" = 1er jour du Ramadan (mois 9, jour 1 du calendrier hijri). Les dates sont automatiquement converties du calendrier grégorien vers le calendrier hijri.',
    datesInGregorian: 'Dates importantes affichées en calendrier grégorien pour cette année',
    datesGregorianNote: 'Ce sont des dates approximatives. Les dates réelles peuvent varier de 1 à 2 jours selon l\'observation de la lune.',
    importantDatesDisclaimer: 'Note Importante',
    importantDatesDisclaimerText: 'Toutes les dates importantes ne sont pas des fêtes religieuses (Eid). Certaines dates sont des événements historiques ou des jours recommandés pour l\'adoration. Par exemple, la naissance du Prophète Muhammad (PSL) n\'est pas célébrée comme une fête religieuse dans la tradition sunnite. Seuls Eid al-Fitr et Eid al-Adha sont des fêtes islamiques officielles.',
    hijriDate: 'Date Hijri',
    gregorianDate: 'Date Grégorienne',
    hijri: 'Hijri',
    dateNotFound: 'Date non trouvée',
    
    // Dashboard
    goodMorning: 'Bonjour',
    goodAfternoon: 'Bon Après-Midi',
    goodEvening: 'Bonsoir',
    readQuran: 'Lire le Coran',
    continueReading: 'Continuez votre lecture',
    dhikrCounter: 'Compteur de Dhikr',
    countRemembrance: 'Comptez votre dhikr',
    myFavorites2: 'Mes Favoris',
    todaysPrayerTimes: 'Horaires de Prière Aujourd\'hui',
    viewDetails: 'Voir les Détails',
    viewAll: 'Voir Tout',
    dailyReminder: 'Rappel Quotidien',
    rememberAllah: 'Rappelez-vous d\'Allah en tout ce que vous faites',
    authenticSayings: 'Auteurs authentiques',
    importantDatesLabel: 'Dates importantes',
    
    // Tasbih
    tasbihDhikrCounter: 'Tasbih (Compteur de Dhikr)',
    countYourRemembrance: 'Comptez vos invocations à Allah',
    selectDhikr: 'Sélectionner un Dhikr:',
    tapToCount: 'Appuyez pour Compter',
    reset: 'Réinitialiser',
    vibration: 'Vibration',
    sessionTotal: 'Total de la Session',
    currentRound: 'Tour Actuel',
    resetSessionTotal: 'Réinitialiser le Total',
    tasbihTips: 'Conseils:',
    useThumb: 'Utilisez votre pouce pour compter sur vos doigts pour le Tasbih traditionnel',
    complete33Rounds: 'Complétez 33 tours de chaque: SubhanAllah, Alhamdulillah, Allahu Akbar',
    trackDailyDhikr: 'L\'app vous aide à suivre votre dhikr quotidien',
    enableVibration: 'Activez la vibration pour un retour haptique lors du comptage',
    
    // Qibla
    qiblaDirection: 'Direction de la Qibla',
    findDirectionToKaaba: 'Trouver la direction de la Kaaba à La Mecque',
    qiblaDirectionLabel: 'Direction de la Qibla',
    yourHeading: 'Votre Cap',
    yourLocation: 'Votre Localisation',
    instructions: 'Instructions:',
    holdDeviceFlat: 'Tenez votre appareil à plat et tournez jusqu\'à ce que le marqueur 🕋 pointe vers le haut',
    redArrowShows: 'La flèche rouge indique la direction à suivre',
    enableLocationServices: 'Assurez-vous que les services de localisation sont activés pour une meilleure précision',
    compassFunctionality: 'Pour la fonctionnalité de la boussole, autorisez l\'accès à l\'orientation de l\'appareil lorsque vous y êtes invité',
    
    // Hadiths
    translation: 'Traduction:',
    explanation: 'Explication:',
    reference: 'Référence:',
    showExplanation: 'Afficher l\'Explication',
    
    // Errors and Messages
    unableToGetLocation: 'Impossible d\'obtenir votre localisation. Veuillez activer les services de localisation.',
    unableToConnectAPI: 'Impossible de se connecter à l\'API. Veuillez vérifier votre connexion Internet.',
    unableToLoadContent: 'Impossible de charger le contenu. Veuillez vérifier votre connexion Internet.',
    notificationsBlocked: 'Les notifications sont bloquées. Veuillez les activer dans les paramètres de votre navigateur.',
    browserNotSupported: 'Votre navigateur ne prend pas en charge les notifications',
    errorImportingBookmarks: 'Erreur lors de l\'importation des favoris. Veuillez vérifier le format du fichier.',
    bookmarkThis: 'Marquer comme favori',
    removeBookmark: 'Retirer des favoris',
    bookmarked: 'Favorisé',
  },
  nl: {
    // Navigation
    home: 'Home',
    prayerTimes: 'Gebedstijden',
    quran: 'Koran',
    duaas: 'Do\'a',
    tasbih: 'Tasbih',
    hadiths: 'Hadiths',
    calendar: 'Kalender',
    favorites: 'Favorieten',
    statistics: 'Statistieken',
    qibla: 'Qibla',
    
    // Common
    search: 'Zoeken',
    loading: 'Laden...',
    back: 'Terug',
    next: 'Volgende',
    previous: 'Vorige',
    retry: 'Opnieuw Proberen',
    at: 'om',
    
    // Prayer Times
    prayerTimesHeader: 'Gebedstijden',
    nextPrayer: 'Volgende Gebed',
    currentPrayer: 'Huidig Gebed',
    current: 'Huidig',
    enableNotifications: 'Meldingen Inschakelen',
    enableReminders: 'Herinneringen Inschakelen',
    remindMe: 'Herinner me',
    minutesBefore: 'minuten voor',
    calculationMethod: 'Berekeningsmethode:',
    location: 'Locatie',
    latitude: 'Breedtegraad:',
    longitude: 'Lengtegraad:',
    useMyLocation: 'Mijn Locatie Gebruiken',
    
    // Quran
    theHolyQuran: 'De Heilige Koran',
    readAndReflect: 'Lees en denk na over de woorden van Allah',
    searchSurah: 'Zoek een Soera...',
    backToSurahs: 'Terug naar Soera\'s',
    showTranslation: 'Vertaling Tonen',
    ayahs: 'Verzen',
    nextSurah: 'Volgende Soerah',
    lastSurah: 'Laatste Soerah',
    
    // Duaas
    duaasSupplications: 'Do\'a & Smeekbeden',
    authenticDuas: 'Authentieke do\'a uit de Koran en Soennah',
    showTransliteration: 'Uitspraak Tonen',
    
    // Favorites
    myFavorites: 'Mijn Favorieten',
    bookmarkedVerses: 'Uw favoriete verzen en do\'a',
    noBookmarkedVerses: 'Nog geen favoriete verzen',
    noBookmarkedDuas: 'Nog geen favoriete do\'a',
    bookmarkFromQuran: 'Markeer verzen op de Koranpagina om ze hier te zien',
    bookmarkFromDuas: 'Markeer do\'a op de Do\'apagina om ze hier te zien',
    export: 'Exporteren',
    import: 'Importeren',
    verses: 'Verzen',
    duas: 'Do\'a',
    
    // Statistics
    readingStatistics: 'Leesstatistieken',
    trackYourReadingProgress: 'Volg uw leesvoortgang en tijd besteed',
    today: 'Vandaag',
    thisWeek: 'Deze Week',
    allTime: 'Alle Tijd',
    timeSpentToday: 'Tijd vandaag besteed',
    versesRead: 'Verzen gelezen',
    hadithsRead: 'Hadiths gelezen',
    duaasRead: 'Do\'a gelezen',
    totalTimeThisWeek: 'Totale tijd deze week',
    totalTimeSpent: 'Totale tijd besteed',
    totalVersesRead: 'Totaal verzen gelezen',
    totalHadithsRead: 'Totaal hadiths gelezen',
    totalDuaasRead: 'Totaal do\'a gelezen',
    surahsCompleted: 'soerahs voltooid',
    surah: 'Soerah',
    completedSurahs: 'Voltooide Soerahs',
    resetStatistics: 'Statistieken Resetten',
    clickAgainToConfirm: 'Klik opnieuw om te bevestigen',
    
    // Bookmarks
    continueReading: 'Verder Lezen',
    continueReadingFrom: 'Verder lezen vanaf',
    continueFromAyah: 'Verder vanaf Ayah',
    ayah: 'Ayah',
    clearBookmark: 'Bladwijzer wissen',
    
    // Calendar
    islamicCalendar: 'Islamitische Kalender',
    hijriCalendar: 'Hijri Kalender',
    gregorianCalendar: 'Gregoriaanse Kalender',
    importantDates: 'Belangrijke Datums Dit Jaar',
    calendarNote: 'Let op: Datums kunnen met 1-2 dagen verschillen op basis van maanwaarneming in uw regio. Controleer bij lokale autoriteiten voor religieuze waarnemingen.',
    datesFormatExplanation: 'Formaat: Maand-Dag (Hijri Kalender)',
    datesFormatExample: 'Voorbeeld: "9-1" = 1e dag van Ramadan (maand 9, dag 1 in de Hijri kalender). Datums worden automatisch geconverteerd van Gregoriaans naar Hijri.',
    datesInGregorian: 'Belangrijke datums weergegeven in Gregoriaanse kalender voor dit jaar',
    datesGregorianNote: 'Dit zijn geschatte datums. Werkelijke datums kunnen met 1-2 dagen variëren op basis van maanwaarneming.',
    importantDatesDisclaimer: 'Belangrijke Opmerking',
    importantDatesDisclaimerText: 'Niet alle belangrijke datums zijn religieuze vieringen (Eid). Sommige datums zijn historische gebeurtenissen of aanbevolen dagen voor aanbidding. De geboorte van de Profeet Mohammed (vzmh) wordt bijvoorbeeld niet gevierd als een religieus feest in de soennitische traditie. Alleen Eid al-Fitr en Eid al-Adha zijn officiële islamitische feesten.',
    hijriDate: 'Hijri Datum',
    gregorianDate: 'Gregoriaanse Datum',
    hijri: 'Hijri',
    dateNotFound: 'Datum niet gevonden',
    
    // Dashboard
    goodMorning: 'Goedemorgen',
    goodAfternoon: 'Goedemiddag',
    goodEvening: 'Goedenavond',
    readQuran: 'Koran Lezen',
    continueReading: 'Ga door met lezen',
    dhikrCounter: 'Dhikr Teller',
    countRemembrance: 'Tel uw dhikr',
    myFavorites2: 'Mijn Favorieten',
    todaysPrayerTimes: 'Gebedstijden Vandaag',
    viewDetails: 'Details Bekijken',
    viewAll: 'Alles Bekijken',
    dailyReminder: 'Dagelijkse Herinnering',
    rememberAllah: 'Denk aan Allah in alles wat u doet',
    authenticSayings: 'Authentieke uitspraken',
    importantDatesLabel: 'Belangrijke datums',
    
    // Tasbih
    tasbihDhikrCounter: 'Tasbih (Dhikr Teller)',
    countYourRemembrance: 'Tel uw gedachtenis aan Allah',
    selectDhikr: 'Selecteer Dhikr:',
    tapToCount: 'Tik om te Tellen',
    reset: 'Resetten',
    vibration: 'Trilling',
    sessionTotal: 'Sessietotaal',
    currentRound: 'Huidige Ronde',
    resetSessionTotal: 'Sessietotaal Resetten',
    tasbihTips: 'Tips:',
    useThumb: 'Gebruik uw duim om op uw vingers te tellen voor traditionele Tasbih',
    complete33Rounds: 'Voltooi 33 rondes van elk: SubhanAllah, Alhamdulillah, Allahu Akbar',
    trackDailyDhikr: 'De app helpt u uw dagelijkse dhikr bij te houden',
    enableVibration: 'Schakel trilling in voor haptische feedback bij het tellen',
    
    // Qibla
    qiblaDirection: 'Qibla Richting',
    findDirectionToKaaba: 'Vind de richting naar de Kaaba in Mekka',
    qiblaDirectionLabel: 'Qibla Richting',
    yourHeading: 'Uw Richting',
    yourLocation: 'Uw Locatie',
    instructions: 'Instructies:',
    holdDeviceFlat: 'Houd uw apparaat plat en draai totdat de 🕋 marker naar boven wijst',
    redArrowShows: 'De rode pijl toont de richting om naar toe te kijken',
    enableLocationServices: 'Zorg ervoor dat locatieservices zijn ingeschakeld voor de beste nauwkeurigheid',
    compassFunctionality: 'Voor kompasfunctionaliteit, sta apparaatoriëntatie toegang toe wanneer u daarom wordt gevraagd',
    
    // Hadiths
    translation: 'Vertaling:',
    explanation: 'Uitleg:',
    reference: 'Referentie:',
    showExplanation: 'Uitleg Tonen',
    
    // Errors and Messages
    unableToGetLocation: 'Kan uw locatie niet ophalen. Schakel locatieservices in.',
    unableToConnectAPI: 'Kan niet verbinden met de API. Controleer uw internetverbinding.',
    unableToLoadContent: 'Kan inhoud niet laden. Controleer uw internetverbinding.',
    notificationsBlocked: 'Meldingen zijn geblokkeerd. Schakel ze in in uw browserinstellingen.',
    browserNotSupported: 'Uw browser ondersteunt geen meldingen',
    errorImportingBookmarks: 'Fout bij importeren van favorieten. Controleer het bestandsformaat.',
    bookmarkThis: 'Markeer als favoriet',
    removeBookmark: 'Verwijder favoriet',
    bookmarked: 'Favoriet',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    prayerTimes: 'أوقات الصلاة',
    quran: 'القرآن',
    duaas: 'الأدعية',
    tasbih: 'السبحة',
    hadiths: 'الأحاديث',
    calendar: 'التقويم',
    favorites: 'المفضلة',
    statistics: 'الإحصائيات',
    qibla: 'القبلة',
    
    // Common
    search: 'بحث',
    loading: 'جاري التحميل...',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    retry: 'إعادة المحاولة',
    at: 'في',
    
    // Prayer Times
    prayerTimesHeader: 'أوقات الصلاة',
    nextPrayer: 'الصلاة القادمة',
    currentPrayer: 'الصلاة الحالية',
    current: 'الحالية',
    enableNotifications: 'تفعيل الإشعارات',
    enableReminders: 'تفعيل التذكيرات',
    remindMe: 'ذكرني',
    minutesBefore: 'دقائق قبل',
    calculationMethod: 'طريقة الحساب:',
    location: 'الموقع',
    latitude: 'خط العرض:',
    longitude: 'خط الطول:',
    useMyLocation: 'استخدام موقعي',
    
    // Quran
    theHolyQuran: 'القرآن الكريم',
    readAndReflect: 'اقرأ وتأمل في كلمات الله',
    searchSurah: 'ابحث عن سورة...',
    backToSurahs: 'رجوع إلى السور',
    showTranslation: 'إظهار الترجمة',
    ayahs: 'آيات',
    nextSurah: 'السورة التالية',
    lastSurah: 'آخر سورة',
    
    // Duaas
    duaasSupplications: 'الأدعية والدعوات',
    authenticDuas: 'أدعية صحيحة من القرآن والسنة',
    showTransliteration: 'إظهار النطق',
    
    // Favorites
    myFavorites: 'مفضلاتي',
    bookmarkedVerses: 'الآيات والأدعية المفضلة لديك',
    noBookmarkedVerses: 'لا توجد آيات مفضلة بعد',
    noBookmarkedDuas: 'لا توجد أدعية مفضلة بعد',
    bookmarkFromQuran: 'أضف آيات مفضلة من صفحة القرآن لرؤيتها هنا',
    bookmarkFromDuas: 'أضف أدعية مفضلة من صفحة الأدعية لرؤيتها هنا',
    export: 'تصدير',
    import: 'استيراد',
    verses: 'آيات',
    duas: 'أدعية',
    
    // Statistics
    readingStatistics: 'إحصائيات القراءة',
    trackYourReadingProgress: 'تابع تقدم قراءتك والوقت المقضي',
    today: 'اليوم',
    thisWeek: 'هذا الأسبوع',
    allTime: 'كل الوقت',
    timeSpentToday: 'الوقت المقضي اليوم',
    versesRead: 'الآيات المقروءة',
    hadithsRead: 'الأحاديث المقروءة',
    duaasRead: 'الأدعية المقروءة',
    totalTimeThisWeek: 'إجمالي الوقت هذا الأسبوع',
    totalTimeSpent: 'إجمالي الوقت المقضي',
    totalVersesRead: 'إجمالي الآيات المقروءة',
    totalHadithsRead: 'إجمالي الأحاديث المقروءة',
    totalDuaasRead: 'إجمالي الأدعية المقروءة',
    surahsCompleted: 'سور مكتملة',
    surah: 'سورة',
    completedSurahs: 'السور المكتملة',
    resetStatistics: 'إعادة تعيين الإحصائيات',
    clickAgainToConfirm: 'انقر مرة أخرى للتأكيد',
    
    // Bookmarks
    continueReading: 'متابعة القراءة',
    continueReadingFrom: 'متابعة القراءة من',
    continueFromAyah: 'متابعة من الآية',
    ayah: 'آية',
    clearBookmark: 'حذف العلامة المرجعية',
    
    // Calendar
    islamicCalendar: 'التقويم الإسلامي',
    hijriCalendar: 'التقويم الهجري',
    gregorianCalendar: 'التقويم الميلادي',
    importantDates: 'التواريخ المهمة هذا العام',
    calendarNote: 'ملاحظة: قد تختلف التواريخ بيوم أو يومين حسب رؤية الهلال في منطقتك. يرجى التحقق مع السلطات المحلية للاحتفالات الدينية.',
    datesFormatExplanation: 'التنسيق: الشهر-اليوم (التقويم الهجري)',
    datesFormatExample: 'مثال: "9-1" = اليوم الأول من رمضان (الشهر 9، اليوم 1 في التقويم الهجري). يتم تحويل التواريخ تلقائياً من الميلادي إلى الهجري.',
    datesInGregorian: 'التواريخ المهمة المعروضة بالتقويم الميلادي لهذا العام',
    datesGregorianNote: 'هذه تواريخ تقريبية. قد تختلف التواريخ الفعلية بيوم أو يومين حسب رؤية الهلال.',
    importantDatesDisclaimer: 'ملاحظة مهمة',
    importantDatesDisclaimerText: 'ليست كل التواريخ المهمة أعياد دينية (عيد). بعض التواريخ هي أحداث تاريخية أو أيام مستحبة للعبادة. على سبيل المثال، ولادة النبي محمد (صلى الله عليه وسلم) لا تُحتفل بها كعيد ديني في المذهب السني. فقط عيد الفطر وعيد الأضحى هما الأعياد الإسلامية الرسمية.',
    hijriDate: 'التاريخ الهجري',
    gregorianDate: 'التاريخ الميلادي',
    hijri: 'هجري',
    dateNotFound: 'التاريخ غير موجود',
    
    // Dashboard
    goodMorning: 'صباح الخير',
    goodAfternoon: 'مساء الخير',
    goodEvening: 'مساء الخير',
    readQuran: 'اقرأ القرآن',
    continueReading: 'تابع قراءتك',
    dhikrCounter: 'عداد الذكر',
    countRemembrance: 'احسب ذكرياتك',
    myFavorites2: 'مفضلاتي',
    todaysPrayerTimes: 'أوقات الصلاة اليوم',
    viewDetails: 'عرض التفاصيل',
    viewAll: 'عرض الكل',
    dailyReminder: 'تذكير يومي',
    rememberAllah: 'اذكر الله في كل ما تفعله',
    authenticSayings: 'أقوال صحيحة',
    importantDatesLabel: 'تواريخ مهمة',
    
    // Tasbih
    tasbihDhikrCounter: 'السبحة (عداد الذكر)',
    countYourRemembrance: 'احسب ذكرياتك لله',
    selectDhikr: 'اختر الذكر:',
    tapToCount: 'اضغط للعد',
    reset: 'إعادة تعيين',
    vibration: 'الاهتزاز',
    sessionTotal: 'إجمالي الجلسة',
    currentRound: 'الجولة الحالية',
    resetSessionTotal: 'إعادة تعيين الإجمالي',
    tasbihTips: 'نصائح:',
    useThumb: 'استخدم إبهامك للعد على أصابعك للسبحة التقليدية',
    complete33Rounds: 'أكمل 33 جولة لكل: سبحان الله، الحمد لله، الله أكبر',
    trackDailyDhikr: 'التطبيق يساعدك على تتبع ذكرياتك اليومية',
    enableVibration: 'قم بتفعيل الاهتزاز للحصول على ردود فعل لمسية عند العد',
    
    // Qibla
    qiblaDirection: 'اتجاه القبلة',
    findDirectionToKaaba: 'اعثر على اتجاه الكعبة في مكة',
    qiblaDirectionLabel: 'اتجاه القبلة',
    yourHeading: 'اتجاهك',
    yourLocation: 'موقعك',
    instructions: 'التعليمات:',
    holdDeviceFlat: 'امسك جهازك بشكل مسطح ودرّ حتى يشير رمز 🕋 لأعلى',
    redArrowShows: 'السهم الأحمر يوضح الاتجاه الذي يجب أن تواجهه',
    enableLocationServices: 'تأكد من تفعيل خدمات الموقع للحصول على أفضل دقة',
    compassFunctionality: 'للوظيفة البوصلة، اسمح بالوصول إلى اتجاه الجهاز عند الطلب',
    
    // Hadiths
    translation: 'الترجمة:',
    explanation: 'الشرح:',
    reference: 'المرجع:',
    showExplanation: 'إظهار الشرح',
    
    // Errors and Messages
    unableToGetLocation: 'تعذر الحصول على موقعك. يرجى تفعيل خدمات الموقع.',
    unableToConnectAPI: 'تعذر الاتصال بـ API. يرجى التحقق من اتصالك بالإنترنت.',
    unableToLoadContent: 'تعذر تحميل المحتوى. يرجى التحقق من اتصالك بالإنترنت.',
    notificationsBlocked: 'الإشعارات محظورة. يرجى تفعيلها في إعدادات المتصفح.',
    browserNotSupported: 'متصفحك لا يدعم الإشعارات',
    errorImportingBookmarks: 'خطأ في استيراد المفضلة. يرجى التحقق من تنسيق الملف.',
    bookmarkThis: 'إضافة للمفضلة',
    removeBookmark: 'إزالة من المفضلة',
    bookmarked: 'مفضل',
  },
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'fr' // Default to French
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    // Garder LTR pour la mise en page, RTL uniquement pour le texte arabe
    document.documentElement.dir = 'ltr' // Toujours LTR pour éviter le miroir du site
    document.documentElement.lang = language
  }, [language])

  const t = (key) => {
    return translations[language]?.[key] || key
  }

  const changeLanguage = (lang) => {
    setLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
