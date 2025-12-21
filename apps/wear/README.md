# TimeTwin for Galaxy Watch (Wear OS)

This folder contains the source code / reference for the Native Android Wear OS app.

## 🚀 How to Build & Install

Since this is a Native Android project (not React Native), you need to build it using **Android Studio**.

1.  **Open Android Studio**.
2.  **New Project** -> Select **Wear OS** -> **Empty Compose Activity**.
3.  Name it `TimeTwinWatch`.
4.  Package name: `com.timetwin.watch` (Must match the code).
5.  Language: **Kotlin**.
6.  Once created, **Open `MainActivity.kt`** and REPLACE the contents with the code in `apps/wear/MainActivity.kt`.
7.  **Add Dependency**:
    Open `build.gradle (Module: app)` and ensure you have Play Services Wearable:
    ```gradle
    implementation 'com.google.android.gms:play-services-wearable:18.1.0'
    ```
8.  **Run**: Connect your Samsung Galaxy Watch (via WiFi debugging or Bluetooth) and press "Run" in Android Studio to install the app.

## 📱 How it Works
*   The Watch App has a single button "CAPTURE".
*   When clicked, it sends a message `CAPTURE_TIME` via Bluetooth to your phone.
*   The Mobile App (running in background or foreground) receives this message via `react-native-wear-connectivity` and triggers the `recordCapture` API.

**Note:** Ensure your Mobile App is installed on the phone paired with the watch!
