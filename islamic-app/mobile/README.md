# Rahma Mobile

This is the mobile app starter (Expo + React Native).

## Prerequisites
- Node.js 18+
- Xcode (for iOS) / Android Studio (for Android)

## Setup
1) Install deps:
```
npm install
```

2) Run:
```
npm run start
```

## Data for Widgets
The app stores the next prayer in local storage so native widgets can read it later:
- key: `rahma.widget.snapshot`
- fields: `nextPrayerName`, `nextPrayerTime`, `updatedAt`

## Widgets
Lock‑screen widgets require native modules:
- iOS: SwiftUI Widget Extension
- Android: AppWidgetProvider

See `src/widgets/README.md` for the next steps.
