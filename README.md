# Block Nova

**Block Nova** is a polished, original block-placement puzzle game engineered for mobile platforms (iOS and Android) using **React Native + Expo + TypeScript**, featuring both **Classic Mode** and a 30-level data-driven **Adventure Mode**.

## Architecture & Mobile Design

- **Mobile Framework**: React Native + Expo
- **Language**: TypeScript (strict mode)
- **App Bundle Identifier**: `com.blocknova.game`
- **Game Engine**: Pure TypeScript (`src/game/`) decoupled from UI, DOM, and browser APIs.
- **Classic Mode**: Pure endless block placement with line clearing, combo streaks, and high score tracking.
- **Adventure Mode**: Level-based progression (`src/game/adventure/`) with 30 data-driven levels in World 1 ("Nova Valley"), varied level objectives (Score, Lines, Combo, Composite), move limits, star ratings (1 to 3 stars), rewards (Coins/XP), and persistent level unlocking.
- **Persistence**: Asynchronous cross-platform storage (`@react-native-async-storage/async-storage`) with save data versioning (`saveVersion: 1`) and active game state lifecycle auto-saving.
- **Haptics & Audio**: Mobile haptics via `expo-haptics` and audio synthesis via `expo-av` with fail-graceful execution on silent/unsupported devices.

## App Store & Google Play Readiness

The project includes Expo configuration (`app.json`) configured for store publication:
- **iOS**: Bundle identifier `com.blocknova.game`, tablet support, orientation locking to portrait.
- **Android**: Package `com.blocknova.game`, version code 1, adaptive launcher icons, zero required sensitive permissions.

## Development & Build Commands

```bash
# Install dependencies
npm install

# Run game engine & adventure unit tests
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
├── assets/                     # Mobile icons & splash screen assets
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
│   │       ├── AdventureTypes.ts   # Level, World, Objective, Star & Progress types
│   │       ├── ObjectiveEvaluator.ts # Objective evaluator and star calculator
│   │       ├── AdventureEngine.ts  # Adventure Engine wrapper with move limits & board pre-fill
│   │       └── levels/          # Data-driven level configurations (World 1, 30 levels)
│   ├── components/             # Mobile React Native UI components
│   │   ├── GameHeader.tsx      # Score, Best score, Pause, Combo streak header
│   │   ├── GameBoard.tsx       # Responsive 8x8 Board grid with placement preview
│   │   ├── PieceTray.tsx       # 3-piece tray slot touch target
│   │   ├── Piece.tsx           # Piece component
│   │   ├── MainMenu.tsx        # Mobile Main Menu screen (Classic + Adventure entry)
│   │   ├── GameOverModal.tsx   # Results screen modal
│   │   └── adventure/          # Adventure UI components
│   │       ├── AdventureMap.tsx      # World 1 level selection map & star counters
│   │       ├── LevelStartModal.tsx   # Pre-level goal dialog
│   │       ├── LevelSuccessModal.tsx # Level complete 3-star victory dialog
│   │       └── LevelFailedModal.tsx  # Level failed retry dialog
│   ├── services/               # Mobile abstraction services
│   │   ├── Storage.ts          # AsyncStorage with versioning and active state saving
│   │   ├── Audio.ts            # Expo AV / Web Audio sound synthesis
│   │   ├── Haptics.ts          # Expo Haptics tactile feedback
│   │   └── Debug.ts            # Dev-only debug tools
│   ├── tests/                  # Engine & Adventure unit test suite
│   └── App.tsx                 # Root mobile component with gesture PanResponder & screen states
```
