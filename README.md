# Block Nova

**Block Nova** is a polished, original 8×8 block-placement puzzle game built with modern web technologies.

## Tech Stack & Architecture Decisions

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Testing**: Vitest
- **Icons**: Lucide React
- **Architecture**:
  - Pure TypeScript Game Engine (`src/game/`) independent of UI components.
  - React UI Layer (`src/components/`) for rendering grid, piece trays, modals, and header.
  - Abstraction Services (`src/services/`) for Web Audio sound synthesis, Haptics, LocalStorage, and Debugging.
  - Deterministic PRNG (`src/utils/random.ts`) using Mulberry32 for seedable piece generation.

## Project Structure

```text
src/
  game/
    Board.ts            # 8x8 Board state, placement validation, line clearing logic
    Piece.ts            # Piece shapes, variants, cell offsets, dimensions
    PieceLibrary.ts     # Shape definitions (Basic, Squares, L/T/S/Z, Irregular)
    PieceGenerator.ts   # Seeded piece pool generator
    Scoring.ts          # Centralized configurable scoring rules
    Combo.ts            # Combo streak tracking and multipliers
    GameEngine.ts       # Central game engine coordinating board, scores, turn state, game over
  components/
    GameBoard.tsx       # Interactive 8x8 Board UI with preview overlay & animations
    PieceTray.tsx       # 3-slot available pieces tray
    Piece.tsx           # Piece component with Pointer event handlers
    GameHeader.tsx      # Header bar displaying score, high score, and combos
    MainMenu.tsx        # Main menu screen with mode teasers
    GameOverModal.tsx   # Results screen with play again option
  services/
    Storage.ts          # LocalStorage persistence for stats and high score
    Audio.ts            # Web Audio API sound generator
    Haptics.ts          # Haptic feedback wrapper
    Debug.ts            # Dev-only state manipulation
  utils/
    random.ts           # Mulberry32 seedable random number generator
  tests/
    engine.test.ts      # Unit test suite for core game logic
```

## Running locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm run test

# Typecheck and production build
npm run build
```
