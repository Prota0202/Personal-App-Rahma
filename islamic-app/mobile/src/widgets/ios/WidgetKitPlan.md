# iOS WidgetKit Plan

## 1) Prebuild
Run:
```
npm run prebuild
```

## 2) Add Widget Extension
In Xcode:
- File → New → Target → Widget Extension
- Name: `RahmaWidget`
- Language: Swift

## 3) App Group
Create an App Group: `group.com.rahma.app`
Enable it for:
- Main app target
- Widget extension target

## 4) Shared Storage
Read the snapshot saved by the app:
Key: `rahma.widget.snapshot`

Example model:
```
{
  "updatedAt": 1710000000000,
  "nextPrayerName": "fajr",
  "nextPrayerTime": "05:12 AM"
}
```

## 5) Widget UI (SwiftUI)
Show:
- Next prayer name
- Next prayer time
- Optional: updatedAt

## 6) Refresh Policy
- Use `.after(Date().addingTimeInterval(60 * 15))`
- Refresh every ~15 minutes
