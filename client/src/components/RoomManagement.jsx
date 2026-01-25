import React, { useState, useEffect } from 'react';
import { FaUsers, FaEye, FaTrash, FaLock, FaUnlock, FaCode, FaClock } from 'react-icons/fa';
import '../Style/RoomManagement.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([
    {
      roomId: 'abc123',
      createdAt: '2024-03-01T10:30:00Z',
      participants: [
        { id: 'user1', name: 'John Doe', joinedAt: '2024-03-01T10:30:00Z' },
        { id: 'user2', name: 'Jane Smith', joinedAt: '2024-03-01T10:35:00Z' }
      ],
      status: 'active',
      language: 'javascript',
      lastActivity: '2024-03-01T11:15:00Z',
      codeLength: 245,
      isLocked: false
    },
    {
      roomId: 'def456',
      createdAt: '2024-03-01T09:15:00Z',
      participants: [
        { id: 'user3', name: 'Mike Johnson', joinedAt: '2024-03-01T09:15:00Z' }
      ],
      status: 'active',
      language: 'python',
      lastActivity: '2024-03-01T10:45:00Z',
      codeLength: 156,
      isLocked: false
    },
    {
      roomId: 'ghi789',
      createdAt: '2024-02-29T16:20:00Z',
      participants: [],
      status: 'inactive',
      language: 'java',
      lastActivity: '2024-02-29T17:30:00Z',
      codeLength: 0,
      isLocked: false
    }
  ]);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRooms = rooms.filter(room => 
    statusFilter === 'all' || room.status === statusFilter
  );

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  const handleDeleteRoom = (roomId) => {
    if (confirm('Are you sure you want to delete this room?')) {
      setRooms(rooms.filter(r => r.roomId !== roomId));
    }
  };

  const handleToggleLock = (roomId) => {
    setRooms(rooms.map(r => 
      r.roomId === roomId 
        ? { ...r, isLocked: !r.isLocked }
        : r
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'locked': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTimeSince = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="room-management">
      <div className="management-header">
        <h1><FaUsers /> Room Management</h1>
        <div className="room-stats">
          <div className="stat">
            <span className="stat-number">{rooms.length}</span>
            <span className="stat-label">Total Rooms</span>
          </div>
          <div className="stat">
            <span className="stat-number">{rooms.filter(r => r.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat">
            <span className="stat-number">{rooms.reduce((sum, r) => sum + r.participants.length, 0)}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
      </div>

      <div className="management-controls">
        <div className="status-filter">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Rooms</option>
            <option value="active">Active Rooms</option>
            <option value="inactive">Inactive Rooms</option>
          </select>
        </div>
      </div>

      <div className="rooms-table">
        <div className="table-header">
          <div className="col-room">Room</div>
          <div className="col-participants">Participants</div>
          <div className="col-activity">Activity</div>
          <div className="col-status">Status</div>
          <div className="col-actions">Actions</div>
        </div>

        <div className="table-body">
          {filteredRooms.length === 0 ? (
            <div className="empty-state">
              <FaUsers className="empty-icon" />
              <h3>No rooms found</h3>
              <p>No collaborative rooms match your filter criteria</p>
            </div>
          ) : (
            filteredRooms.map(room => (
              <div key={room.roomId} className="table-row">
                <div className="col-room">
                  <div className="room-info">
                    <h4>Room #{room.roomId}</h4>
                    <p>Created {getTimeSince(room.createdAt)}</p>
                    <div className="room-meta">
                      <span className="language-tag">{room.language}</span>
                      {room.isLocked && <FaLock className="lock-icon" />}
                    </div>
                  </div>
                </div>

                <div className="col-participants">
                  <div className="participants-info">
                    <span className="participant-count">
                      {room.participants.length} users
                    </span>
                    <div className="participant-list">
                      {room.participants.slice(0, 2).map(p => (
                        <span key={p.id} className="participant-name">
                          {p.name}
                        </span>
                      ))}
                      {room.participants.length > 2 && (
                        <span className="more-participants">
                          +{room.participants.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-activity">
                  <div className="activity-info">
                    <div className="activity-item">
                      <FaClock />
                      <span>Last: {getTimeSince(room.lastActivity)}</span>
                    </div>
                    <div className="activity-item">
                      <FaCode />
                      <span>{room.codeLength} chars</span>
                    </div>
                  </div>
                </div>

                <div className="col-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(room.status) }}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="col-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => handleViewRoom(room)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-btn lock"
                    onClick={() => handleToggleLock(room.roomId)}
                    title={room.isLocked ? 'Unlock Room' : 'Lock Room'}
                  >
                    {room.isLocked ? <FaUnlock /> : <FaLock />}
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteRoom(room.roomId)}
                    title="Delete Room"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showRoomModal && selectedRoom && (
        <div className="room-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Room Details - #{selectedRoom.roomId}</h2>
              <button onClick={() => setShowRoomModal(false)} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="room-detail-section">
                <h3>Room Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Room ID:</label>
                    <span>{selectedRoom.roomId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Language:</label>
                    <span>{selectedRoom.language}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span style={{ color: getStatusColor(selectedRoom.status) }}>
                      {selectedRoom.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Locked:</label>
                    <span>{selectedRoom.isLocked ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="room-detail-section">
                <h3>Activity</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatTime(selectedRoom.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Activity:</label>
                    <span>{formatTime(selectedRoom.lastActivity)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Code Length:</label>
                    <span>{selectedRoom.codeLength} characters</span>
                  </div>
                </div>
              </div>

              <div className="room-detail-section">
                <h3>Participants ({selectedRoom.participants.length})</h3>
                {selectedRoom.participants.length === 0 ? (
                  <p>No participants in this room</p>
                ) : (
                  <div className="participants-detail">
                    {selectedRoom.participants.map(participant => (
                      <div key={participant.id} className="participant-detail">
                        <span className="participant-name">{participant.name}</span>
                        <span className="participant-joined">
                          Joined: {formatTime(participant.joinedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;