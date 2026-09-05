# Block Nova

**Block Nova** is a polished, original block-placement puzzle game engineered for mobile platforms (iOS and Android) using **React Native + Expo + TypeScript**, featuring a platform-independent game engine, Classic Mode, 30-level Adventure Mode, and a **Supabase player account & cloud-sync architecture**.

## Architecture & Mobile Design

- **Mobile Framework**: React Native + Expo
- **Language**: TypeScript (strict mode)
- **App Bundle Identifier**: `com.blocknova.game`
- **Backend Infrastructure**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Game Engine**: Pure TypeScript (`src/game/`) decoupled from UI, DOM, and browser APIs.
- **Classic Mode**: Endless block placement with line clearing, combo streaks, and high score tracking.
- **Adventure Mode**: Level-based progression (`src/game/adventure/`) with 30 data-driven levels in World 1 ("Nova Valley"), varied level objectives (Score, Lines, Combo, Composite), move limits, star ratings (1 to 3 stars), rewards (Coins/XP), and persistent level unlocking.
- **Player Accounts & Auth**: Centralized `AuthService` supporting Guest accounts (`PLAY AS GUEST`) and Google, Facebook, and Apple OAuth sign-in. Guests can seamlessly link an OAuth provider without changing player ID or losing progress.
- **Cloud Save & Sync**: Local-first `CloudSyncService` that automatically synchronizes player profiles, Classic high scores, Adventure level progress, stars, coins, and XP with non-destructive conflict resolution (taking highest stars/scores and merging completed levels).
- **Haptics & Audio**: Mobile haptics via `expo-haptics` and audio synthesis via `expo-av` with fail-graceful execution on silent/unsupported devices.

## App Store & Google Play Readiness

The project includes Expo configuration (`app.json`) configured for store publication:
- **iOS**: Bundle identifier `com.blocknova.game`, tablet support, orientation locking to portrait.
- **Android**: Package `com.blocknova.game`, version code 1, adaptive launcher icons, zero required sensitive permissions.

## Environment Setup

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_SUPABASE_URL=https://your-supabase-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

## Database Migration & Schema

Apply the database schema in `supabase/migrations/20260101000000_init_schema.sql` via Supabase CLI or SQL Editor:
- **Tables**: `players`, `classic_statistics`, `adventure_progress`, `player_settings`, `leaderboard_entries`
- **Security**: Row Level Security (RLS) policies enabled for all tables ensuring players can only manage their own data.

## Development & Build Commands

```bash
# Install dependencies
npm install

# Run game engine, adventure, and auth/cloud sync unit tests
npm run test

# Typecheck and build production bundle
npm run build

# Start Expo development server for iOS / Android
npx expo start

# Run Expo Android emulator
npx expo start --android

# Run Expo iOS simulator
npx expo start --ios
```

## Directory Structure

```text
├── app.json                    # Expo mobile application configuration (bundle ID, icons, permissions)
├── .env.example                # Template environment configuration file
├── supabase/
│   └── migrations/             # Supabase PostgreSQL schema and Row Level Security policies
├── src/
│   ├── game/                   # Platform-independent game engine
│   │   ├── Board.ts            # 8x8 Board state, placement validation, line clearing
│   │   ├── Piece.ts            # Piece shapes, variants, cell offsets
│   │   ├── PieceLibrary.ts     # Shape definitions (Basic, Squares, Shapes, Irregular)
│   │   ├── PieceGenerator.ts   # Seeded piece pool generator
│   │   ├── Scoring.ts          # Configurable scoring rules
│   │   ├── Combo.ts            # Combo streak tracking
│   │   ├── GameEngine.ts       # Central game engine coordinator
│   │   └── adventure/          # Adventure Mode engine & data architecture
│   ├── components/             # Mobile React Native UI components
│   │   ├── GameHeader.tsx      # Score, Best score, Pause, Combo streak header
│   │   ├── GameBoard.tsx       # Responsive 8x8 Board grid with placement preview
│   │   ├── PieceTray.tsx       # 3-piece tray slot touch target
│   │   ├── Piece.tsx       # Piece component
│   │   ├── MainMenu.tsx        # Mobile Main Menu screen with Profile entry
│   │   ├── GameOverModal.tsx   # Results screen modal
│   │   ├── profile/            # Profile & Account UI
│   │   │   └── ProfileModal.tsx  # Avatar selection, display name editing, OAuth linking
│   │   └── adventure/          # Adventure UI components
│   ├── services/               # Mobile abstraction services
│   │   ├── Storage.ts          # AsyncStorage with versioning and active state saving
│   │   ├── Audio.ts            # Expo AV / Web Audio sound synthesis
│   │   ├── Haptics.ts          # Expo Haptics tactile feedback
│   │   └── backend/            # Supabase Backend Services
│   │       ├── supabaseClient.ts # Supabase client initialization
│   │       ├── AuthService.ts    # Guest & OAuth authentication & profile management
│   │       └── CloudSyncService.ts # Local-first cloud save sync & conflict resolver
│   ├── tests/                  # Engine, Adventure & Auth/Sync unit test suites
│   └── App.tsx                 # Root mobile component with gesture PanResponder & screen states
```
