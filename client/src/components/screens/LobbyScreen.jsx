import { useState } from 'react';
import { Copy, CheckCircle, Settings, Play } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export default function LobbyScreen({ room, socket }) {
  const [copied, setCopied] = useState(false);
  const isHost = room.host === socket.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSetting = (key, value) => {
    if (!isHost) return;
    socket.emit('update-settings', { [key]: value });
  };

  const startGame = () => {
    socket.emit('start-game');
  };

  const renderPlayerCells = () => {
    const cells = [];
    for (let i = 0; i < room.settings.maxPlayers; i++) {
        const player = room.players[i];
        if (player) {
            cells.push(
                <div key={player.id} className="player-chip player-join-anim" style={{ animationDelay: `${i * 0.1}s` }}>
                  <Avatar avatarId={player.avatarId} size={48} />
                  <span className="player-name">{player.name}</span>
                  {room.host === player.id && (
                    <span className="host-badge">Host</span>
                  )}
                </div>
            );
        } else {
            cells.push(
                <div key={`empty-${i}`} className="player-chip empty-player">
                  <div className="empty-avatar">?</div>
                  <span className="player-name">Waiting...</span>
                </div>
            );
        }
    }
    return cells;
  };

  return (
    <div className="center-layout fade-in">
      <div className="lobby-card card">
        <h2 style={{ fontSize: '2rem' }}>Waiting for Players</h2>
        
        {/* Room Code Display */}
        <div className="room-code-display" style={{ position: 'relative', cursor: 'pointer' }} onClick={handleCopy} title="Click to copy">
          <span className="code shimmer-text">{room.code}</span>
          {copied ? (
             <CheckCircle className="w-6 h-6" style={{ color: '#10B981' }} />
          ) : (
             <Copy className="w-6 h-6" style={{ color: 'var(--text-body)' }} />
          )}
        </div>

        {/* Players Grid */}
        <div className="players-grid">
            {renderPlayerCells()}
        </div>

        {/* Settings Panel */}
        <div className="lobby-settings">
            <div className="settings-row">
                <span className="settings-label">
                  <Settings className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} />
                  Number of Rounds
                </span>
                <div className="btn-group">
                  {[3, 5, 7].map(num => (
                    <button 
                      key={num}
                      disabled={!isHost}
                      className={`btn ${room.settings.rounds === num ? 'active' : 'btn-secondary'}`}
                      onClick={() => updateSetting('rounds', num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
            </div>

            <div className="settings-row">
                <span className="settings-label">Time Limit (seconds)</span>
                <div className="btn-group">
                  {[30, 45, 60, 90].map(time => (
                    <button 
                      key={time}
                      disabled={!isHost}
                      className={`btn ${room.settings.timeLimit === time ? 'active' : 'btn-secondary'}`}
                      onClick={() => updateSetting('timeLimit', time)}
                    >
                      {time}s
                    </button>
                  ))}
                </div>
            </div>
        </div>

        {/* Start Game */}
        {isHost ? (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={startGame}
            disabled={room.players.length < 2}
            title={room.players.length < 2 ? "Need at least 2 players to start" : ""}
          >
            Start Game <Play className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <div className="waiting-dots-container">
            Waiting for host to start
            <div className="waiting-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
