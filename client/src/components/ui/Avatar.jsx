import React from 'react';
import { AVATARS } from '../../avatars';

export function Avatar({ avatarId, size = 40, active = false, className, style }) {
  // Default to first avatar if not found
  const avatar = AVATARS.find(a => a.id === Number(avatarId)) || AVATARS[0];
  
  const glowShadow = active ? '0 0 0 3px #7C3AED, 0 0 16px rgba(124, 58, 237, 0.5)' : style?.boxShadow || 'none';

  return (
    <div 
      className={`player-avatar ${active ? 'avatar-active' : ''} ${className || ''}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        boxShadow: glowShadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1A1A2E', // fallback bg
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: avatar.svg }}
    />
  );
}
