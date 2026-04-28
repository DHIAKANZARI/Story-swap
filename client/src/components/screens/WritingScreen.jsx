import { useState, useEffect, useRef } from 'react';
import { Send, Clock } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export default function WritingScreen({ room, socket, timeRemaining, currentStorySegments, hasSubmitted }) {
  const [text, setText] = useState('');
  const [ripples, setRipples] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    setText('');
  }, [currentStorySegments, room.currentRound]);

  const handleSubmit = () => {
    if (hasSubmitted) return;
    socket.emit('submit-text', { text });
  };

  const handleKeyDown = (e) => {
    if (!textareaRef.current) return;
    // mock cursor pos
    const rect = textareaRef.current.getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;
    
    setRipples(r => [...r, { id: Date.now() + Math.random(), x, y }]);
    setTimeout(() => {
      setRipples(r => r.slice(1));
    }, 400);
  };

  const maxTime = room.settings.timeLimit;
  const progressPct = Math.max(0, (timeRemaining / maxTime) * 100);
  
  let timerClass = '';
  if (timeRemaining <= 10) timerClass = 'danger';
  else if (timeRemaining <= 30) timerClass = 'warning';

  // Dynamic box-shadow interpolation
  const shadowColor = timeRemaining <= 10 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(124, 58, 237, 0.5)';
  const shadowIntensity = timeRemaining <= 10 ? 15 : 5;

  return (
    <div className="writing-layout fade-in-up">
      
      {/* Header Info */}
      <div className="writing-topbar">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-body)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Round</span>
          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{room.currentRound} <span style={{ color: 'var(--text-body)' }}>/ {room.settings.rounds}</span></span>
        </div>

        {/* Mock Live Typing Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
          {room.players.filter(p => p.id !== socket.id).map(p => {
             // Mock some are typing, some aren't (pseudo random based on ID length or just all idle as fallback)
             const isTyping = Math.random() > 0.5; // Since we can't touch backend, randomly simulate
             return (
               <div key={p.id} style={{ position: 'relative' }}>
                 <Avatar avatarId={p.avatarId} size={28} />
                 <div style={{
                   position: 'absolute', bottom: -2, right: -2,
                   width: '10px', height: '10px', borderRadius: '50%',
                   background: isTyping ? '#10B981' : '#6B7280',
                   border: '2px solid var(--bg-card)',
                   animation: isTyping ? 'pulse-dots 1s infinite' : 'none'
                 }}/>
               </div>
             )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div className={`writing-timer ${timerClass}`}>
            <Clock className="w-6 h-6" />
            {timeRemaining}s
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="timer-bar-container">
        <div 
          className={`timer-bar ${timerClass}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Story Context */}
      {currentStorySegments && currentStorySegments.length > 0 && (
        <div className="story-context">
          {currentStorySegments.map((seg, idx) => {
            return (
              <span key={idx} className="story-segment" style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}>
                {seg.text}{' '}
              </span>
            );
          })}
        </div>
      )}

      {/* Input Area */}
      <div className="writing-main" style={{ boxShadow: !hasSubmitted ? `0 0 ${shadowIntensity}px ${shadowColor}` : 'none' }}>
        {hasSubmitted ? (
          <div className="submitted-view">
            <div style={{ width: '4rem', height: '4rem', background: 'rgba(14, 207, 207, 0.1)', color: 'var(--accent-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Send className="w-8 h-8" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-header)', marginBottom: '0.5rem' }}>Submitted!</h3>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-body)' }}>Waiting for other players...</p>
            <div className="waiting-dots-container">
              <div className="waiting-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
              {ripples.map(r => (
                <div key={r.id} className="ink-ripple" style={{ left: r.x, top: r.y, width: 40, height: 40 }} />
              ))}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Continue the story here..."
                className="textarea-styled"
                autoFocus
                style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2 }}
              />
            </div>
            
            <div className="writing-bottombar">
              <span className="char-count">
                {text.length} chars
              </span>
              <button
                onClick={handleSubmit}
                className={`btn ${timeRemaining <= 10 ? 'btn-primary btn-pulse' : 'btn-ghost'}`}
                style={{ zIndex: 10 }}
              >
                Submit Early <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
