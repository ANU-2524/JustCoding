import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CollaborativeCursors, { ParticipantList } from '../../components/CollaborativeCursors';

describe('CollaborativeCursors Component', () => {
  const mockParticipants = [
    { id: 'user1', username: 'Alice', color: '#FF6B6B', isActive: true },
    { id: 'user2', username: 'Bob', color: '#4ECDC4', isActive: true }
  ];

  const mockCursors = {
    'user1': { position: 100, selection: null },
    'user2': { position: 200, selection: { start: 200, end: 210 } }
  };

  describe('Cursor Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <CollaborativeCursors 
          cursors={{}} 
          participants={[]} 
          editorRef={{ current: null }}
        />
      );
      expect(container.querySelector('.collaborative-cursors')).toBeInTheDocument();
    });

    it('should render cursors for each user', () => {
      const { container } = render(
        <CollaborativeCursors 
          cursors={mockCursors} 
          participants={mockParticipants}
          editorRef={{ current: null }}
        />
      );
      
      const cursors = container.querySelectorAll('.remote-cursor');
      expect(cursors.length).toBe(2);
    });
  });
});

describe('ParticipantList Component', () => {
  const mockParticipants = [
    { id: 'user1', username: 'Alice', color: '#FF6B6B', isActive: true, isHost: true },
    { id: 'user2', username: 'Bob', color: '#4ECDC4', isActive: true, isHost: false },
    { id: 'user3', username: 'Charlie', color: '#45B7D1', isActive: false, isHost: false }
  ];

  it('should render participant count', () => {
    render(<ParticipantList participants={mockParticipants} isRecording={false} />);
    expect(screen.getByText(/Collaborators \(3\)/)).toBeInTheDocument();
  });

  it('should render all participant names', () => {
    render(<ParticipantList participants={mockParticipants} isRecording={false} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('should show host badge for host user', () => {
    render(<ParticipantList participants={mockParticipants} isRecording={false} />);
    expect(screen.getByText('Host')).toBeInTheDocument();
  });

  it('should show recording indicator when recording', () => {
    render(<ParticipantList participants={mockParticipants} isRecording={true} />);
    expect(screen.getByText('Recording')).toBeInTheDocument();
  });

  it('should not show recording indicator when not recording', () => {
    render(<ParticipantList participants={mockParticipants} isRecording={false} />);
    expect(screen.queryByText('Recording')).not.toBeInTheDocument();
  });

  it('should render participant colors', () => {
    const { container } = render(
      <ParticipantList participants={mockParticipants} isRecording={false} />
    );
    
    const colorDots = container.querySelectorAll('.participant-color');
    expect(colorDots.length).toBe(3);
  });

  it('should show active/idle status', () => {
    const { container } = render(
      <ParticipantList participants={mockParticipants} isRecording={false} />
    );
    
    const activeStatus = container.querySelectorAll('.participant-status.active');
    const idleStatus = container.querySelectorAll('.participant-status.idle');
    
    expect(activeStatus.length).toBe(2); // Alice and Bob are active
    expect(idleStatus.length).toBe(1); // Charlie is idle
  });
});
