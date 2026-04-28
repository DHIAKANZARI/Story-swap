import { useState, useEffect, useRef } from 'react';
import { Heart, CheckCircle } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

// StoryCard wrapper to handle intersection observer logic per card
function ObeservedStoryCard({ children, storyId, isVoted, handleVote, votedFor }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (cardRef.current) {
        observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`story-card ${isVoted ? 'voted' : ''} ${isVisible ? 'story-card-scroll-visible' : 'story-card-scroll-hidden'}`}
    >
      {children}
    </div>
  );
}

export default function ReadingVotingScreen({ room, socket }) {
  const [votedFor, setVotedFor] = useState(room.votes[socket.id] || null);

  const handleVote = (storyId) => {
    if (votedFor) return; 
    setVotedFor(storyId);
    socket.emit('cast-vote', { votedForId: storyId });
  };

  const stories = Object.entries(room.stories);

  // Re-use hashing from Avatar to sync the border gradient color
  const getHue = (str) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 360;
  };

  const generateBorderGradient = (name) => {
    const hue = getHue(name);
    return `linear-gradient(to bottom, hsl(${hue}, 80%, 65%), transparent)`;
  };

  return (
    <div className="reading-layout fade-in-up">
      
      <div className="reading-header">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Reading Time!</h2>
        <p>Read the glorious creations and vote for your favourite.</p>
        {votedFor && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: '#10B981', fontWeight: 'bold' }}>
            <CheckCircle className="w-5 h-5" /> Vote submitted, waiting for others...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {stories.map(([storyId, segments]) => {
          const isMyStory = storyId === socket.id;
          const initialAuthor = room.players.find(p => p.id === storyId) || { name: 'Unknown', avatar: '?' };
          const isVoted = votedFor === storyId;

          return (
            <ObeservedStoryCard key={storyId} storyId={storyId} isVoted={isVoted}>
              {/* Story Header */}
              <div className="story-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Avatar avatarId={initialAuthor.avatarId} size={48} />
                  <span style={{ fontWeight: 'bold', color: 'var(--text-header)' }}>Started by {initialAuthor.name}</span>
                </div>
                
                {/* Vote Button */}
                {!isMyStory ? (
                  <button 
                    disabled={votedFor !== null}
                    onClick={() => handleVote(storyId)}
                    className={`btn ${isVoted ? 'btn-primary' : (votedFor !== null ? 'btn-secondary' : 'btn-ghost')}`}
                    style={{ opacity: votedFor !== null && !isVoted ? 0.5 : 1 }}
                  >
                    <Heart className={`w-5 h-5 ${isVoted ? 'fill-current' : ''}`} /> 
                    {isVoted ? 'Voted!' : 'Vote'}
                  </button>
                ) : (
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text-body)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Your Story
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div className="story-card-body">
                {segments.map((seg, idx) => {
                  const playerHue = getHue(seg.authorName || '?');
                  const bgColor = `hsl(${playerHue}, 80%, 65%)`;

                  return (
                    <div key={idx} className="story-block" style={{ borderLeft: '3px solid transparent', borderImage: `${generateBorderGradient(seg.authorName)} 1` }}>
                      <div className="story-author-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Avatar avatarId={seg.authorAvatarId} size={48} />
                        <span style={{ fontSize: '1rem' }}>{seg.authorName} 🖊️</span>
                      </div>
                      <div style={{ color: 'var(--text-body)' }}>
                        {seg.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ObeservedStoryCard>
          );
        })}
      </div>

    </div>
  );
}
