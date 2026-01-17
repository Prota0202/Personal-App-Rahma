# Native Widgets (Plan)

## Recommended path
Use **Expo prebuild** to generate native projects, then add widgets natively.

```
npm run prebuild
```

## iOS (WidgetKit + SwiftUI)
1) Add a Widget Extension target in Xcode.
2) Enable **App Groups** for both the app + widget.
3) Read `rahma.widget.snapshot` from shared storage.
4) Render next prayer + time (and optional countdown).

## Android (AppWidgetProvider)
1) Add a widget module and provider.
2) Read `rahma.widget.snapshot` from SharedPreferences.
3) Render next prayer + time.

See the platform docs below for the step‑by‑step skeletons:
- `ios/WidgetKitPlan.md`
- `android/AppWidgetPlan.md`
