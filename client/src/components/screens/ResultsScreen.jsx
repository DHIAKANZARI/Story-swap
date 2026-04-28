import { useMemo, useEffect, useState } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

// Floating Emoji Burst Component
const EmojiBurst = () => {
  const [emojis, setEmojis] = useState([]);
  
  useEffect(() => {
    const list = ['🎉', '📖', '✨', '🏆'];
    const bursts = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      char: list[Math.floor(Math.random() * list.length)],
      left: `${(Math.random() * 80) + 10}vw`,
      startBottom: `${Math.random() * 20}vh`,
      animationDuration: `${Math.random() * 1.5 + 1.5}s`,
      animationDelay: `${Math.random() * 0.5}s`
    }));
    setEmojis(bursts);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 10 }}>
      {emojis.map(e => (
        <div 
          key={e.id}
          className="emoji-burst"
          style={{
            left: e.left,
            bottom: e.startBottom,
            animationDuration: e.animationDuration,
            animationDelay: e.animationDelay
          }}
        >
          {e.char}
        </div>
      ))}
    </div>
  );
};

export default function ResultsScreen({ room }) {
  const results = useMemo(() => {
    const scores = {};
    Object.values(room.votes).forEach(storyId => {
      scores[storyId] = (scores[storyId] || 0) + 1;
    });

    const sortedIds = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    
    return sortedIds.map(id => ({
      id,
      score: scores[id],
      player: room.players.find(p => p.id === id) || { name: 'Unknown', avatar: '?' },
      segments: room.stories[id]
    }));
  }, [room.votes, room.players, room.stories]);

  const winner = results[0];

  return (
    <div className="center-layout fade-in" style={{ position: 'relative' }}>
      <EmojiBurst />

      <div className="results-layout fade-in-up" style={{ width: '100%', maxWidth: '800px' }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <div className="trophy-bounce" style={{ display: 'inline-flex', alignItems: 'center', justifyItems: 'center', width: '6rem', height: '6rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', border: '4px solid rgba(245, 158, 11, 0.3)', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <Trophy className="w-12 h-12" style={{ color: '#F59E0B' }} />
          </div>
          <h1 style={{ fontSize: '3.5rem', margin: '0 0 1rem 0' }}>Winner Announced!</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-body)' }}>The finest tale has been chosen.</p>
        </div>

        {winner && (
          <div className="winner-card">
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '2rem', opacity: 0.05, pointerEvents: 'none' }}>
              <Trophy style={{ width: '16rem', height: '16rem' }} />
            </div>
            
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="winner-avatar-ring">
                   <Avatar avatarId={winner.player.avatarId} size={80} />
                </div>
                <div style={{ textAlign: 'left', marginLeft: '1rem' }}>
                  <div style={{ color: '#F59E0B', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star className="w-4 h-4 fill-current" /> 1st Place
                  </div>
                  <h2 className="winner-name">Started by {winner.player.name}</h2>
                </div>
                <div style={{ marginLeft: 'auto', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '1rem 2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', lineHeight: 1 }}>{winner.score}</div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginTop: '0.25rem' }}>Votes</div>
                </div>
              </div>

              <div style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--text-header)', background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', textAlign: 'left' }}>
                {winner.segments.map((seg, idx) => {
                  return (
                    <span key={idx} className="story-segment" style={{ color: 'var(--text-header)' }}>
                      {seg.text}{' '}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {results.length > 1 && (
          <div className="scoreboard" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Medal className="w-6 h-6" style={{ color: 'var(--text-body)' }} /> Scoreboard
            </h3>
            <div>
              {results.slice(1).map((res, index) => {
                const rank = index + 2;
                let rankClass = '';
                if (rank === 2) rankClass = 'score-rank-2';
                else if (rank === 3) rankClass = 'score-rank-3';

                return (
                  <div key={res.id} className="score-row">
                    <div className={`score-rank ${rankClass}`}>#{rank}</div>
                    <div className="score-name">
                      <Avatar avatarId={res.player.avatarId} size={40} />
                      {res.player.name}
                    </div>
                    <div className="score-value">
                      {res.score} {res.score === 1 ? 'vote' : 'votes'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ color: 'var(--text-body)', fontWeight: 'bold' }}>
          Want to play again? The host can create a new room!
        </div>
      </div>
    </div>
  );
}
