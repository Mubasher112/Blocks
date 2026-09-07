import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  PanResponderInstance,
  GestureResponderEvent,
  BackHandler,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { GameEngine, GameStatus, GameStats } from './game/GameEngine';
import { AdventureEngine } from './game/adventure/AdventureEngine';
import { AdventureLevel, AdventureProgress } from './game/adventure/AdventureTypes';
import { WORLD_1_DATA } from './game/adventure/levels/world1';
import { ObjectiveEvaluator } from './game/adventure/ObjectiveEvaluator';
import { Piece } from './game/Piece';
import { Board } from './game/Board';

import { GameHeader } from './components/GameHeader';
import { GameBoard } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { PieceComponent } from './components/Piece';
import { MainMenu } from './components/MainMenu';
import { GameOverModal } from './components/GameOverModal';

import { AdventureMap } from './components/adventure/AdventureMap';
import { LevelStartModal } from './components/adventure/LevelStartModal';
import { LevelSuccessModal } from './components/adventure/LevelSuccessModal';
import { LevelFailedModal } from './components/adventure/LevelFailedModal';
import { ProfileModal } from './components/profile/ProfileModal';

import { LeaderboardScreen } from './components/leaderboard/LeaderboardScreen';
import { SocialScreen } from './components/social/SocialScreen';
import { PublicProfileModal } from './components/social/PublicProfileModal';

import { NovaMeter } from './components/nova/NovaMeter';
import { NovaPowerPanel } from './components/nova/NovaPowerPanel';
import { PulseTargetSelector } from './components/nova/PulseTargetSelector';
import { WildShapePicker } from './components/nova/WildShapePicker';
import { NovaPowerId, NovaState } from './game/nova/NovaTypes';

import { DailyChallenge, StreakInfo } from './game/events/DailyChallengeTypes';
import { DailyChallengeScreen } from './components/events/DailyChallengeScreen';
import { DailyResultModal } from './components/events/DailyResultModal';

import { StorageService, DEFAULT_ADVENTURE_PROGRESS } from './services/Storage';
import { AuthService, PlayerProfile } from './services/backend/AuthService';
import { CloudSyncService } from './services/backend/CloudSyncService';
import { ScoreService } from './services/backend/ScoreService';
import { PublicPlayerCard } from './services/backend/SocialService';
import { DailyChallengeService } from './services/backend/DailyChallengeService';

import { audio } from './services/Audio';
import { haptics } from './services/Haptics';

type ScreenState =
  | 'MENU'
  | 'CLASSIC'
  | 'ADVENTURE_MAP'
  | 'ADVENTURE_GAME'
  | 'DAILY_SCREEN'
  | 'DAILY_GAME'
  | 'LEADERBOARDS'
  | 'SOCIAL';

export const App: React.FC = () => {
  // Engine Instances
  const classicEngineRef = useRef<GameEngine>(new GameEngine());
  const adventureEngineRef = useRef<AdventureEngine>(new AdventureEngine());

  // Active Screen & Player State
  const [screen, setScreen] = useState<ScreenState>('MENU');
  const [activeLevel, setActiveLevel] = useState<AdventureLevel | null>(null);
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [selectedPublicPlayer, setSelectedPublicPlayer] = useState<PublicPlayerCard | null>(null);

  // App UI States
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    totalLinesCleared: 0,
    totalBlocksPlaced: 0,
    highScore: 0,
    longestCombo: 0,
  });
  const [adventureProgress, setAdventureProgress] = useState<AdventureProgress>(DEFAULT_ADVENTURE_PROGRESS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Daily Challenge States
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyStreak, setDailyStreak] = useState<StreakInfo | null>(null);
  const [dailyBestScore, setDailyBestScore] = useState<number>(0);
  const [showDailyResultModal, setShowDailyResultModal] = useState<boolean>(false);
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(false);

  // Modal States
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showLevelStartModal, setShowLevelStartModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showFailedModal, setShowFailedModal] = useState<boolean>(false);
  const [completedStars, setCompletedStars] = useState<number>(0);

  // Nova UI States
  const [novaState, setNovaState] = useState<NovaState>({
    energy: 0,
    status: 'NORMAL',
    remainingTurns: 0,
    activePowers: ['pulse', 'wild', 'shuffle', 'undo', 'prism'],
    consumedPowers: [],
    isPrismArmed: false,
    activationCount: 0,
  });
  const [showPulseSelector, setShowPulseSelector] = useState<boolean>(false);
  const [showWildPicker, setShowWildPicker] = useState<boolean>(false);

  // Geometry ref
  const boardLayoutRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const gameContainerRef = useRef<any>(null);
  const containerLayoutRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drag Interaction States
  const [activeDragIndex, setActiveDragIndex] = useState<number | null>(null);
  const [dragLocation, setDragLocation] = useState<{ x: number; y: number } | null>(null);
  const [previewPos, setPreviewPos] = useState<{ r: number; c: number } | null>(null);
  const [isValidPreview, setIsValidPreview] = useState<boolean>(false);

  // Animation States
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [floatingScores, setFloatingScores] = useState<
    { id: number; score: number; r: number; c: number }[]
  >([]);

  // Refs for tracking drag state inside PanResponder handlers
  const activeDragIndexRef = useRef<number | null>(null);
  const draggedPieceRef = useRef<Piece | null>(null);
  const previewPosRef = useRef<{ r: number; c: number } | null>(null);
  const isValidPreviewRef = useRef<boolean>(false);

  // Helper to get currently active engine based on screen
  const getActiveEngine = useCallback(() => {
    return screen === 'ADVENTURE_GAME' || screen === 'DAILY_GAME'
      ? adventureEngineRef.current
      : classicEngineRef.current;
  }, [screen]);

  // Sync state from engine to React components and trigger Cloud Sync & Leaderboard score submission
  const syncEngineState = useCallback(async () => {
    const engine = getActiveEngine();
    setScore(engine.getScore());
    setHighScore(engine.getHighScore());
    setComboCount(engine.getComboCount());
    setStatus(engine.getStatus());
    setNovaState(engine.getNovaEngine().getState());
    const currentStats = engine.getStats();
    setStats(currentStats);
    await StorageService.saveStats(currentStats);

    if (player) {
      const syncRes = await CloudSyncService.sync(player.id);
      if (syncRes.conflictResolved) {
        setStats(syncRes.mergedStats);
        setHighScore(syncRes.mergedStats.highScore);
        setAdventureProgress(syncRes.mergedAdventure);
      }

      // Submit Classic scores to All-Time and Weekly Leaderboards
      if (screen === 'CLASSIC' && engine.getScore() > 0) {
        await ScoreService.submitScore(player, 'CLASSIC_ALL_TIME', 'ALL_TIME', engine.getScore());
        await ScoreService.submitScore(
          player,
          'CLASSIC_WEEKLY',
          ScoreService.getWeeklyPeriodKey(),
          engine.getScore()
        );
      }

      // Submit Adventure Total Stars to Adventure Leaderboard
      if (screen === 'ADVENTURE_GAME') {
        await ScoreService.submitScore(
          player,
          'ADVENTURE_GLOBAL',
          'ALL_TIME',
          adventureProgress.totalStars
        );
      }
    }
  }, [getActiveEngine, player, screen, adventureProgress.totalStars]);

  // Load persistent stats, settings, player profile, and adventure progress on mount
  useEffect(() => {
    async function loadData() {
      const loadedStats = await StorageService.loadStats();
      const loadedSettings = await StorageService.loadSettings();
      const loadedProgress = await StorageService.loadAdventureProgress();

      setStats(loadedStats);
      setHighScore(loadedStats.highScore);
      setSoundEnabled(loadedSettings.soundEnabled);
      setAdventureProgress(loadedProgress);

      audio.setEnabled(loadedSettings.soundEnabled);
      haptics.setEnabled(loadedSettings.hapticsEnabled);

      classicEngineRef.current = new GameEngine(undefined, loadedStats);

      // Login/Restore Guest Player
      const guestPlayer = await AuthService.loginAsGuest();
      setPlayer(guestPlayer);

      // Fetch Today's Daily Challenge & Streak
      const challenge = await DailyChallengeService.getTodayChallenge();
      const streak = await DailyChallengeService.getStreak(guestPlayer.id);
      setDailyChallenge(challenge);
      setDailyStreak(streak);

      // Perform initial cloud sync & pending offline submissions sync
      const syncRes = await CloudSyncService.sync(guestPlayer.id);
      if (syncRes.conflictResolved) {
        setStats(syncRes.mergedStats);
        setHighScore(syncRes.mergedStats.highScore);
        setAdventureProgress(syncRes.mergedAdventure);
      }
      await DailyChallengeService.syncPendingSubmissions(guestPlayer);
    }
    loadData();
  }, []);

  // Handle Android Back Button to navigate screens
  useEffect(() => {
    const backAction = () => {
      if (selectedPublicPlayer) {
        setSelectedPublicPlayer(null);
        return true;
      }
      if (showProfileModal) {
        setShowProfileModal(false);
        return true;
      }
      if (screen === 'CLASSIC' || screen === 'ADVENTURE_GAME' || screen === 'DAILY_GAME') {
        setScreen(screen === 'ADVENTURE_GAME' ? 'ADVENTURE_MAP' : screen === 'DAILY_GAME' ? 'DAILY_SCREEN' : 'MENU');
        return true;
      }
      if (screen === 'ADVENTURE_MAP' || screen === 'DAILY_SCREEN' || screen === 'LEADERBOARDS' || screen === 'SOCIAL') {
        setScreen('MENU');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [screen, showProfileModal, selectedPublicPlayer]);

  // App Lifecycle Handling
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (screen === 'CLASSIC' && status === 'PLAYING') {
          const engine = classicEngineRef.current;
          const grid = engine.getBoard().getGrid();
          const trayShapes = engine.getTray().map(p => (p ? p.shapeId : null));

          await StorageService.saveActiveGame({
            score: engine.getScore(),
            highScore: engine.getHighScore(),
            comboCount: engine.getComboCount(),
            grid: grid.map(row => row.map(cell => ({ state: cell.state, color: cell.color }))),
            trayShapes,
            stats: engine.getStats(),
            novaState: engine.getNovaEngine().getState(),
            saveVersion: 1,
          });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [screen, status]);

  // Start Classic Game
  const handleStartClassic = async () => {
    audio.playButtonClick();
    await StorageService.clearActiveGame();
    classicEngineRef.current.startNewGame();
    setScreen('CLASSIC');
    await syncEngineState();
  };

  // Start Selected Adventure Level
  const handleStartAdventureLevel = (level: AdventureLevel) => {
    setActiveLevel(level);
    setShowLevelStartModal(true);
  };

  const handleConfirmStartAdventureLevel = async () => {
    if (!activeLevel) return;

    audio.playButtonClick();
    setShowLevelStartModal(false);
    adventureEngineRef.current.startLevel(activeLevel);
    setScreen('ADVENTURE_GAME');
    await syncEngineState();
  };

  // Toggle Sound Settings
  const handleToggleSound = async () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    audio.setEnabled(nextState);
    await StorageService.saveSettings({ soundEnabled: nextState, hapticsEnabled: true });
  };

  // Handle Level Win/Progress Update
  const handleLevelCompleted = async (level: AdventureLevel, finalScore: number, stars: number) => {
    setCompletedStars(stars);
    setShowSuccessModal(true);

    const updatedCompleted = { ...adventureProgress.completedLevels };
    const prevEntry = updatedCompleted[level.id];
    const newBestScore = prevEntry ? Math.max(prevEntry.bestScore, finalScore) : finalScore;
    const newStars = prevEntry ? Math.max(prevEntry.stars, stars) : stars;

    updatedCompleted[level.id] = { stars: newStars, bestScore: newBestScore };

    const totalStars = Object.values(updatedCompleted).reduce((sum, item) => sum + item.stars, 0);

    const nextLevelNum = Math.max(adventureProgress.unlockedLevelNumber, level.levelNumber + 1);

    const newProgress: AdventureProgress = {
      ...adventureProgress,
      unlockedLevelNumber: nextLevelNum,
      completedLevels: updatedCompleted,
      totalStars,
      coins: adventureProgress.coins + level.rewards.coins,
      xp: adventureProgress.xp + level.rewards.xp,
    };

    setAdventureProgress(newProgress);
    await StorageService.saveAdventureProgress(newProgress);

    if (player) {
      await CloudSyncService.sync(player.id);
      await ScoreService.submitScore(player, 'ADVENTURE_GLOBAL', 'ALL_TIME', totalStars);
    }
  };

  // Touch Drag-and-Drop PanResponder Implementation
  const panResponder = useRef<PanResponderInstance>(
    PanResponder.create({
      onStartShouldSetPanResponder: () => activeDragIndexRef.current !== null,
      onMoveShouldSetPanResponder: () => activeDragIndexRef.current !== null,
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const index = activeDragIndexRef.current;
        const piece = draggedPieceRef.current;
        const layout = boardLayoutRef.current;

        if (index === null || !piece || !layout) return;

        const touchX = evt.nativeEvent.pageX;
        const touchY = evt.nativeEvent.pageY;

        // Board padding (10px) and cell gap (4px) inside GameBoard.tsx
        const INNER_PADDING = 10;
        const GAP = 4;

        const usableWidth = layout.width - 2 * INNER_PADDING - (Board.SIZE - 1) * GAP;
        const cellSize = usableWidth / Board.SIZE;
        const stride = cellSize + GAP;

        // Vertical lift offset (60px) so player's thumb does not obscure target board cells
        const FINGER_OFFSET_Y = 60;
        const targetX = touchX;
        const targetY = touchY - FINGER_OFFSET_Y;

        const pieceWidthPx = piece.width * stride - GAP;
        const pieceHeightPx = piece.height * stride - GAP;

        // Continuous top-left coordinate of floating piece in screen space
        const pieceLeftX = targetX - pieceWidthPx / 2;
        const pieceTopY = targetY - pieceHeightPx / 2;

        setDragLocation({ x: pieceLeftX, y: pieceTopY });

        // Calculate target board cell directly under the piece's center target point
        const fingerX = targetX - (layout.x + INNER_PADDING);
        const fingerY = targetY - (layout.y + INNER_PADDING);

        const fingerC = Math.floor(fingerX / stride);
        const fingerR = Math.floor(fingerY / stride);

        // Center piece occupied cells over target cell
        const centerOffsetC = Math.floor((piece.width - 1) / 2);
        const centerOffsetR = Math.floor((piece.height - 1) / 2);

        const c = fingerC - centerOffsetC;
        const r = fingerR - centerOffsetR;

        const engine = getActiveEngine();

        if (r >= 0 && r < Board.SIZE && c >= 0 && c < Board.SIZE) {
          const valid = engine.getBoard().canPlacePiece(piece, r, c);
          previewPosRef.current = { r, c };
          isValidPreviewRef.current = valid;
          setPreviewPos({ r, c });
          setIsValidPreview(valid);
        } else {
          previewPosRef.current = null;
          isValidPreviewRef.current = false;
          setPreviewPos(null);
          setIsValidPreview(false);
        }
      },
      onPanResponderRelease: async () => {
        const index = activeDragIndexRef.current;
        const piece = draggedPieceRef.current;
        const pos = previewPosRef.current;
        const isValid = isValidPreviewRef.current;

        if (index !== null && piece && pos && isValid) {
          if (screen === 'DAILY_GAME' && dailyChallenge) {
            // Daily Challenge Gameplay Loop
            const moveResult = adventureEngineRef.current.placeAdventurePiece(index, pos.r, pos.c);
            if (moveResult.success) {
              audio.playPlace();
              haptics.place();

              if (moveResult.linesCleared > 0) {
                audio.playClear(moveResult.linesCleared);
                haptics.clear();
              }

              if (moveResult.isObjectiveComplete || moveResult.isGameOver) {
                const finalScore = adventureEngineRef.current.getScore();
                setDailyCompleted(moveResult.isObjectiveComplete);

                if (player) {
                  const res = await DailyChallengeService.submitResult(
                    player,
                    dailyChallenge.id,
                    finalScore,
                    adventureEngineRef.current.getGameplayStats().linesCleared,
                    adventureEngineRef.current.getGameplayStats().movesUsed,
                    moveResult.isObjectiveComplete
                  );
                  setDailyBestScore(res.bestScore);
                  setDailyStreak(res.streakInfo);
                }

                setShowDailyResultModal(true);
              }

              await syncEngineState();
            }
          } else if (screen === 'ADVENTURE_GAME' && activeLevel) {
            const moveResult = adventureEngineRef.current.placeAdventurePiece(index, pos.r, pos.c);

            if (moveResult.success) {
              audio.playPlace();
              haptics.place();

              if (moveResult.linesCleared > 0) {
                audio.playClear(moveResult.linesCleared);
                haptics.clear();

                const clearSet = new Set<string>();
                moveResult.clearedCells.forEach(cell => clearSet.add(`${cell.r},${cell.c}`));
                setClearingCells(clearSet);

                setTimeout(() => setClearingCells(new Set()), 300);

                const scoreId = Date.now();
                setFloatingScores(prev => [
                  ...prev,
                  { id: scoreId, score: moveResult.scoreGained, r: pos.r, c: pos.c },
                ]);

                setTimeout(() => setFloatingScores(prev => prev.filter(item => item.id !== scoreId)), 800);
              }

              if (moveResult.comboCount > 1) {
                audio.playCombo(moveResult.comboCount);
                haptics.combo();
              }

              // Check level success or failure
              if (moveResult.isObjectiveComplete) {
                audio.playClear(3);
                haptics.clear();
                await handleLevelCompleted(activeLevel, adventureEngineRef.current.getScore(), moveResult.starsEarned);
              } else if (moveResult.isGameOver) {
                audio.playGameOver();
                haptics.gameOver();
                setShowFailedModal(true);
              }

              await syncEngineState();
            }
          } else {
            // Classic Game Placement
            const moveResult = classicEngineRef.current.placePiece(index, pos.r, pos.c);

            if (moveResult.success) {
              audio.playPlace();
              haptics.place();

              if (moveResult.linesCleared > 0) {
                audio.playClear(moveResult.linesCleared);
                haptics.clear();

                const clearSet = new Set<string>();
                moveResult.clearedCells.forEach(cell => clearSet.add(`${cell.r},${cell.c}`));
                setClearingCells(clearSet);

                setTimeout(() => setClearingCells(new Set()), 300);

                const scoreId = Date.now();
                setFloatingScores(prev => [
                  ...prev,
                  { id: scoreId, score: moveResult.scoreGained, r: pos.r, c: pos.c },
                ]);

                setTimeout(() => setFloatingScores(prev => prev.filter(item => item.id !== scoreId)), 800);
              }

              if (moveResult.comboCount > 1) {
                audio.playCombo(moveResult.comboCount);
                haptics.combo();
              }

              if (moveResult.isGameOver) {
                audio.playGameOver();
                haptics.gameOver();
              }

              await syncEngineState();
            }
          }
        }

        activeDragIndexRef.current = null;
        draggedPieceRef.current = null;
        previewPosRef.current = null;
        isValidPreviewRef.current = false;

        setActiveDragIndex(null);
        setDragLocation(null);
        setPreviewPos(null);
        setIsValidPreview(false);
      },
      onPanResponderTerminate: () => {
        activeDragIndexRef.current = null;
        draggedPieceRef.current = null;
        previewPosRef.current = null;
        isValidPreviewRef.current = false;

        setActiveDragIndex(null);
        setDragLocation(null);
        setPreviewPos(null);
        setIsValidPreview(false);
      },
    })
  ).current;

  // Handle start touch on piece slot
  const handleStartDrag = (index: number, startX: number, startY: number) => {
    const engine = getActiveEngine();
    const piece = engine.getTray()[index];
    if (!piece) return;

    audio.playPickup();
    haptics.pickup();

    activeDragIndexRef.current = index;
    draggedPieceRef.current = piece;

    const FINGER_OFFSET_Y = 60;
    const INNER_PADDING = 10;
    const GAP = 4;
    const layout = boardLayoutRef.current;
    const usableWidth = layout ? layout.width - 2 * INNER_PADDING - (Board.SIZE - 1) * GAP : 320;
    const cellSize = usableWidth / Board.SIZE;
    const stride = cellSize + GAP;

    const pieceWidthPx = piece.width * stride - GAP;
    const pieceHeightPx = piece.height * stride - GAP;

    const pieceLeftX = startX - pieceWidthPx / 2;
    const pieceTopY = (startY - FINGER_OFFSET_Y) - pieceHeightPx / 2;

    setActiveDragIndex(index);
    setDragLocation({ x: pieceLeftX, y: pieceTopY });
  };

  const activePiece = activeDragIndex !== null ? getActiveEngine().getTray()[activeDragIndex] : null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        {screen === 'MENU' && (
          <MainMenu
            stats={stats}
            player={player}
            dailyChallenge={dailyChallenge}
            dailyStreak={dailyStreak}
            onPlayClassic={handleStartClassic}
            onPlayAdventure={() => setScreen('ADVENTURE_MAP')}
            onPlayDaily={() => setScreen('DAILY_SCREEN')}
            onOpenProfile={() => setShowProfileModal(true)}
            onOpenLeaderboards={() => setScreen('LEADERBOARDS')}
            onOpenSocial={() => setScreen('SOCIAL')}
          />
        )}

        {screen === 'DAILY_SCREEN' && (
          <DailyChallengeScreen
            challenge={dailyChallenge}
            streak={dailyStreak}
            bestScore={dailyBestScore}
            onStart={async () => {
              if (dailyChallenge) {
                audio.playButtonClick();
                adventureEngineRef.current.startLevel({
                  id: dailyChallenge.id,
                  worldId: 'daily',
                  levelNumber: 1,
                  name: dailyChallenge.title,
                  description: dailyChallenge.description,
                  difficulty: dailyChallenge.difficulty,
                  objective: dailyChallenge.objective,
                  moveLimit: dailyChallenge.moveLimit,
                  starRequirements: { twoStarScore: 1000, threeStarScore: 2000 },
                  rewards: dailyChallenge.rewards,
                  seed: dailyChallenge.seed,
                  initialBoard: dailyChallenge.initialBoard,
                });
                setScreen('DAILY_GAME');
                await syncEngineState();
              }
            }}
            onBack={() => setScreen('MENU')}
          />
        )}

        {screen === 'ADVENTURE_MAP' && (
          <AdventureMap
            world={WORLD_1_DATA}
            progress={adventureProgress}
            onSelectLevel={handleStartAdventureLevel}
            onBack={() => setScreen('MENU')}
          />
        )}

        {screen === 'LEADERBOARDS' && (
          <LeaderboardScreen
            currentPlayerId={player ? player.id : null}
            onBack={() => setScreen('MENU')}
          />
        )}

        {screen === 'SOCIAL' && player && (
          <SocialScreen
            player={player}
            onBack={() => setScreen('MENU')}
          />
        )}

        {(screen === 'CLASSIC' || screen === 'ADVENTURE_GAME' || screen === 'DAILY_GAME') && (
          <View
            ref={gameContainerRef}
            style={styles.gameContainer}
            {...panResponder.panHandlers}
            onLayout={() => {
              if (gameContainerRef.current && gameContainerRef.current.measureInWindow) {
                gameContainerRef.current.measureInWindow((x: number, y: number) => {
                  containerLayoutRef.current = { x, y };
                });
              }
            }}
          >
            <GameHeader
              score={score}
              highScore={highScore}
              comboCount={comboCount}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              onPause={() => setScreen('MENU')}
              onRestart={async () => {
                if (screen === 'ADVENTURE_GAME' && activeLevel) {
                  adventureEngineRef.current.startLevel(activeLevel);
                } else {
                  classicEngineRef.current.startNewGame();
                }
                await syncEngineState();
              }}
            />

            {/* In-Game Objective HUD for Adventure Mode */}
            {screen === 'ADVENTURE_GAME' && activeLevel && (
              <View style={styles.objectiveHud}>
                <Text style={styles.objectiveHudText}>
                  🎯 {activeLevel.name} • {ObjectiveEvaluator.getObjectiveProgress(activeLevel.objective, adventureEngineRef.current.getGameplayStats())}% Objective
                </Text>
                {adventureEngineRef.current.getMovesRemaining() !== null && (
                  <Text style={styles.movesHudText}>
                    ⚡ {adventureEngineRef.current.getMovesRemaining()} Moves
                  </Text>
                )}
              </View>
            )}

            {/* Nova Meter & Nova Powers UI */}
            <View style={styles.novaContainer}>
              <NovaMeter
                novaState={novaState}
                onActivate={async () => {
                  const engine = getActiveEngine();
                  const activated = engine.activateNova();
                  if (activated) {
                    audio.playNovaActivate();
                    haptics.novaActivate();
                    await syncEngineState();
                  }
                }}
              />
              <NovaPowerPanel
                novaState={novaState}
                canUndo={getActiveEngine().getNovaEngine().canUndo()}
                onSelectPower={async (powerId: NovaPowerId) => {
                  const engine = getActiveEngine();
                  if (powerId === 'pulse') {
                    setShowPulseSelector(true);
                  } else if (powerId === 'wild') {
                    setShowWildPicker(true);
                  } else if (powerId === 'shuffle') {
                    audio.playNovaPower();
                    haptics.novaPower();
                    engine.executeShuffle();
                    await syncEngineState();
                  } else if (powerId === 'undo') {
                    audio.playNovaPower();
                    haptics.novaPower();
                    engine.undo();
                    await syncEngineState();
                  } else if (powerId === 'prism') {
                    audio.playNovaPower();
                    haptics.novaPower();
                    engine.executePrism();
                    await syncEngineState();
                  }
                }}
              />
            </View>

            <GameBoard
              board={getActiveEngine().getBoard()}
              draggedPiece={activePiece}
              previewPos={previewPos}
              isValidPreview={isValidPreview}
              clearingCells={clearingCells}
              floatingScores={floatingScores}
              onLayoutBoard={(x: number, y: number, width: number, height: number) => {
                boardLayoutRef.current = { x, y, width, height };
              }}
            />

            <PieceTray
              tray={getActiveEngine().getTray()}
              activeDragIndex={activeDragIndex}
              onGrantTouch={handleStartDrag}
            />

            {/* Dragging Piece Floating Overlay */}
            {activeDragIndex !== null && activePiece && dragLocation && (
              <View
                style={[
                  styles.dragOverlay,
                  {
                    left: dragLocation.x - containerLayoutRef.current.x,
                    top: dragLocation.y - containerLayoutRef.current.y,
                  },
                ]}
                pointerEvents="none"
              >
                <PieceComponent
                  piece={activePiece}
                  isDragging={true}
                  scale={1.0}
                  cellSize={boardLayoutRef.current ? (boardLayoutRef.current.width - 20) / Board.SIZE : 36}
                />
              </View>
            )}

            {/* Classic Mode Game Over Modal */}
            {screen === 'CLASSIC' && status === 'GAMEOVER' && (
              <GameOverModal
                score={score}
                highScore={highScore}
                isNewHighScore={score >= highScore && score > 0}
                stats={stats}
                onPlayAgain={handleStartClassic}
                onHome={() => setScreen('MENU')}
              />
            )}

            {/* Adventure Level Modals */}
            {showSuccessModal && activeLevel && (
              <LevelSuccessModal
                level={activeLevel}
                score={score}
                stars={completedStars}
                coinsEarned={activeLevel.rewards.coins}
                xpEarned={activeLevel.rewards.xp}
                hasNextLevel={activeLevel.levelNumber < WORLD_1_DATA.levels.length}
                onNextLevel={() => {
                  setShowSuccessModal(false);
                  const nextLvl = WORLD_1_DATA.levels.find(l => l.levelNumber === activeLevel.levelNumber + 1);
                  if (nextLvl) {
                    handleStartAdventureLevel(nextLvl);
                  } else {
                    setScreen('ADVENTURE_MAP');
                  }
                }}
                onReplay={async () => {
                  setShowSuccessModal(false);
                  adventureEngineRef.current.startLevel(activeLevel);
                  await syncEngineState();
                }}
                onMap={() => {
                  setShowSuccessModal(false);
                  setScreen('ADVENTURE_MAP');
                }}
              />
            )}

            {showFailedModal && activeLevel && (
              <LevelFailedModal
                level={activeLevel}
                score={score}
                onRetry={async () => {
                  setShowFailedModal(false);
                  adventureEngineRef.current.startLevel(activeLevel);
                  await syncEngineState();
                }}
                onMap={() => {
                  setShowFailedModal(false);
                  setScreen('ADVENTURE_MAP');
                }}
              />
            )}
          </View>
        )}

        {/* Level Start Pre-Game Dialog */}
        {showLevelStartModal && activeLevel && (
          <LevelStartModal
            level={activeLevel}
            onStart={handleConfirmStartAdventureLevel}
            onClose={() => setShowLevelStartModal(false)}
          />
        )}

        {/* Profile / Account Settings Modal */}
        {showProfileModal && player && (
          <ProfileModal
            player={player}
            onUpdatePlayer={(updated) => setPlayer(updated)}
            onClose={() => setShowProfileModal(false)}
          />
        )}

        {/* Public Player Card Modal */}
        {selectedPublicPlayer && player && (
          <PublicProfileModal
            card={selectedPublicPlayer}
            currentPlayerId={player.id}
            onClose={() => setSelectedPublicPlayer(null)}
          />
        )}

        {/* Daily Challenge Result Modal */}
        {showDailyResultModal && dailyChallenge && (
          <DailyResultModal
            visible={showDailyResultModal}
            challenge={dailyChallenge}
            score={score}
            bestScore={dailyBestScore}
            completed={dailyCompleted}
            streak={dailyStreak}
            onRetry={async () => {
              setShowDailyResultModal(false);
              adventureEngineRef.current.startLevel({
                id: dailyChallenge.id,
                worldId: 'daily',
                levelNumber: 1,
                name: dailyChallenge.title,
                description: dailyChallenge.description,
                difficulty: dailyChallenge.difficulty,
                objective: dailyChallenge.objective,
                moveLimit: dailyChallenge.moveLimit,
                starRequirements: { twoStarScore: 1000, threeStarScore: 2000 },
                rewards: dailyChallenge.rewards,
                seed: dailyChallenge.seed,
                initialBoard: dailyChallenge.initialBoard,
              });
              await syncEngineState();
            }}
            onHome={() => {
              setShowDailyResultModal(false);
              setScreen('DAILY_SCREEN');
            }}
          />
        )}

        {/* Pulse Power Target Selector Modal */}
        <PulseTargetSelector
          visible={showPulseSelector}
          onSelectCell={async (r, c) => {
            setShowPulseSelector(false);
            audio.playNovaClear();
            haptics.novaClear();
            getActiveEngine().executePulse(r, c);
            await syncEngineState();
          }}
          onCancel={() => setShowPulseSelector(false)}
        />

        {/* Wild Power Shape Picker Modal */}
        <WildShapePicker
          visible={showWildPicker}
          onSelectShape={async (newPiece) => {
            setShowWildPicker(false);
            audio.playNovaPower();
            haptics.novaPower();
            getActiveEngine().executeWild(0, newPiece);
            await syncEngineState();
          }}
          onCancel={() => setShowWildPicker(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f17',
  },
  gameContainer: {
    flex: 1,
    position: 'relative',
  },
  novaContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  objectiveHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 12,
  },
  objectiveHudText: {
    color: '#00F0FF',
    fontWeight: '800',
    fontSize: 12,
  },
  movesHudText: {
    color: '#FF007F',
    fontWeight: '800',
    fontSize: 12,
  },
  dragOverlay: {
    position: 'absolute',
    zIndex: 1000,
  },
});
