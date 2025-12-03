const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
} = require('@expo/config-plugins')
const fs = require('fs/promises')
const path = require('path')

const WIDGET_LAYOUT = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widgetRoot"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="#151821">

    <TextView
        android:id="@+id/widgetTimeLabel"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="11:11"
        android:textSize="28sp"
        android:textStyle="bold"
        android:textColor="#F8FAFC" />

    <TextView
        android:id="@+id/widgetSubLabel"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Waiting for twin time"
        android:textSize="12sp"
        android:textColor="#94A3B8"
        android:layout_marginTop="4dp" />

    <Button
        android:id="@+id/captureButton"
        android:layout_width="match_parent"
        android:layout_height="48dp"
        android:text="Record Moment"
        android:textAllCaps="false"
        android:textSize="16sp"
        android:textColor="#FFFFFF"
        android:layout_marginTop="12dp"
        android:background="#EF4444"
        android:stateListAnimator="@null" />
</LinearLayout>
`

const WIDGET_INFO = `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="200dp"
    android:minHeight="120dp"
    android:updatePeriodMillis="60000"
    android:initialLayout="@layout/widget_timetwin"
    android:previewLayout="@layout/widget_timetwin"
    android:widgetCategory="home_screen"
    android:resizeMode="horizontal|vertical" />
`

const providerTemplate = (pkg) => `package ${pkg}.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.widget.RemoteViews
import ${pkg}.R
import java.util.Calendar

class TimeTwinWidgetProvider : AppWidgetProvider() {

  override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
    for (appWidgetId in appWidgetIds) {
      val views = RemoteViews(context.packageName, R.layout.widget_timetwin)

      val calendar = Calendar.getInstance()
      val hours = calendar.get(Calendar.HOUR_OF_DAY)
      val minutes = calendar.get(Calendar.MINUTE)
      val isTwin = hours == minutes
      val timeLabel = String.format("%02d:%02d", hours, minutes)

      views.setTextViewText(R.id.widgetTimeLabel, timeLabel)
      views.setTextViewText(
        R.id.widgetSubLabel,
        if (isTwin) "Twin time is open" else "Waiting for twin time"
      )

      val buttonColor = if (isTwin) Color.parseColor("#10B981") else Color.parseColor("#EF4444")
      views.setInt(R.id.captureButton, "setBackgroundColor", buttonColor)

      val link = Uri.parse("timetwin://capture-now?source=widget&trigger=" + System.currentTimeMillis())

      val intent = Intent(Intent.ACTION_VIEW).apply {
        data = link
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      }

      val pendingIntent = PendingIntent.getActivity(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )

      views.setOnClickPendingIntent(R.id.captureButton, pendingIntent)

      appWidgetManager.updateAppWidget(appWidgetId, views)
    }
  }
}
`

const ensureReceiver = (manifest, receiverName) => {
  const app = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest)
  app.receiver = app.receiver ?? []

  const alreadyExists = app.receiver.some(
    (receiver) => receiver.$['android:name'] === receiverName,
  )

  if (!alreadyExists) {
    app.receiver.push({
      $: {
        'android:name': receiverName,
        'android:exported': 'false',
      },
      'intent-filter': [
        {
          action: [
            {
              $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' },
            },
          ],
        },
      ],
      'meta-data': [
        {
          $: {
            'android:name': 'android.appwidget.provider',
            'android:resource': '@xml/time_twin_widget_info',
          },
        },
      ],
    })
  }
}

const withTimeTwinWidget = (config) => {
  const pkg = AndroidConfig.Package.getPackage(config) ?? 'dev.timetwin'
  const providerPath = `${pkg}.widget.TimeTwinWidgetProvider`

  config = withAndroidManifest(config, (config) => {
    ensureReceiver(config.modResults, providerPath)
    return config
  })

  config = withDangerousMod(config, ['android', async (config) => {
    const androidRoot = config.modRequest.platformProjectRoot
    const mainPath = path.join(androidRoot, 'app', 'src', 'main')
    const javaPath = path.join(mainPath, 'java', ...pkg.split('.'), 'widget')
    const resLayoutPath = path.join(mainPath, 'res', 'layout')
    const resXmlPath = path.join(mainPath, 'res', 'xml')

    await fs.mkdir(javaPath, { recursive: true })
    await fs.mkdir(resLayoutPath, { recursive: true })
    await fs.mkdir(resXmlPath, { recursive: true })

    await fs.writeFile(
      path.join(javaPath, 'TimeTwinWidgetProvider.kt'),
      providerTemplate(pkg),
      'utf-8',
    )
    await fs.writeFile(
      path.join(resLayoutPath, 'widget_timetwin.xml'),
      WIDGET_LAYOUT,
      'utf-8',
    )
    await fs.writeFile(
      path.join(resXmlPath, 'time_twin_widget_info.xml'),
      WIDGET_INFO,
      'utf-8',
    )

    return config
  }])

  return config
}

module.exports = withTimeTwinWidget
