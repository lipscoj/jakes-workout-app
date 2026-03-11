# Bigfoot Training Companion

Local-only personal training companion for a multi-year ultramarathon build. The app is optimized for mobile web usage, keeps all training content hardcoded in source, and stores athlete state in browser local storage.

## Architecture

- `app/`: Expo Router routes only. These files are thin entrypoints that delegate to screen components.
- `src/domain/`: Pure business logic. This includes the strict workout contracts, the sequential training engine, coaching rules, benchmark derivation, and reset/swap behavior.
- `src/data/`: Hardcoded program manifest with workouts, phases, exercises, benchmarks, and coaching rules.
- `src/storage/`: Local storage repository and versioned persistence boundary.
- `src/features/`: Presentation components for Today, Library, Progress, Settings, and Exercise Detail screens.
- `src/ui/`: Shared styling tokens and primitive UI building blocks.

## Local-only constraints

- No server, API, auth, or sync.
- Program content is edited directly in [`src/data/programManifest.ts`](/Users/brianturner/Library/Mobile Documents/com~apple~CloudDocs/Development/JakesWorkoutApp/src/data/programManifest.ts).
- Athlete progress is persisted to browser local storage via [`src/storage/localStorageRepository.ts`](/Users/brianturner/Library/Mobile Documents/com~apple~CloudDocs/Development/JakesWorkoutApp/src/storage/localStorageRepository.ts).

## Commands

- `npm run web`: start the mobile-layout web app locally.
- `npm run test`: run domain tests.
- `npm run typecheck`: verify TypeScript.
- `npm run build:web`: export a static web build.
