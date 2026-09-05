# Block Nova

**Block Nova** is a polished, original block-placement puzzle game engineered for mobile platforms (iOS and Android) using **React Native + Expo + TypeScript**, featuring a platform-independent game engine, Classic Mode, 30-level Adventure Mode, Supabase cloud persistence, and a **competitive social leaderboard & friends ranking system**.

## Architecture & Mobile Design

- **Mobile Framework**: React Native + Expo
- **Language**: TypeScript (strict mode)
- **App Bundle Identifier**: `com.blocknova.game`
- **Backend Infrastructure**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Server RPCs)
- **Game Engine**: Pure TypeScript (`src/game/`) decoupled from UI, DOM, and browser APIs.
- **Classic Mode**: Endless block placement with line clearing, combo streaks, and high score tracking.
- **Adventure Mode**: Level-based progression (`src/game/adventure/`) with 30 data-driven levels in World 1 ("Nova Valley"), varied level objectives (Score, Lines, Combo, Composite), move limits, star ratings (1 to 3 stars), rewards (Coins/XP), and persistent level unlocking.
- **Leaderboard System**: `LeaderboardService` & `ScoreService` with server-validated score submission via PostgreSQL RPC (`submit_score`), supporting Classic All-Time, Classic Weekly (ISO period `2026-W36`), Adventure Global Stars, and Friends-only ranking filters.
- **Social & Friends System**: `SocialService` supporting display name player searches, friend request sending/accepting/rejecting, reciprocal friendships, and public player cards.
- **Player Accounts & Auth**: Centralized `AuthService` supporting Guest accounts (`PLAY AS GUEST`) and Google, Facebook, and Apple OAuth sign-in without losing progress.
- **Cloud Save & Sync**: Local-first `CloudSyncService` that automatically synchronizes player profiles, Classic high scores, Adventure level progress, stars, coins, and XP with non-destructive conflict resolution.
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

## Database Migrations & Security Schema

Apply database migrations in `supabase/migrations/` via Supabase CLI or SQL Editor:
- `20260101000000_init_schema.sql`: Core tables (`players`, `classic_statistics`, `adventure_progress`, `player_settings`, `leaderboard_entries`) with Row Level Security.
- `20260102000000_social_leaderboards.sql`: Social tables (`friend_requests`, `friendships`, `leaderboards`), indexing for rank lookups, and server RPC (`submit_score`).

## Development & Build Commands

```bash
# Install dependencies
npm install

# Run all 28 unit tests (Engine, Adventure, Auth, Leaderboards, Social)
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
│   └── migrations/             # Supabase PostgreSQL schema, RLS policies, and server RPC functions
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
│   │   ├── MainMenu.tsx        # Main Menu screen with Profile, Leaderboards & Social entry
│   │   ├── GameOverModal.tsx   # Results screen modal
│   │   ├── profile/            # Profile & Account UI
│   │   ├── leaderboard/        # Leaderboards UI
│   │   │   └── LeaderboardScreen.tsx # Category tabs, Global/Friends filter, Top-N list & own rank
│   │   ├── social/             # Friends & Social UI
│   │   │   ├── SocialScreen.tsx      # Friends list, pending requests, player search
│   │   │   └── PublicProfileModal.tsx # Public player profile card & friend management
│   │   └── adventure/          # Adventure UI components
│   ├── services/               # Mobile abstraction services
│   │   ├── Storage.ts          # AsyncStorage with versioning and active state saving
│   │   ├── Audio.ts            # Expo AV / Web Audio sound synthesis
│   │   ├── Haptics.ts          # Expo Haptics tactile feedback
│   │   └── backend/            # Supabase Backend Services
│   │       ├── supabaseClient.ts     # Supabase client initialization
│   │       ├── AuthService.ts        # Guest & OAuth auth & profile management
│   │       ├── CloudSyncService.ts   # Local-first cloud save sync & conflict resolver
│   │       ├── ScoreService.ts       # Server-validated score submission & ISO period keys
│   │       ├── LeaderboardService.ts # Top-N ranking queries & rank lookups
│   │       └── SocialService.ts      # Player search & friend request management
│   ├── tests/                  # Engine, Adventure, Auth, & Leaderboard/Social test suites
│   └── App.tsx                 # Root mobile component with gesture PanResponder & screen states
```
