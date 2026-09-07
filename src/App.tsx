import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import { SplashScreen } from './components/SplashScreen';
import { PauseModal } from './components/PauseModal';

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
  const [showSplash, setShowSplash] = useState<boolean>(true);
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
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);

  // Daily Challenge States
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyStreak, setDailyStreak] = useState<StreakInfo | null>(null);
  const [dailyBestScore, setDailyBestScore] = useState<number>(0);
  const [showDailyResultModal, setShowDailyResultModal] = useState<boolean>(false);
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(false);

  // Modal States
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
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
  const [splashOverlay, setSplashOverlay] = useState<{ id: number; text: string; subtext?: string } | null>(null);

  // Refs for tracking drag state inside PanResponder handlers
  const activeDragIndexRef = useRef<number | null>(null);
  const draggedPieceRef = useRef<Piece | null>(null);
  const previewPosRef = useRef<{ r: number; c: number } | null>(null);
  const isValidPreviewRef = useRef<boolean>(false);

  // Dynamic state refs to prevent stale closures in PanResponder
  const screenRef = useRef<ScreenState>(screen);
  const activeLevelRef = useRef<AdventureLevel | null>(activeLevel);
  const dailyChallengeRef = useRef<DailyChallenge | null>(dailyChallenge);
  const playerRef = useRef<PlayerProfile | null>(player);
  const adventureProgressRef = useRef<AdventureProgress>(adventureProgress);

  // Synchronize state to refs on each render
  screenRef.current = screen;
  activeLevelRef.current = activeLevel;
  dailyChallengeRef.current = dailyChallenge;
  playerRef.current = player;
  adventureProgressRef.current = adventureProgress;

  // Helper to get currently active engine dynamically
  const getActiveEngine = useCallback(() => {
    return screenRef.current === 'ADVENTURE_GAME' || screenRef.current === 'DAILY_GAME'
      ? adventureEngineRef.current
      : classicEngineRef.current;
  }, []);

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

    const currentPlayer = playerRef.current;
    const currentScreen = screenRef.current;

    if (currentPlayer) {
      const syncRes = await CloudSyncService.sync(currentPlayer.id);
      if (syncRes.conflictResolved) {
        setStats(syncRes.mergedStats);
        setHighScore(syncRes.mergedStats.highScore);
        setAdventureProgress(syncRes.mergedAdventure);
      }

      // Submit Classic scores to All-Time and Weekly Leaderboards
      if (currentScreen === 'CLASSIC' && engine.getScore() > 0) {
        await ScoreService.submitScore(currentPlayer, 'CLASSIC_ALL_TIME', 'ALL_TIME', engine.getScore());
        await ScoreService.submitScore(
          currentPlayer,
          'CLASSIC_WEEKLY',
          ScoreService.getWeeklyPeriodKey(),
          engine.getScore()
        );
      }

      // Submit Adventure Total Stars to Adventure Leaderboard
      if (currentScreen === 'ADVENTURE_GAME') {
        await ScoreService.submitScore(
          currentPlayer,
          'ADVENTURE_GLOBAL',
          'ALL_TIME',
          adventureProgressRef.current.totalStars
        );
      }
    }
  }, [getActiveEngine]);

  // Load persistent stats, settings, player profile, and adventure progress on mount
  useEffect(() => {
    async function loadData() {
      const loadedStats = await StorageService.loadStats();
      const loadedSettings = await StorageService.loadSettings();
      const loadedProgress = await StorageService.loadAdventureProgress();

      setStats(loadedStats);
      setHighScore(loadedStats.highScore);
      setSoundEnabled(loadedSettings.soundEnabled);
      setHapticsEnabled(loadedSettings.hapticsEnabled);
      setAdventureProgress(loadedProgress);

      audio.setEnabled(loadedSettings.soundEnabled);
      haptics.setEnabled(loadedSettings.hapticsEnabled);

      classicEngineRef.current = new GameEngine(undefined, loadedStats);

      // Restore active game if exists
      const savedActiveGame = await StorageService.loadActiveGame();
      if (savedActiveGame) {
        classicEngineRef.current.restoreActiveGame(savedActiveGame);
      }

      // Login/Restore Guest Player
      const guestPlayer = await AuthService.loginAsGuest();
      setPlayer(guestPlayer);

      // Fetch Today's Daily Challenge, Streak & Best Score
      const challenge = await DailyChallengeService.getTodayChallenge();
      const streak = await DailyChallengeService.getStreak(guestPlayer.id);
      const bestDaily = await DailyChallengeService.getPlayerDailyBest(challenge.id);
      setDailyChallenge(challenge);
      setDailyStreak(streak);
      setDailyBestScore(bestDaily);

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
      if (showPauseModal) {
        setShowPauseModal(false);
        return true;
      }
      if (selectedPublicPlayer) {
        setSelectedPublicPlayer(null);
        return true;
      }
      if (showProfileModal) {
        setShowProfileModal(false);
        return true;
      }
      if (screen === 'CLASSIC' || screen === 'ADVENTURE_GAME' || screen === 'DAILY_GAME') {
        setShowPauseModal(true);
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
  }, [screen, showPauseModal, showProfileModal, selectedPublicPlayer]);

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

  // Start or Resume Classic Game
  const handleStartClassic = async () => {
    audio.playButtonClick();
    if (classicEngineRef.current.getStatus() !== 'PLAYING') {
      await StorageService.clearActiveGame();
      classicEngineRef.current.startNewGame();
    }
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
    await StorageService.saveSettings({ soundEnabled: nextState, hapticsEnabled });
  };

  // Toggle Haptics Settings
  const handleToggleHaptics = async () => {
    const nextState = !hapticsEnabled;
    setHapticsEnabled(nextState);
    haptics.setEnabled(nextState);
    await StorageService.saveSettings({ soundEnabled, hapticsEnabled: nextState });
  };

  // Restart current game mode
  const handleRestartGame = async () => {
    audio.playButtonClick();
    setShowPauseModal(false);
    if (screen === 'ADVENTURE_GAME' && activeLevel) {
      adventureEngineRef.current.startLevel(activeLevel);
    } else if (screen === 'DAILY_GAME' && dailyChallenge) {
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
    } else {
      await StorageService.clearActiveGame();
      classicEngineRef.current.startNewGame();
    }
    await syncEngineState();
  };

  // Quit to Menu or Map from Pause Modal
  const handleQuitGame = async () => {
    setShowPauseModal(false);
    if (screen === 'CLASSIC') {
      const engine = classicEngineRef.current;
      if (engine.getStatus() === 'PLAYING') {
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
      setScreen('MENU');
    } else if (screen === 'ADVENTURE_GAME') {
      setScreen('ADVENTURE_MAP');
    } else if (screen === 'DAILY_GAME') {
      setScreen('DAILY_SCREEN');
    }
  };

  // Handle Level Win/Progress Update
  const handleLevelCompleted = useCallback(async (level: AdventureLevel, finalScore: number, stars: number) => {
    setCompletedStars(stars);
    setShowSuccessModal(true);

    const currentProgress = adventureProgressRef.current;
    const updatedCompleted = { ...currentProgress.completedLevels };
    const prevEntry = updatedCompleted[level.id];
    const newBestScore = prevEntry ? Math.max(prevEntry.bestScore, finalScore) : finalScore;
    const newStars = prevEntry ? Math.max(prevEntry.stars, stars) : stars;

    updatedCompleted[level.id] = { stars: newStars, bestScore: newBestScore };

    const totalStars = Object.values(updatedCompleted).reduce((sum, item) => sum + item.stars, 0);

    const nextLevelNum = Math.max(currentProgress.unlockedLevelNumber, level.levelNumber + 1);

    const newProgress: AdventureProgress = {
      ...currentProgress,
      unlockedLevelNumber: nextLevelNum,
      completedLevels: updatedCompleted,
      totalStars,
      coins: currentProgress.coins + level.rewards.coins,
      xp: currentProgress.xp + level.rewards.xp,
    };

    setAdventureProgress(newProgress);
    await StorageService.saveAdventureProgress(newProgress);

    const currentPlayer = playerRef.current;
    if (currentPlayer) {
      await CloudSyncService.sync(currentPlayer.id);
      await ScoreService.submitScore(currentPlayer, 'ADVENTURE_GLOBAL', 'ALL_TIME', totalStars);
    }
  }, []);

  // Synchronous and fallback measurement of container layout offset
  const getContainerOffset = useCallback((): { x: number; y: number } => {
    if (gameContainerRef.current) {
      if (typeof gameContainerRef.current.getBoundingClientRect === 'function') {
        const rect = gameContainerRef.current.getBoundingClientRect();
        containerLayoutRef.current = { x: rect.left, y: rect.top };
        return { x: rect.left, y: rect.top };
      }
    }
    return containerLayoutRef.current;
  }, []);

  const updateContainerMeasurement = useCallback(() => {
    if (gameContainerRef.current) {
      if (typeof gameContainerRef.current.getBoundingClientRect === 'function') {
        const rect = gameContainerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          containerLayoutRef.current = { x: rect.left, y: rect.top };
          return;
        }
      }
      if (gameContainerRef.current.measureInWindow) {
        gameContainerRef.current.measureInWindow((x: number, y: number) => {
          if (x >= 0 && y >= 0) {
            containerLayoutRef.current = { x, y };
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (screen === 'CLASSIC' || screen === 'ADVENTURE_GAME' || screen === 'DAILY_GAME') {
      updateContainerMeasurement();
      const timer = setTimeout(updateContainerMeasurement, 100);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [screen, updateContainerMeasurement]);

  // Ref to hold window listener unbind callback
  const dragCleanupRef = useRef<(() => void) | null>(null);

  // Synchronous update of dragged piece floating coordinates and board preview
  const updateDragPosition = useCallback((touchX: number, touchY: number) => {
    const index = activeDragIndexRef.current;
    const piece = draggedPieceRef.current;
    const layout = boardLayoutRef.current;

    if (index === null || !piece) return;

    const INNER_PADDING = 10;
    const GAP = 4;

    const usableWidth = layout ? layout.width - 2 * INNER_PADDING - (Board.SIZE - 1) * GAP : 320;
    const cellSize = usableWidth / Board.SIZE;
    const stride = cellSize + GAP;

    // Vertical offset (60px) so finger doesn't obscure placement
    const FINGER_OFFSET_Y = 60;
    const targetX = touchX;
    const targetY = touchY - FINGER_OFFSET_Y;

    const pieceWidthPx = piece.width * stride - GAP;
    const pieceHeightPx = piece.height * stride - GAP;

    const containerOffset = getContainerOffset();
    const pieceLeftX = (targetX - containerOffset.x) - pieceWidthPx / 2;
    const pieceTopY = (targetY - containerOffset.y) - pieceHeightPx / 2;

    setDragLocation({ x: pieceLeftX, y: pieceTopY });

    if (!layout) return;

    const fingerX = targetX - (layout.x + INNER_PADDING);
    const fingerY = targetY - (layout.y + INNER_PADDING);

    const fingerC = Math.floor(fingerX / stride);
    const fingerR = Math.floor(fingerY / stride);

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
  }, [getActiveEngine, getContainerOffset]);

  // Handle piece drop / release
  const handleReleaseDrag = useCallback(async () => {
    // Clear global listener references
    if (dragCleanupRef.current) {
      dragCleanupRef.current();
      dragCleanupRef.current = null;
    }

    const index = activeDragIndexRef.current;
    const piece = draggedPieceRef.current;
    const pos = previewPosRef.current;
    const isValid = isValidPreviewRef.current;
    const currentScreen = screenRef.current;
    const currentPlayer = playerRef.current;

    // Reset drag state immediately so the floating piece disappears and the slot un-hides instantly
    activeDragIndexRef.current = null;
    draggedPieceRef.current = null;
    previewPosRef.current = null;
    isValidPreviewRef.current = false;

    setActiveDragIndex(null);
    setDragLocation(null);
    setPreviewPos(null);
    setIsValidPreview(false);

    try {
      if (index !== null && piece && pos && isValid) {
        if (currentScreen === 'DAILY_GAME' && dailyChallengeRef.current) {
          const currentChallenge = dailyChallengeRef.current;
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

              const centerR = Math.round(moveResult.clearedCells.reduce((sum, c) => sum + c.r, 0) / moveResult.clearedCells.length);
              const centerC = Math.round(moveResult.clearedCells.reduce((sum, c) => sum + c.c, 0) / moveResult.clearedCells.length);
              const scoreId = Date.now();
              setFloatingScores(prev => [...prev, { id: scoreId, score: moveResult.scoreGained, r: centerR, c: centerC }]);
              setTimeout(() => setFloatingScores(prev => prev.filter(f => f.id !== scoreId)), 800);

              let splashTitle: string | undefined;
              let splashType: 'GREAT' | 'EXCELLENT' | 'SUPERB' | 'NOVA_CLEAR' | undefined;
              if (moveResult.isNovaClear) { splashTitle = 'NOVA CLEAR!'; splashType = 'NOVA_CLEAR'; }
              else if (moveResult.linesCleared === 1) { splashTitle = 'GREAT!'; splashType = 'GREAT'; }
              else if (moveResult.linesCleared === 2) { splashTitle = 'EXCELLENT!'; splashType = 'EXCELLENT'; }
              else if (moveResult.linesCleared === 3) { splashTitle = 'SUPERB!'; splashType = 'SUPERB'; }
              else if (moveResult.linesCleared >= 4) { splashTitle = 'NOVA CLEAR!'; splashType = 'NOVA_CLEAR'; }

              let splashSub = moveResult.comboCount > 1 ? `COMBO x${moveResult.comboCount}` : undefined;
              if (splashTitle && splashType) {
                const splashId = Date.now();
                setSplashOverlay({ id: splashId, text: splashTitle, subtext: splashSub });
                audio.playSplashAudio(splashType);
                setTimeout(() => setSplashOverlay(null), 1000);
              }
            }

            if (moveResult.comboCount > 1) {
              audio.playCombo(moveResult.comboCount);
              haptics.combo();
            }

            if (moveResult.isObjectiveComplete || moveResult.isGameOver) {
              const finalScore = adventureEngineRef.current.getScore();
              setDailyCompleted(moveResult.isObjectiveComplete);

              if (currentPlayer) {
                const res = await DailyChallengeService.submitResult(
                  currentPlayer,
                  currentChallenge.id,
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
        } else if (currentScreen === 'ADVENTURE_GAME' && activeLevelRef.current) {
          const currentLevel = activeLevelRef.current;
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

              const centerR = Math.round(moveResult.clearedCells.reduce((sum, c) => sum + c.r, 0) / moveResult.clearedCells.length);
              const centerC = Math.round(moveResult.clearedCells.reduce((sum, c) => sum + c.c, 0) / moveResult.clearedCells.length);
              const scoreId = Date.now();
              setFloatingScores(prev => [...prev, { id: scoreId, score: moveResult.scoreGained, r: centerR, c: centerC }]);
              setTimeout(() => setFloatingScores(prev => prev.filter(f => f.id !== scoreId)), 800);

              let splashTitle: string | undefined;
              let splashType: 'GREAT' | 'EXCELLENT' | 'SUPERB' | 'NOVA_CLEAR' | undefined;
              if (moveResult.isNovaClear) { splashTitle = 'NOVA CLEAR!'; splashType = 'NOVA_CLEAR'; }
              else if (moveResult.linesCleared === 1) { splashTitle = 'GREAT!'; splashType = 'GREAT'; }
              else if (moveResult.linesCleared === 2) { splashTitle = 'EXCELLENT!'; splashType = 'EXCELLENT'; }
              else if (moveResult.linesCleared === 3) { splashTitle = 'SUPERB!'; splashType = 'SUPERB'; }
              else if (moveResult.linesCleared >= 4) { splashTitle = 'NOVA CLEAR!'; splashType = 'NOVA_CLEAR'; }

              let splashSub = moveResult.comboCount > 1 ? `COMBO x${moveResult.comboCount}` : undefined;
              if (splashTitle && splashType) {
                const splashId = Date.now();
                setSplashOverlay({ id: splashId, text: splashTitle, subtext: splashSub });
                audio.playSplashAudio(splashType);
                setTimeout(() => setSplashOverlay(null), 1000);
              }
            }

            if (moveResult.comboCount > 1) {
              audio.playCombo(moveResult.comboCount);
              haptics.combo();
            }

            if (moveResult.isObjectiveComplete) {
              audio.playClear(3);
              haptics.clear();
              await handleLevelCompleted(currentLevel, adventureEngineRef.current.getScore(), moveResult.starsEarned);
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

              const centerR = Math.round(moveResult.clearedCells.reduce((sum, c) => sum + c.r, 0) / moveResult.clearedCells.length);
              const centerC = Math.round(moveResult.clearedCells.reduce((sum, c) => sum + c.c, 0) / moveResult.clearedCells.length);
              const scoreId = Date.now();
              setFloatingScores(prev => [...prev, { id: scoreId, score: moveResult.scoreGained, r: centerR, c: centerC }]);
              setTimeout(() => setFloatingScores(prev => prev.filter(f => f.id !== scoreId)), 800);

              let splashTitle: string | undefined;
              let splashType: 'GREAT' | 'EXCELLENT' | 'SUPERB' | 'NOVA_CLEAR' | undefined;
              if (moveResult.isNovaClear) { splashTitle = 'NOVA CLEAR!'; splashType = 'NOVA_CLEAR'; }
              else if (moveResult.linesCleared === 1) { splashTitle = 'GREAT!'; splashType = 'GREAT'; }
              else if (moveResult.linesCleared === 2) { splashTitle = 'EXCELLENT!'; splashType = 'EXCELLENT'; }
              else if (moveResult.linesCleared === 3) { splashTitle = 'SUPERB!'; splashType = 'SUPERB'; }
              else if (moveResult.linesCleared >= 4) { splashTitle = 'NOVA CLEAR!'; splashType = 'NOVA_CLEAR'; }

              let splashSub = moveResult.comboCount > 1 ? `COMBO x${moveResult.comboCount}` : undefined;
              if (splashTitle && splashType) {
                const splashId = Date.now();
                setSplashOverlay({ id: splashId, text: splashTitle, subtext: splashSub });
                audio.playSplashAudio(splashType);
                setTimeout(() => setSplashOverlay(null), 1000);
              }
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
      } else {
        // Dropped outside board or in between grid and tray (invalid drop)
        // Clean snap back to tray
        haptics.snapBack();
      }
    } catch (err) {
      console.warn('Error during piece placement release:', err);
    }
  }, [handleLevelCompleted, syncEngineState]);

  // Fast, Block-Blast-style single-touch drag interaction
  const handleStartDrag = useCallback((index: number, startX: number, startY: number) => {
    if (typeof startX !== 'number' || isNaN(startX) || typeof startY !== 'number' || isNaN(startY)) {
      return;
    }

    // Ignore redundant start calls if drag is already active
    if (activeDragIndexRef.current !== null) {
      return;
    }

    const engine = getActiveEngine();
    const piece = engine.getTray()[index];
    if (!piece) return;

    audio.playPickup();
    haptics.pickup();

    activeDragIndexRef.current = index;
    draggedPieceRef.current = piece;
    setActiveDragIndex(index);

    // Initial position calculation right at touch coordinates
    updateDragPosition(startX, startY);

    if (dragCleanupRef.current) {
      dragCleanupRef.current();
      dragCleanupRef.current = null;
    }

    const onMove = (moveEvt: any) => {
      if (moveEvt.cancelable) {
        moveEvt.preventDefault();
      }
      let pageX: number | undefined;
      let pageY: number | undefined;

      if (moveEvt.touches && moveEvt.touches.length > 0) {
        pageX = moveEvt.touches[0].pageX;
        pageY = moveEvt.touches[0].pageY;
      } else if (moveEvt.changedTouches && moveEvt.changedTouches.length > 0) {
        pageX = moveEvt.changedTouches[0].pageX;
        pageY = moveEvt.changedTouches[0].pageY;
      } else if (typeof moveEvt.pageX === 'number') {
        pageX = moveEvt.pageX;
        pageY = moveEvt.pageY;
      } else if (typeof moveEvt.clientX === 'number') {
        pageX = moveEvt.clientX;
        pageY = moveEvt.clientY;
      }

      if (typeof pageX === 'number' && !isNaN(pageX) && typeof pageY === 'number' && !isNaN(pageY)) {
        updateDragPosition(pageX, pageY);
      }
    };

    const onEnd = async (endEvt?: any) => {
      if (endEvt && endEvt.cancelable) {
        endEvt.preventDefault();
      }
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
        dragCleanupRef.current = null;
      }
      await handleReleaseDrag();
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onEnd, true);
      window.removeEventListener('pointercancel', onEnd, true);
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
      document.removeEventListener('pointercancel', onEnd, true);

      window.removeEventListener('touchmove', onMove, true);
      window.removeEventListener('touchend', onEnd, true);
      window.removeEventListener('touchcancel', onEnd, true);
      document.removeEventListener('touchmove', onMove, true);
      document.removeEventListener('touchend', onEnd, true);
      document.removeEventListener('touchcancel', onEnd, true);

      window.removeEventListener('mousemove', onMove, true);
      window.removeEventListener('mouseup', onEnd, true);
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('mouseup', onEnd, true);

      window.removeEventListener('blur', onEnd);
      dragCleanupRef.current = null;
    };

    dragCleanupRef.current = cleanup;

    // Register capture phase listeners on BOTH window and document
    window.addEventListener('pointermove', onMove, { passive: false, capture: true });
    window.addEventListener('pointerup', onEnd, { capture: true });
    window.addEventListener('pointercancel', onEnd, { capture: true });
    document.addEventListener('pointermove', onMove, { passive: false, capture: true });
    document.addEventListener('pointerup', onEnd, { capture: true });
    document.addEventListener('pointercancel', onEnd, { capture: true });

    window.addEventListener('touchmove', onMove, { passive: false, capture: true });
    window.addEventListener('touchend', onEnd, { capture: true });
    window.addEventListener('touchcancel', onEnd, { capture: true });
    document.addEventListener('touchmove', onMove, { passive: false, capture: true });
    document.addEventListener('touchend', onEnd, { capture: true });
    document.addEventListener('touchcancel', onEnd, { capture: true });

    window.addEventListener('mousemove', onMove, { capture: true });
    window.addEventListener('mouseup', onEnd, { capture: true });
    document.addEventListener('mousemove', onMove, { capture: true });
    document.addEventListener('mouseup', onEnd, { capture: true });

    window.addEventListener('blur', onEnd);
  }, [getActiveEngine, handleReleaseDrag, updateDragPosition]);

  useEffect(() => {
    return () => {
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
        dragCleanupRef.current = null;
      }
    };
  }, []);

  const activePiece = activeDragIndex !== null ? getActiveEngine().getTray()[activeDragIndex] : null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <>
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
                const best = await DailyChallengeService.getPlayerDailyBest(dailyChallenge.id);
                setDailyBestScore(best);
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
              onPause={() => setShowPauseModal(true)}
              onRestart={handleRestartGame}
            />

            {/* In-Game Objective HUD for Adventure & Daily Challenge Modes */}
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

            {screen === 'DAILY_GAME' && dailyChallenge && (
              <View style={styles.objectiveHud}>
                <Text style={styles.objectiveHudText}>
                  🎯 {dailyChallenge.title} • {ObjectiveEvaluator.getObjectiveProgress(dailyChallenge.objective, adventureEngineRef.current.getGameplayStats())}% Objective
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
              splashOverlay={splashOverlay}
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
                    left: dragLocation.x,
                    top: dragLocation.y,
                  },
                ]}
                pointerEvents="none"
              >
                <PieceComponent
                  piece={activePiece}
                  isDragging={true}
                  scale={1.0}
                  cellSize={boardLayoutRef.current ? (boardLayoutRef.current.width - 20 - (Board.SIZE - 1) * 4) / Board.SIZE : 36}
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
          board={getActiveEngine().getBoard()}
          onSelectCell={async (r, c) => {
            setShowPulseSelector(false);
            audio.playNovaClear();
            haptics.novaClear();
            const result = getActiveEngine().executePulse(r, c);
            if (result.success && result.linesCleared && result.linesCleared > 0) {
              audio.playClear(result.linesCleared);
              haptics.clear();
            }

            // Check if Pulse completed Adventure level or Daily challenge
            if (screenRef.current === 'ADVENTURE_GAME' && activeLevelRef.current) {
              if (adventureEngineRef.current.getIsLevelComplete()) {
                audio.playClear(3);
                haptics.clear();
                const levelStats = adventureEngineRef.current.getGameplayStats();
                const stars = ObjectiveEvaluator.calculateStars(activeLevelRef.current, levelStats);
                await handleLevelCompleted(activeLevelRef.current, levelStats.score, stars);
              }
            } else if (screenRef.current === 'DAILY_GAME' && dailyChallengeRef.current) {
              if (adventureEngineRef.current.getIsLevelComplete() || getActiveEngine().getStatus() === 'GAMEOVER') {
                const finalScore = adventureEngineRef.current.getScore();
                setDailyCompleted(adventureEngineRef.current.getIsLevelComplete());
                if (playerRef.current) {
                  const res = await DailyChallengeService.submitResult(
                    playerRef.current,
                    dailyChallengeRef.current.id,
                    finalScore,
                    adventureEngineRef.current.getGameplayStats().linesCleared,
                    adventureEngineRef.current.getGameplayStats().movesUsed,
                    adventureEngineRef.current.getIsLevelComplete()
                  );
                  setDailyBestScore(res.bestScore);
                  setDailyStreak(res.streakInfo);
                }
                setShowDailyResultModal(true);
              }
            }

            await syncEngineState();
          }}
          onCancel={() => setShowPulseSelector(false)}
        />

        {/* Wild Power Shape Picker Modal */}
        <WildShapePicker
          visible={showWildPicker}
          tray={getActiveEngine().getTray()}
          onSelectShape={async (newPiece, slotIndex) => {
            setShowWildPicker(false);
            audio.playNovaPower();
            haptics.novaPower();
            getActiveEngine().executeWild(slotIndex, newPiece);
            await syncEngineState();
          }}
          onCancel={() => setShowWildPicker(false)}
        />

        {/* Pause Modal */}
        <PauseModal
          visible={showPauseModal}
          modeTitle={
            screen === 'CLASSIC'
              ? 'Classic Mode'
              : screen === 'ADVENTURE_GAME'
              ? 'Adventure Mode'
              : 'Daily Challenge'
          }
          currentScore={score}
          soundEnabled={soundEnabled}
          hapticsEnabled={hapticsEnabled}
          onResume={() => setShowPauseModal(false)}
          onRestart={handleRestartGame}
          onQuit={handleQuitGame}
          onToggleSound={handleToggleSound}
          onToggleHaptics={handleToggleHaptics}
        />

          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0f17',
    touchAction: 'none',
    userSelect: 'none',
  } as any,
  gameContainer: {
    flex: 1,
    position: 'relative',
    touchAction: 'none',
    userSelect: 'none',
  } as any,
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
    zIndex: 9999,
  },
});
