# Repository Guidelines

## Project Structure & Module Organization
The Expo entry point `App.tsx` manages the in-app navigation stack, while `index.ts` registers the root component. Core logic sits in `src/`: REST helpers in `src/api`, reusable UI in `src/components`, feature screens in `src/screens`, and shared state in `src/context`. Cross-cutting data such as colors and mock flights live in `src/constants` and `src/data`. Static media is stored under `assets/`, operational utilities in `scripts/`, and database artifacts in `supabase/` (notably `schema.sql` for table definitions).

## Build, Test, and Development Commands
- `npm install` — install dependencies before your first run or when package.json changes.
- `npx expo start` — launch the Metro bundler; use the interactive menu for iOS (`i`), Android (`a`), or web (`w`) previews.
- `npm run android` / `npm run ios` / `npm run web` — shortcut scripts for platform-specific launches.
- `npx expo start --clear` — reset Expo’s cache if you encounter stale assets or TypeScript build artifacts.

## Coding Style & Naming Conventions
TypeScript is configured with `strict` mode; preserve explicit types for API responses, context values, and navigation state. Follow the existing two-space indentation, single quotes, and trailing commas shown across `src/`. Name React components and screens with `PascalCase` (`FlightSearchScreen.tsx`), hooks with `use` prefixes, and shared utilities with `camelCase`. Keep styling co-located via `StyleSheet.create` blocks and reuse palette values through `src/constants/colors.ts`.

## Testing Guidelines
Automated tests are not yet configured; when introducing them, prefer Jest with the `jest-expo` preset and place specs under `src/__tests__` using the `*.test.tsx` suffix. For now, rely on manual verification through Expo Go or emulators, exercising search, booking, and cancellation flows end-to-end. Document any manual test steps in your pull request until a repeatable test suite exists.

## Commit & Pull Request Guidelines
The Git history favors concise, imperative commits (e.g., “update schema.sql”, “Add flight search…”); keep messages under 72 characters and describe the intent, not the implementation. Each pull request should include a short summary of the change, affected screens or services, and manual test notes, plus linked issues when applicable. Attach screenshots or screen recordings for UI updates and call out any new environment variables or migrations.

## Supabase & Data Seeding
Maintain Supabase configuration through `src/services/supabaseClient.ts`; the app falls back to local mock data when credentials are absent. To refresh backend fixtures, run `npx ts-node scripts/generateMockData.ts` with `EXPO_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set, ensuring your tables match `supabase/schema.sql`. Never commit secrets—use `.env` or Expo config for local overrides and coordinate rotations with the team.
