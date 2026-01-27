/**
 * Collaborative Cursors Component
 * Displays remote user cursors in the editor
 */

import React from 'react';
import '../Style/CollaborativeCursors.css';

const CollaborativeCursors = ({ cursors, participants, editorRef }) => {
  // Get participant info by ID
  const getParticipant = (userId) => {
    return participants.find(p => p.id === userId) || { 
      username: 'Unknown', 
      color: '#888' 
    };
  };

  // Calculate cursor position in editor
  const getCursorStyle = (position) => {
    if (!editorRef?.current) {
return { display: 'none' };
}
    
    // This would need to be adapted based on your editor implementation
    // For Monaco editor or CodeMirror, you'd use their APIs
    return {
      left: `${(position % 80) * 8}px`, // Approximate character width
      top: `${Math.floor(position / 80) * 20}px` // Approximate line height
    };
  };

  return (
    <div className="collaborative-cursors">
      {Object.entries(cursors).map(([userId, cursor]) => {
        const participant = getParticipant(userId);
        
        return (
          <div
            key={userId}
            className="remote-cursor"
            style={{
              ...getCursorStyle(cursor.position),
              '--cursor-color': participant.color
            }}
          >
            <div className="cursor-caret" />
            <div 
              className="cursor-label"
              style={{ backgroundColor: participant.color }}
            >
              {participant.username}
            </div>
            
            {/* Selection highlight */}
            {cursor.selection && (
              <div 
                className="cursor-selection"
                style={{
                  backgroundColor: `${participant.color}33`,
                  width: `${(cursor.selection.end - cursor.selection.start) * 8}px`
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Participant list sidebar
export const ParticipantList = ({ participants, isRecording }) => {
  return (
    <div className="participant-list">
      <div className="participant-header">
        <h4>Collaborators ({participants.length})</h4>
        {isRecording && (
          <span className="recording-indicator">
            <span className="recording-dot" />
            Recording
          </span>
        )}
      </div>
      
      <ul className="participant-items">
        {participants.map((participant) => (
          <li key={participant.id} className="participant-item">
            <span 
              className="participant-color"
              style={{ backgroundColor: participant.color }}
            />
            <span className="participant-name">
              {participant.username}
              {participant.isHost && <span className="host-badge">Host</span>}
            </span>
            <span className={`participant-status ${participant.isActive ? 'active' : 'idle'}`} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollaborativeCursors;
