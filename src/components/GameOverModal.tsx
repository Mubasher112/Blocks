import React from 'react';
import { GameStats } from '../game/GameEngine';
import { RotateCcw, Home, Trophy, Award } from 'lucide-react';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  stats: GameStats;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHighScore,
  stats,
  onPlayAgain,
  onHome,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {isNewHighScore ? (
          <div className="new-best-badge">
            <Award size={20} />
            <span>NEW BEST SCORE!</span>
          </div>
        ) : (
          <span className="modal-subtitle">NO MORE MOVES</span>
        )}

        <h2 className="modal-title">GAME OVER</h2>

        <div className="final-score-box">
          <span className="final-score-label">FINAL SCORE</span>
          <span className="final-score-value">{score.toLocaleString()}</span>
        </div>

        <div className="stats-summary-grid">
          <div className="summary-item">
            <Trophy className="summary-icon amber" size={18} />
            <div className="summary-details">
              <span className="summary-label">BEST</span>
              <span className="summary-value">{highScore.toLocaleString()}</span>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-details">
              <span className="summary-label">BLOCKS PLACED</span>
              <span className="summary-value">{stats.totalBlocksPlaced}</span>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-details">
              <span className="summary-label">LINES CLEARED</span>
              <span className="summary-value">{stats.totalLinesCleared}</span>
            </div>
          </div>

          <div className="summary-item">
            <div className="summary-details">
              <span className="summary-label">LONGEST COMBO</span>
              <span className="summary-value">{stats.longestCombo}x</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-btn secondary" onClick={onHome}>
            <Home size={20} />
            HOME
          </button>
          <button className="modal-btn primary" onClick={onPlayAgain}>
            <RotateCcw size={20} />
            PLAY AGAIN
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: absolute;
          inset: 0;
          background: rgba(13, 15, 23, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 100;
          animation: popIn 0.25s ease-out;
        }

        .modal-card {
          width: 100%;
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 24px;
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .new-best-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #ffb800 0%, #ff6b00 100%);
          color: #0d0f17;
          font-weight: 900;
          font-size: 0.85rem;
          padding: 6px 14px;
          border-radius: 20px;
          animation: pulseGlow 2s infinite;
        }

        .modal-subtitle {
          color: var(--accent-magenta);
          font-weight: 800;
          font-size: 0.85rem;
          letter-spacing: 1.5px;
        }

        .modal-title {
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: 1px;
          color: #ffffff;
        }

        .final-score-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--panel-border);
          padding: 14px 30px;
          border-radius: 16px;
          width: 100%;
        }

        .final-score-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 1px;
        }

        .final-score-value {
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--accent-cyan);
        }

        .stats-summary-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .summary-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--panel-border);
          padding: 10px 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-icon.amber { color: var(--accent-amber); }

        .summary-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .summary-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .summary-value {
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          width: 100%;
          margin-top: 8px;
        }

        .modal-btn {
          flex: 1;
          padding: 14px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .modal-btn.primary {
          background: linear-gradient(135deg, #00f0ff 0%, #0072ff 100%);
          color: #0d0f17;
          box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
        }

        .modal-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid var(--panel-border);
        }
      `}</style>
    </div>
  );
};
