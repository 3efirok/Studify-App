# Studify Mobile (Expo)

Темний “glass” мобільний клієнт на React Native для Studify API (Expo).

## Швидкий старт

```bash
npm install
npx expo start -c
```

Далі обери `i`/`a`/`w` для iOS/Android/Web або відскануй QR код у Expo Go.

## Вирішення проблеми: “Could not connect to development server”

Зазвичай це означає, що Metro (порт `8081`) недоступний для пристрою/симулятора.

- Переконайся, що dev server запущений: `npm run start` (або `npx expo start`).
- Телефон і компʼютер мають бути в одній Wi‑Fi мережі (без VPN / guest network / AP isolation).
- Firewall у Windows/macOS може блокувати підключення — дозволь Node/Expo та порти `8081` (Metro) і `19000/19001` (Expo).
- Якщо запускаєш проєкт у WSL2/Docker — LAN часто ламається; спробуй `npm run start:tunnel` або запускай Expo з хостової ОС.
- Для iOS симулятора / web спробуй `npm run start:localhost`.

## Змінні середовища

- Скопіюй `.env.example` в `.env` та задай `EXPO_PUBLIC_API_URL`.
- На реальному телефоні `localhost` **не працює** — використай IP твого компʼютера (наприклад `http://192.168.x.x:4000`).
- Для емуляторів: Android використовує `http://10.0.2.2:4000`, iOS симулятор та web — `http://localhost:4000`.
- `EXPO_PUBLIC_ENV` керує підписом середовища в апці (`development`/`production`).
- Якщо змінні не задані — застосунок використовує дефолтні адреси для емулятора.

### Базовий URL API

Застосунок читає `EXPO_PUBLIC_API_URL`. Для локальної розробки на девайсі/симуляторі використовуй IP машини (наприклад `http://192.168.x.x:4000`), а не `localhost` (виняток — web на тому ж хості).

## Скрипти

- `npm run start` — старт Expo
- `npm run android` — запуск на Android
- `npm run ios` — запуск на iOS
- `npm run web` — запуск у браузері

## Примітки

- Стан авторизації/сесії зберігається безпечно (SecureStore з fallback на AsyncStorage).
- Якщо пристрої не бачать твій ПК у мережі — спробуй `npx expo start --tunnel`.

## Структура проєкту

- `src/api` — Axios клієнти.
- `src/query` — React Query хуки.
- `src/store` — Zustand store для авторизації.
- `src/components` — UI компоненти (glass), toast, loader, empty/skeleton.
- `src/screens` — auth, decks, sessions, profile flows.
- `src/navigation` — stacks/tabs з типізованими параметрами.
- `src/utils` — helpers для env/haptics.
