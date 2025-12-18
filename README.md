# Studify Mobile (Expo)

Dark, glassy React Native client for Studify API.

Українська версія: `README.uk.md`

## Getting started

```bash
npm install
npx expo start -c
```

Choose `i`/`a`/`w` for iOS/Android/Web or scan the QR code in Expo Go.

## Environment

- Copy `.env.example` to `.env` and set `EXPO_PUBLIC_API_URL`. On a real phone, `localhost` **не працює** — використай IP твого компʼютера (наприклад `http://192.168.x.x:4000`).
- For emulators: Android uses `http://10.0.2.2:4000`, iOS simulator/web uses `http://localhost:4000` by default.
- `EXPO_PUBLIC_ENV` controls app environment label (`development`/`production`).
- If env is missing, the app falls back to the emulator defaults.

### API base URL

- The app reads `EXPO_PUBLIC_API_URL`. For local dev on a device/simulator, use your machine IP (e.g. `http://192.168.x.x:4000`), **not** `localhost`, unless running on the same host (web).
- You can also leave it empty: it falls back to `http://localhost:4000` in dev.

### Notes

- Auth/session state is stored securely (SecureStore fallback to AsyncStorage).
- Run `npx expo start --tunnel` if devices cannot reach your machine directly.

## Folder structure

- `src/api` — Axios clients.
- `src/query` — React Query hooks.
- `src/store` — Zustand auth store.
- `src/components` — glass UI kit, toasts, loader, empty/skeleton.
- `src/screens` — auth, decks, sessions, profile flows.
- `src/navigation` — stacks/tabs with typed params.
- `src/utils` — env/haptics helpers.
