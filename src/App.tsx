import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine, GameStatus, GameStats } from './game/GameEngine';
import { Piece } from './game/Piece';
import { Board } from './game/Board';
import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { PieceComponent } from './components/Piece';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';
import { StorageService } from './services/Storage';
import { audio } from './services/Audio';
import { haptics } from './services/Haptics';

export const App: React.FC = () => {
  // Game Engine instance
  const engineRef = useRef<GameEngine>(new GameEngine(undefined, StorageService.loadStats()));

  // App UI States
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [stats, setStats] = useState<GameStats>(StorageService.loadStats());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    StorageService.loadSettings().soundEnabled
  );

  // Drag & Drop Pointer Interaction States
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [previewPos, setPreviewPos] = useState<{ r: number; c: number } | null>(null);
  const [isValidPreview, setIsValidPreview] = useState<boolean>(false);

  // Animation States
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [floatingScores, setFloatingScores] = useState<
    { id: number; score: number; r: number; c: number }[]
  >([]);

  const boardRef = useRef<HTMLDivElement>(null);

  // Sync state from engine to React components
  const syncEngineState = useCallback(() => {
    const engine = engineRef.current;
    setScore(engine.getScore());
    setHighScore(engine.getHighScore());
    setComboCount(engine.getComboCount());
    setStatus(engine.getStatus());
    const currentStats = engine.getStats();
    setStats(currentStats);
    StorageService.saveStats(currentStats);
  }, []);

  // Handle start game
  const handleStartGame = () => {
    audio.playButtonClick();
    engineRef.current.startNewGame();
    syncEngineState();
  };

  // Toggle Sound Settings
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audio.setEnabled(nextState);
    StorageService.saveSettings({ soundEnabled: nextState, hapticsEnabled: true });
  };

  // Drag and Drop Logic using Pointer Events
  const draggedPiece: Piece | null =
    activeDragIndex !== null ? engineRef.current.getTray()[activeDragIndex] : null;

  const handleStartDrag = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    audio.playPickup();
    haptics.pickup();

    setActiveDragIndex(index);
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (activeDragIndex === null || !draggedPiece || !boardRef.current) return;

      setDragPosition({ x: e.clientX, y: e.clientY });

      // Calculate grid alignment relative to GameBoard bounding rectangle
      const rect = boardRef.current.getBoundingClientRect();
      const cellSize = rect.width / Board.SIZE;

      // Offset drag position so piece centers under pointer
      const pieceWidthPx = draggedPiece.width * cellSize;
      const pieceHeightPx = draggedPiece.height * cellSize;

      const boardX = e.clientX - rect.left - pieceWidthPx / 2 + cellSize / 2;
      const boardY = e.clientY - rect.top - pieceHeightPx / 2 + cellSize / 2;

      const c = Math.floor(boardX / cellSize);
      const r = Math.floor(boardY / cellSize);

      if (r >= 0 && r < Board.SIZE && c >= 0 && c < Board.SIZE) {
        setPreviewPos({ r, c });
        const valid = engineRef.current.getBoard().canPlacePiece(draggedPiece, r, c);
        setIsValidPreview(valid);
      } else {
        setPreviewPos(null);
        setIsValidPreview(false);
      }
    },
    [activeDragIndex, draggedPiece]
  );

  const handlePointerUp = useCallback(() => {
    if (activeDragIndex === null || !draggedPiece) return;

    if (previewPos && isValidPreview) {
      // Execute placement in engine
      const moveResult = engineRef.current.placePiece(
        activeDragIndex,
        previewPos.r,
        previewPos.c
      );

      if (moveResult.success) {
        audio.playPlace();
        haptics.place();

        // Line clears trigger sound & haptic feedback
        if (moveResult.linesCleared > 0) {
          audio.playClear(moveResult.linesCleared);
          haptics.clear();

          // Animate line clearing
          const clearSet = new Set<string>();
          moveResult.clearedCells.forEach(cell => clearSet.add(`${cell.r},${cell.c}`));
          setClearingCells(clearSet);

          setTimeout(() => {
            setClearingCells(new Set());
          }, 300);

          // Add floating score popup
          const scoreId = Date.now();
          setFloatingScores(prev => [
            ...prev,
            { id: scoreId, score: moveResult.scoreGained, r: previewPos.r, c: previewPos.c },
          ]);

          setTimeout(() => {
            setFloatingScores(prev => prev.filter(item => item.id !== scoreId));
          }, 800);
        }

        if (moveResult.comboCount > 1) {
          audio.playCombo(moveResult.comboCount);
          haptics.combo();
        }

        if (moveResult.isGameOver) {
          audio.playGameOver();
          haptics.gameOver();
        }

        syncEngineState();
      }
    }

    // Reset drag state
    setActiveDragIndex(null);
    setDragPosition(null);
    setPreviewPos(null);
    setIsValidPreview(false);
  }, [activeDragIndex, draggedPiece, previewPos, isValidPreview, syncEngineState]);

  useEffect(() => {
    if (activeDragIndex !== null) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDragIndex, handlePointerMove, handlePointerUp]);

  return (
    <div className="app-container">
      {status === 'MENU' ? (
        <MainMenu stats={stats} onPlay={handleStartGame} />
      ) : (
        <>
          <GameHeader
            score={score}
            highScore={highScore}
            comboCount={comboCount}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onPause={() => setStatus('MENU')}
            onRestart={handleStartGame}
          />

          <GameBoard
            board={engineRef.current.getBoard()}
            draggedPiece={draggedPiece}
            previewPos={previewPos}
            isValidPreview={isValidPreview}
            clearingCells={clearingCells}
            floatingScores={floatingScores}
            boardRef={boardRef}
          />

          <PieceTray
            tray={engineRef.current.getTray()}
            activeDragIndex={activeDragIndex}
            onStartDrag={handleStartDrag}
          />

          {/* Floating Dragging Piece Overlay */}
          {activeDragIndex !== null && draggedPiece && dragPosition && (
            <div
              className="drag-overlay"
              style={{
                position: 'fixed',
                left: dragPosition.x,
                top: dragPosition.y,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              <PieceComponent piece={draggedPiece} isDragging={true} scale={1.1} />
            </div>
          )}

          {status === 'GAMEOVER' && (
            <GameOverModal
              score={score}
              highScore={highScore}
              isNewHighScore={score >= highScore && score > 0}
              stats={stats}
              onPlayAgain={handleStartGame}
              onHome={() => setStatus('MENU')}
            />
          )}
        </>
      )}

      <style>{`
        .app-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }
      `}</style>
    </div>
  );
};
