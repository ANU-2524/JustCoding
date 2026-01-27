import React, { useState, useEffect } from 'react';
import { FaUsers, FaEye, FaTrash, FaLock, FaUnlock, FaCode, FaClock, FaSearch, FaFilter, FaChartLine, FaGlobe, FaUserFriends, FaPlay, FaStop } from 'react-icons/fa';
import '../Style/RoomManagement.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([
    {
      roomId: 'abc123',
      createdAt: '2024-03-01T10:30:00Z',
      participants: [
        { id: 'user1', name: 'John Doe', joinedAt: '2024-03-01T10:30:00Z', avatar: 'JD', status: 'active' },
        { id: 'user2', name: 'Jane Smith', joinedAt: '2024-03-01T10:35:00Z', avatar: 'JS', status: 'active' },
        { id: 'user3', name: 'Alex Wilson', joinedAt: '2024-03-01T10:40:00Z', avatar: 'AW', status: 'idle' }
      ],
      status: 'active',
      language: 'javascript',
      lastActivity: '2024-03-01T11:15:00Z',
      codeLength: 1245,
      isLocked: false,
      region: 'US-East',
      theme: 'dark',
      linesOfCode: 45
    },
    {
      roomId: 'def456',
      createdAt: '2024-03-01T09:15:00Z',
      participants: [
        { id: 'user4', name: 'Mike Johnson', joinedAt: '2024-03-01T09:15:00Z', avatar: 'MJ', status: 'active' },
        { id: 'user5', name: 'Sarah Davis', joinedAt: '2024-03-01T09:20:00Z', avatar: 'SD', status: 'active' }
      ],
      status: 'active',
      language: 'python',
      lastActivity: '2024-03-01T10:45:00Z',
      codeLength: 856,
      isLocked: false,
      region: 'EU-West',
      theme: 'light',
      linesOfCode: 32
    },
    {
      roomId: 'ghi789',
      createdAt: '2024-02-29T16:20:00Z',
      participants: [],
      status: 'inactive',
      language: 'java',
      lastActivity: '2024-02-29T17:30:00Z',
      codeLength: 0,
      isLocked: false,
      region: 'Asia-Pacific',
      theme: 'dark',
      linesOfCode: 0
    },
    {
      roomId: 'jkl012',
      createdAt: '2024-03-01T14:00:00Z',
      participants: [
        { id: 'user6', name: 'Emma Brown', joinedAt: '2024-03-01T14:00:00Z', avatar: 'EB', status: 'active' },
        { id: 'user7', name: 'David Lee', joinedAt: '2024-03-01T14:05:00Z', avatar: 'DL', status: 'active' },
        { id: 'user8', name: 'Lisa Wang', joinedAt: '2024-03-01T14:10:00Z', avatar: 'LW', status: 'idle' },
        { id: 'user9', name: 'Tom Garcia', joinedAt: '2024-03-01T14:15:00Z', avatar: 'TG', status: 'active' }
      ],
      status: 'active',
      language: 'typescript',
      lastActivity: '2024-03-01T14:30:00Z',
      codeLength: 2100,
      isLocked: true,
      region: 'US-West',
      theme: 'dark',
      linesOfCode: 78
    }
  ]);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [viewMode, setViewMode] = useState('grid'); // grid or table

  const filteredRooms = rooms
    .filter(room => {
      const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
      const matchesSearch = room.roomId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'participants':
          return b.participants.length - a.participants.length;
        case 'activity':
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return new Date(b.lastActivity) - new Date(a.lastActivity);
      }
    });

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  };

  const handleDeleteRoom = (roomId) => {
    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
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

  const handleKickUser = (roomId, userId) => {
    if (confirm('Kick this user from the room?')) {
      setRooms(rooms.map(r => 
        r.roomId === roomId 
          ? { ...r, participants: r.participants.filter(p => p.id !== userId) }
          : r
      ));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'locked': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#ed8b00',
      typescript: '#3178c6',
      cpp: '#00599c',
      go: '#00add8'
    };
    return colors[language] || '#6b7280';
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
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const totalUsers = rooms.reduce((sum, r) => sum + r.participants.length, 0);
  const activeRooms = rooms.filter(r => r.status === 'active').length;
  const totalCodeLines = rooms.reduce((sum, r) => sum + r.linesOfCode, 0);

  return (
    <div className="room-management">
      <div className="management-header">
        <div className="header-content">
          <h1><FaUsers className="header-icon" /> Room Management Dashboard</h1>
          <p>Monitor and manage all collaborative coding rooms</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon active">
              <FaPlay />
            </div>
            <div className="stat-info">
              <span className="stat-number">{activeRooms}</span>
              <span className="stat-label">Active Rooms</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon users">
              <FaUserFriends />
            </div>
            <div className="stat-info">
              <span className="stat-number">{totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon code">
              <FaCode />
            </div>
            <div className="stat-info">
              <span className="stat-number">{totalCodeLines}</span>
              <span className="stat-label">Lines of Code</span>
            </div>
          </div>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search rooms, languages, or users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="filter-group">
            <FaChartLine className="filter-icon" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="activity">Last Activity</option>
              <option value="participants">Most Users</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
          
          <div className="view-toggle">
            <button 
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button 
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="rooms-grid">
          {filteredRooms.length === 0 ? (
            <div className="empty-state">
              <FaUsers className="empty-icon" />
              <h3>No rooms found</h3>
              <p>No collaborative rooms match your search criteria</p>
            </div>
          ) : (
            filteredRooms.map(room => (
              <div key={room.roomId} className={`room-card ${room.status}`}>
                <div className="room-card-header">
                  <div className="room-id">
                    <span className="room-hash">#</span>
                    {room.roomId}
                  </div>
                  <div className="room-status">
                    <span 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(room.status) }}
                    />
                    {room.isLocked && <FaLock className="lock-indicator" />}
                  </div>
                </div>
                
                <div className="room-language">
                  <div 
                    className="language-badge"
                    style={{ backgroundColor: getLanguageColor(room.language) }}
                  >
                    {room.language}
                  </div>
                  <span className="region-tag">
                    <FaGlobe /> {room.region}
                  </span>
                </div>
                
                <div className="room-participants">
                  <div className="participants-header">
                    <FaUsers /> {room.participants.length} participants
                  </div>
                  <div className="participants-avatars">
                    {room.participants.slice(0, 4).map(participant => (
                      <div 
                        key={participant.id} 
                        className={`participant-avatar ${participant.status}`}
                        title={participant.name}
                      >
                        {participant.avatar}
                      </div>
                    ))}
                    {room.participants.length > 4 && (
                      <div className="more-participants">
                        +{room.participants.length - 4}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="room-stats">
                  <div className="stat">
                    <FaCode className="stat-icon" />
                    <span>{room.linesOfCode} lines</span>
                  </div>
                  <div className="stat">
                    <FaClock className="stat-icon" />
                    <span>{getTimeSince(room.lastActivity)}</span>
                  </div>
                </div>
                
                <div className="room-actions">
                  <button 
                    className="action-btn primary"
                    onClick={() => handleViewRoom(room)}
                    title="View Details"
                  >
                    <FaEye /> View
                  </button>
                  <button 
                    className="action-btn warning"
                    onClick={() => handleToggleLock(room.roomId)}
                    title={room.isLocked ? 'Unlock Room' : 'Lock Room'}
                  >
                    {room.isLocked ? <FaUnlock /> : <FaLock />}
                  </button>
                  <button 
                    className="action-btn danger"
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
      ) : (
        <div className="rooms-table">
          <div className="table-header">
            <div className="col-room">Room</div>
            <div className="col-participants">Participants</div>
            <div className="col-activity">Activity</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="table-body">
            {filteredRooms.map(room => (
              <div key={room.roomId} className="table-row">
                <div className="col-room">
                  <div className="room-info">
                    <h4>#{room.roomId}</h4>
                    <div className="room-meta">
                      <span 
                        className="language-tag"
                        style={{ backgroundColor: getLanguageColor(room.language) }}
                      >
                        {room.language}
                      </span>
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
                      <span>{getTimeSince(room.lastActivity)}</span>
                    </div>
                    <div className="activity-item">
                      <FaCode />
                      <span>{room.linesOfCode} lines</span>
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
            ))}
          </div>
        </div>
      )}

      {showRoomModal && selectedRoom && (
        <div className="room-modal">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <h2>Room #{selectedRoom.roomId}</h2>
                <div className="room-badges">
                  <span 
                    className="language-badge"
                    style={{ backgroundColor: getLanguageColor(selectedRoom.language) }}
                  >
                    {selectedRoom.language}
                  </span>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(selectedRoom.status) }}
                  >
                    {selectedRoom.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowRoomModal(false)} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-section">
                <h3><FaCode /> Room Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Room ID:</label>
                    <span>{selectedRoom.roomId}</span>
                  </div>
                  <div className="info-item">
                    <label>Language:</label>
                    <span>{selectedRoom.language}</span>
                  </div>
                  <div className="info-item">
                    <label>Region:</label>
                    <span>{selectedRoom.region}</span>
                  </div>
                  <div className="info-item">
                    <label>Theme:</label>
                    <span>{selectedRoom.theme}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span style={{ color: getStatusColor(selectedRoom.status) }}>
                      {selectedRoom.status}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Locked:</label>
                    <span>{selectedRoom.isLocked ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3><FaChartLine /> Activity Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-value">{selectedRoom.linesOfCode}</div>
                    <div className="stat-label">Lines of Code</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{selectedRoom.codeLength}</div>
                    <div className="stat-label">Characters</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{getTimeSince(selectedRoom.lastActivity)}</div>
                    <div className="stat-label">Last Activity</div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3><FaUsers /> Participants ({selectedRoom.participants.length})</h3>
                {selectedRoom.participants.length === 0 ? (
                  <div className="empty-participants">
                    <p>No participants in this room</p>
                  </div>
                ) : (
                  <div className="participants-list">
                    {selectedRoom.participants.map(participant => (
                      <div key={participant.id} className="participant-item">
                        <div className="participant-info">
                          <div className={`participant-avatar ${participant.status}`}>
                            {participant.avatar}
                          </div>
                          <div className="participant-details">
                            <span className="participant-name">{participant.name}</span>
                            <span className="participant-status">
                              {participant.status} • Joined {getTimeSince(participant.joinedAt)}
                            </span>
                          </div>
                        </div>
                        <button 
                          className="kick-btn"
                          onClick={() => handleKickUser(selectedRoom.roomId, participant.id)}
                          title="Kick User"
                        >
                          Kick
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-section">
                <h3><FaClock /> Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-time">{formatTime(selectedRoom.createdAt)}</span>
                      <span className="timeline-event">Room created</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-time">{formatTime(selectedRoom.lastActivity)}</span>
                      <span className="timeline-event">Last activity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;