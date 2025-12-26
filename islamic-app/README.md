# Rahma - Prayer Times, Quran & Duaas

**Rahma** (رَحْمَة) - Miséricorde en arabe

Une application React complète pour votre vie spirituelle quotidienne, inspirée de Coran Majeed et Athan Pro, avec horaires de prière, lecture du Coran, Hadiths, Douas et bien plus encore.

## Features

### 🕌 Prayer Times
- Accurate prayer time calculations based on your location
- Multiple calculation methods (Muslim World League, Egyptian, Karachi, etc.)
- Real-time countdown to next prayer
- Manual location input or automatic geolocation
- Beautiful, modern UI with current/next prayer highlighting

### 📖 Quran Reading
- Browse all 114 Surahs
- Read Quranic text in Arabic
- English translations
- Search functionality
- Clean, readable interface optimized for Quranic text

### 🤲 Duaas & Supplications
- Categorized collection of authentic duas
- Categories: Daily, Before Eating, Travel, Protection, Forgiveness
- Arabic text with transliteration and translation
- Toggle options for transliteration and translation
- References from Quran and Hadith

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- **React 18** - UI framework
- **React Router** - Navigation
- **Vite** - Build tool and dev server
- **Adhan** - Prayer time calculations
- **date-fns** - Date formatting

## Project Structure

```
islamic-app/
├── src/
│   ├── components/
│   │   ├── PrayerTimes.jsx
│   │   ├── Quran.jsx
│   │   └── Duaas.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Notes

- The Quran section currently includes sample data for Al-Fatiha. In a production app, you would integrate with a Quran API (like Al-Quran Cloud API or similar) to get complete text for all Surahs.
- Prayer times are calculated using the Adhan library, which supports multiple calculation methods.
- Location permissions are requested for automatic prayer time calculation.

## Future Enhancements

- Complete Quran text integration
- Audio recitation
- Qibla direction finder
- Islamic calendar and important dates
- Bookmarks and favorites
- Dark mode
- Multiple language support

## License

This project is open source and available for personal and educational use.

