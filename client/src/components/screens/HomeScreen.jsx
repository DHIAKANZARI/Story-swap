import { useState, useEffect } from 'react';
import { Users, PenTool } from 'lucide-react';
import { AVATARS } from '../../avatars';

export default function HomeScreen({ onJoin, onCreate }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [avatarId, setAvatarId] = useState(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('storySwap_avatarId');
    if (savedAvatar) {
      setAvatarId(Number(savedAvatar));
    } else {
      // randomly assign one initially if desired, or let them pick
    }
  }, []);

  const handleSelect = (id) => {
    setAvatarId(id);
    localStorage.setItem('storySwap_avatarId', id.toString());
  };

  const isReady = name.trim().length > 0 && avatarId !== null;

  return (
    <div className="center-layout">
      <div className="card home-card fade-in-up" autoFocus style={{ maxWidth: '560px', padding: '2rem' }}>
        <div className="home-title" style={{ marginBottom: '1.5rem' }}>
          <PenTool className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-body)' }} />
          <h1 style={{ fontSize: '2rem' }}>Story Swap</h1>
          <p>Write together, laugh together.</p>
        </div>
        
        <div className="home-section" style={{ marginTop: '0' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="settings-label">Your Name</label>
            <input 
              type="text" 
              maxLength={12}
              className="form-input"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
             <label className="settings-label">Choose Avatar</label>
             <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: '1rem',
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '0.5rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-card)'
             }}>
                {AVATARS.map(avatar => {
                   const isSelected = avatarId === avatar.id;
                   return (
                     <div 
                        key={avatar.id}
                        onClick={() => handleSelect(avatar.id)}
                        style={{
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           cursor: 'pointer',
                           opacity: isSelected ? 1 : 0.6,
                           transition: 'all 0.2s',
                           transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                        }}
                     >
                        <div 
                           dangerouslySetInnerHTML={{ __html: avatar.svg }}
                           style={{ 
                              width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden',
                              boxShadow: isSelected ? '0 0 0 3px #7C3AED, 0 0 16px rgba(124,58,237,0.8)' : 'none',
                              marginBottom: '0.5rem', background: '#1A1A2E'
                           }}
                        />
                        <div style={{ fontSize: '0.7rem', fontWeight: isSelected ? 'bold' : 'normal', textAlign: 'center', color: isSelected ? 'var(--text-header)' : 'var(--text-body)' }}>
                           {avatar.name}
                        </div>
                     </div>
                   )
                })}
             </div>
          </div>

          <div>
            <button 
              disabled={!isReady}
              onClick={() => onCreate(name, avatarId)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <Users className="w-5 h-5" />
              Host a New Game
            </button>

            <div style={{ borderTop: '1px solid var(--border-card)', margin: '1.5rem 0', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-card)', padding: '0 1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-body)', textTransform: 'uppercase' }}>Or Join</span>
            </div>

            <div className="home-join-row">
              <input 
                type="text" 
                maxLength={4}
                className="form-input"
                style={{ textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase', flex: 1 }}
                placeholder="CODE"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
              <button 
                disabled={!isReady || code.length !== 4}
                onClick={() => onJoin(code, name, avatarId)}
                className="btn btn-secondary"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
