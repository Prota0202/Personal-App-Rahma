package com.rahma.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetStorageModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "WidgetStorage"

  @ReactMethod
  fun setSnapshot(json: String) {
    val prefs = reactContext.getSharedPreferences("RahmaWidget", Context.MODE_PRIVATE)
    prefs.edit().putString("rahma.widget.snapshot", json).apply()

    val manager = AppWidgetManager.getInstance(reactContext)
    val component = ComponentName(reactContext, RahmaWidgetProvider::class.java)
    val widgetIds = manager.getAppWidgetIds(component)
    for (id in widgetIds) {
      RahmaWidgetProvider.updateWidget(reactContext, manager, id)
    }
  }
}
