package com.rahma.app

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject

class RahmaWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    for (widgetId in appWidgetIds) {
      updateWidget(context, appWidgetManager, widgetId)
    }
  }

  companion object {
    fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, widgetId: Int) {
      val prefs = context.getSharedPreferences("RahmaWidget", Context.MODE_PRIVATE)
      val snapshot = prefs.getString("rahma.widget.snapshot", "{}") ?: "{}"
      val json = JSONObject(snapshot)
      val name = json.optString("nextPrayerName", "--")
      val time = json.optString("nextPrayerTime", "--")

      val views = RemoteViews(context.packageName, R.layout.rahma_widget)
      views.setTextViewText(R.id.widget_prayer_name, name.uppercase())
      views.setTextViewText(R.id.widget_prayer_time, time)
      views.setTextViewText(R.id.widget_updated, "Updated")

      appWidgetManager.updateAppWidget(widgetId, views)
    }
  }
}
