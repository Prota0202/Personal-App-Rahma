# Android AppWidget Plan

## 1) Prebuild
Run:
```
npm run prebuild
```

## 2) Create Widget
- Add `AppWidgetProvider`
- Create `widget_info.xml`
- Add receiver in `AndroidManifest.xml`

## 3) Shared Preferences
Read snapshot from shared prefs:
Key: `rahma.widget.snapshot`

Example model:
```
{
  "updatedAt": 1710000000000,
  "nextPrayerName": "fajr",
  "nextPrayerTime": "05:12 AM"
}
```

## 4) UI
Show:
- Next prayer name
- Next prayer time

## 5) Update schedule
- Use `AlarmManager` or `WorkManager`
- Update every 15–30 minutes
