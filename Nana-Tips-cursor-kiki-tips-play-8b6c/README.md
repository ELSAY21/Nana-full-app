# Kiki Tips

Kiki Tips is a free reader for stories published at yerase.com. Browse topics, search, save articles on this device, and choose light, dark, or system appearance.

Stories are sample content. The screens read them through `src/data/repository.ts`, so a later update can load posts from a WordPress site without rebuilding the interface.

## Run

```bash
npm install
npx expo start
```

- Press `w` for the web preview.
- Press `a` for Android. Use Android Studio, or a phone with Expo Go that supports SDK 58.
- `npm run typecheck` checks TypeScript.
- `npm test` checks search and bookmark behavior.

Bookmarks, appearance, and notification preferences stay on the device. This version does not connect to a server or send push notifications.
