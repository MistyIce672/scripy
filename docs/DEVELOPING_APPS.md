# Scripy - Mini App Platform

Create, share, and run HTML mini apps on mobile.

## App Structure

```
apps/
├── mobile/          # React Native (Expo) mobile app
│   ├── app/         # Expo Router screens
│   ├── components/  # Reusable components
│   ├── lib/          # Utilities (Supabase, bridge)
│   ├── store/        # Zustand state management
│   └── android/     # Native Android project (generated)
└── web/             # Web dashboard (future)
```

## Building Apps for Scripy

Scripy apps are pure HTML/CSS/JavaScript that run inside a sandboxed WebView.

### App HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  <!-- Your app content -->

  <script>
    // Use window.__nativeBridge for native features
  </script>
</body>
</html>
```

### Available Native Features

| Feature | Method | Description |
|---------|--------|-------------|
| Open URL | `window.__nativeBridge.openExternal(url)` | Opens URL in browser/WhatsApp |
| Copy to clipboard | `window.__nativeBridge.copyToClipboard(text)` | Copies text to clipboard |

### Example: WhatsApp Link Generator

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp Link</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui; }
    input { width: 100%; padding: 12px; font-size: 16px; margin-bottom: 12px; }
    button { padding: 12px 24px; background: #25D366; color: white; border: none; }
  </style>
</head>
<body>
  <input type="tel" id="phone" placeholder="07X XXX XXXX">
  <button onclick="openWA()">Open WhatsApp</button>

  <script>
    function openWA() {
      const phone = document.getElementById('phone').value.replace(/\D/g, '');
      const url = `https://wa.me/${phone}`;
      
      if (window.__nativeBridge) {
        window.__nativeBridge.openExternal(url);
      } else {
        window.location.href = url;
      }
    }
  </script>
</body>
</html>
```

### User Data Storage

Apps can store data per-user using the bridge:

```javascript
// Save data
await window.__bridge.setData('key', { myData: 'value' });

// Load data
const data = await window.__bridge.getData('key');
```

### Room (Shared) Data

For multi-user apps, use room data:

```javascript
// Save shared data
await window.__bridge.setRoomData('key', { sharedValue: 42 });

// Load shared data
const data = await window.__bridge.getRoomData('key');

// Listen for changes
window.__bridge.onRoomChange((key, value) => {
  console.log(`${key} changed to`, value);
});
```

## Publishing Your App

1. Go to the Scripy web dashboard
2. Click "Create App"
3. Paste your HTML source code
4. Set visibility (public/private)
5. Submit

Users can install your app from the app store.

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)

### Setup

```bash
cd apps/mobile
npm install
```

### Run on Device/Emulator

```bash
npx expo start
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Scan QR with Expo Go app
```

### Build APK

1. Set Android SDK path:
   ```bash
   export ANDROID_HOME=~/Android/Sdk
   ```

2. Generate native code:
   ```bash
   npx expo prebuild --platform android
   ```

3. Build APK:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Build iOS

```bash
npx expo prebuild --platform ios
cd ios
xcodebuild -scheme Scripy -configuration Release
```
