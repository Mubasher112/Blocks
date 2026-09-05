import React from 'react';
import { GameStats } from '../game/GameEngine';
import { Play, Trophy, Flame, Grid, Lock } from 'lucide-react';

interface MainMenuProps {
  stats: GameStats;
  onPlay: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ stats, onPlay }) => {
  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">
          BLOCK <span className="nova-accent">NOVA</span>
        </h1>
        <p className="menu-subtitle">Strategic Block Puzzle Experience</p>
      </div>

      <div className="stats-card">
        <div className="stat-item">
          <Trophy className="stat-icon amber" size={24} />
          <div className="stat-info">
            <span className="stat-label">HIGH SCORE</span>
            <span className="stat-value">{stats.highScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <Flame className="stat-icon magenta" size={24} />
          <div className="stat-info">
            <span className="stat-label">LONGEST COMBO</span>
            <span className="stat-value">{stats.longestCombo}x</span>
          </div>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <Grid className="stat-icon cyan" size={24} />
          <div className="stat-info">
            <span className="stat-label">LINES CLEARED</span>
            <span className="stat-value">{stats.totalLinesCleared.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button className="play-btn" onClick={onPlay}>
        <Play size={28} fill="currentColor" />
        PLAY CLASSIC
      </button>

      <div className="modes-section">
        <h3 className="section-title">UPCOMING MODES</h3>
        <div className="modes-grid">
          <div className="mode-card disabled">
            <div className="mode-header">
              <span className="mode-name">Daily Nova</span>
              <Lock size={14} />
            </div>
            <span className="mode-desc">Daily seeded puzzle challenge</span>
          </div>

          <div className="mode-card disabled">
            <div className="mode-header">
              <span className="mode-name">Adventure</span>
              <Lock size={14} />
            </div>
            <span className="mode-desc">Journey through cosmic sectors</span>
          </div>

          <div className="mode-card disabled">
            <div className="mode-header">
              <span className="mode-name">Rush Mode</span>
              <Lock size={14} />
            </div>
            <span className="mode-desc">Timed high-intensity survival</span>
          </div>
        </div>
      </div>

      <style>{`
        .menu-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-around;
          padding: 30px 24px;
          text-align: center;
        }

        .menu-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: 2px;
          color: #ffffff;
        }

        .nova-accent {
          color: var(--accent-cyan);
          text-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
        }

        .menu-subtitle {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: 4px;
          font-weight: 600;
        }

        .stats-card {
          width: 100%;
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 20px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          backdrop-filter: blur(10px);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .stat-icon.amber { color: var(--accent-amber); }
        .stat-icon.magenta { color: var(--accent-magenta); }
        .stat-icon.cyan { color: var(--accent-cyan); }

        .stat-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .stat-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .stat-value {
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
        }

        .stat-divider {
          width: 1px;
          height: 30px;
          background: var(--panel-border);
        }

        .play-btn {
          width: 100%;
          padding: 18px;
          background: linear-gradient(135deg, #00f0ff 0%, #0072ff 100%);
          color: #0d0f17;
          border-radius: 18px;
          font-size: 1.25rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 8px 25px rgba(0, 240, 255, 0.4);
          animation: pulseGlow 3s infinite;
        }

        .play-btn:hover {
          filter: brightness(1.1);
        }

        .modes-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .section-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 1px;
          text-align: left;
        }

        .modes-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mode-card.disabled {
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed var(--panel-border);
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          opacity: 0.6;
        }

        .mode-header {
          display: flex;
          justify-content: space-between;
          width: 100%;
          align-items: center;
          color: var(--text-main);
          font-weight: 700;
          font-size: 0.9rem;
        }

        .mode-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};
