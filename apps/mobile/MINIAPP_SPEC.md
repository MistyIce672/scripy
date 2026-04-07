# MiniApp Platform — App Development Guide

You are generating a single-file HTML mini app that runs inside a sandboxed WebView on a mobile app platform. The app is a complete HTML document that gets loaded directly into the WebView.

## Runtime Environment

- Runs in a WebView (react-native-webview) on Android/iOS
- No access to localStorage, cookies, or the filesystem
- No access to native APIs (camera, GPS, etc.)
- Full access to standard web APIs: DOM, Canvas, Fetch, WebSockets, CSS animations
- Viewport is a mobile phone screen

## Data Storage API

A global `__bridge` object is injected before your code runs. All methods return Promises.

### Private data (per user, persists across sessions)

```js
// Save any JSON-serializable value under a key
await __bridge.setData("key", value);

// Retrieve it later (returns null if not set)
const value = await __bridge.getData("key");
```

Data is stored server-side in a database, keyed to the current user and this app. Each user has their own isolated storage — users cannot see each other's private data.

### Shared room data (multiplayer/collaborative)

```js
// Save shared state visible to all room members
await __bridge.setRoomData("key", value);

// Read shared state
const value = await __bridge.getRoomData("key");

// Listen for real-time updates from other users
__bridge.onRoomChange((key, value) => {
  // Called whenever another user in the room calls setRoomData
});
```

Room data is only available when the user has joined a shared room. If no room is active, getRoomData returns null and setRoomData is a no-op.

## Constraints

- All data values must be JSON-serializable (objects, arrays, strings, numbers, booleans, null)
- There is no file upload or binary storage
- There is no authentication API — the platform handles auth. Your app does not know who the user is
- There are no push notifications
- `alert()`, `confirm()`, and `prompt()` may not work in the WebView — use in-page UI instead
- External scripts/CDNs work (fetch from CDN is allowed) but the app should work offline if possible

## Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, system-ui, sans-serif; }
  </style>
</head>
<body>
  <!-- Your UI here -->
  <script>
    // __bridge is available immediately
    // Use async/await for all bridge calls

    async function init() {
      const saved = await __bridge.getData("state");
      if (saved) {
        // restore state
      }
    }

    init();
  </script>
</body>
</html>
```

## Best Practices

- Always load saved state on startup with `__bridge.getData()`
- Save state after every meaningful change, not on every keystroke — debounce writes
- Use a single key for the entire app state when possible (e.g. `__bridge.setData("state", entireStateObject)`) rather than many small keys
- Design for a mobile-first, touch-friendly UI — use large tap targets (44px minimum), readable font sizes (16px+)
- Keep the HTML in a single file — inline all CSS and JS
- Handle the case where `__bridge.getData()` returns null (first launch)
- For multiplayer apps, use `__bridge.onRoomChange()` to reactively update the UI when shared state changes — don't poll
