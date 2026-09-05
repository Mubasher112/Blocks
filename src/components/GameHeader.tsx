import React from 'react';
import { Volume2, VolumeX, Pause, RefreshCw } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  highScore: number;
  comboCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  highScore,
  comboCount,
  soundEnabled,
  onToggleSound,
  onPause,
  onRestart,
}) => {
  return (
    <header className="header-container">
      <div className="header-top">
        <h1 className="logo-title">
          BLOCK <span className="nova-accent">NOVA</span>
        </h1>
        <div className="header-actions">
          <button className="icon-btn" onClick={onToggleSound} title="Toggle Sound">
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button className="icon-btn" onClick={onRestart} title="Restart Game">
            <RefreshCw size={20} />
          </button>
          <button className="icon-btn" onClick={onPause} title="Pause">
            <Pause size={20} />
          </button>
        </div>
      </div>

      <div className="score-panel">
        <div className="score-box">
          <span className="score-label">SCORE</span>
          <span className="score-value">{score.toLocaleString()}</span>
        </div>

        {comboCount > 1 && (
          <div className="combo-badge">
            <span className="combo-fire">🔥</span>
            <span className="combo-text">{comboCount}x COMBO!</span>
          </div>
        )}

        <div className="score-box align-right">
          <span className="score-label">BEST</span>
          <span className="score-value highlight">{highScore.toLocaleString()}</span>
        </div>
      </div>

      <style>{`
        .header-container {
          padding: 16px 20px 8px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-title {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 1px;
          color: #ffffff;
        }

        .nova-accent {
          color: var(--accent-cyan);
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          color: var(--text-main);
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .score-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          padding: 12px 18px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .score-box {
          display: flex;
          flex-direction: column;
        }

        .score-box.align-right {
          align-items: flex-end;
        }

        .score-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.5px;
        }

        .score-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #ffffff;
        }

        .score-value.highlight {
          color: var(--accent-amber);
        }

        .combo-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #ff007f 0%, #ff6b00 100%);
          padding: 6px 12px;
          border-radius: 20px;
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 0 12px rgba(255, 0, 127, 0.5);
        }

        .combo-fire {
          font-size: 0.9rem;
        }

        .combo-text {
          font-size: 0.85rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.5px;
        }
      `}</style>
    </header>
  );
};
