import React, { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaEdit, FaTrash, FaEye, FaCode, FaBan } from 'react-icons/fa';
import '../Style/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      userId: 'user123',
      displayName: 'John Doe',
      email: 'john@example.com',
      totalPoints: 1250,
      level: 8,
      badges: ['First Steps', 'Problem Solver'],
      createdAt: '2024-01-15',
      lastActiveAt: '2024-03-01',
      snippetCount: 15,
      status: 'active'
    },
    {
      userId: 'user456',
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      totalPoints: 890,
      level: 6,
      badges: ['Code Warrior'],
      createdAt: '2024-02-01',
      lastActiveAt: '2024-02-28',
      snippetCount: 8,
      status: 'active'
    },
    {
      userId: 'user789',
      displayName: 'Mike Johnson',
      email: 'mike@example.com',
      totalPoints: 2100,
      level: 12,
      badges: ['JavaScript Master', 'Contest Champion'],
      createdAt: '2023-12-10',
      lastActiveAt: '2024-03-02',
      snippetCount: 32,
      status: 'active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.userId !== userId));
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(u => 
      u.userId === userId 
        ? { ...u, status: u.status === 'active' ? 'banned' : 'active' }
        : u
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'banned': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="user-management">
      <div className="management-header">
        <h1><FaUsers /> User Management</h1>
        <div className="user-stats">
          <div className="stat">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat">
            <span className="stat-number">{users.filter(u => u.status === 'active').length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat">
            <span className="stat-number">{users.filter(u => u.status === 'banned').length}</span>
            <span className="stat-label">Banned</span>
          </div>
        </div>
      </div>

      <div className="management-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filter">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div className="col-user">User</div>
          <div className="col-stats">Stats</div>
          <div className="col-activity">Activity</div>
          <div className="col-status">Status</div>
          <div className="col-actions">Actions</div>
        </div>

        <div className="table-body">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <FaUsers className="empty-icon" />
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.userId} className="table-row">
                <div className="col-user">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4>{user.displayName}</h4>
                      <p>{user.email}</p>
                      <span className="user-id">ID: {user.userId}</span>
                    </div>
                  </div>
                </div>

                <div className="col-stats">
                  <div className="stat-item">
                    <span className="stat-value">{user.totalPoints}</span>
                    <span className="stat-name">Points</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">L{user.level}</span>
                    <span className="stat-name">Level</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{user.badges.length}</span>
                    <span className="stat-name">Badges</span>
                  </div>
                </div>

                <div className="col-activity">
                  <div className="activity-item">
                    <FaCode />
                    <span>{user.snippetCount} snippets</span>
                  </div>
                  <div className="activity-date">
                    Last active: {new Date(user.lastActiveAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="col-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="col-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => handleViewUser(user)}
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="action-btn ban"
                    onClick={() => handleToggleStatus(user.userId)}
                    title={user.status === 'active' ? 'Ban User' : 'Unban User'}
                  >
                    <FaBan />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteUser(user.userId)}
                    title="Delete User"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showUserModal && selectedUser && (
        <div className="user-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={() => setShowUserModal(false)} className="close-btn">×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-detail-section">
                <h3>Profile Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Display Name:</label>
                    <span>{selectedUser.displayName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>User ID:</label>
                    <span>{selectedUser.userId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span style={{ color: getStatusColor(selectedUser.status) }}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-detail-section">
                <h3>Activity & Progress</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Total Points:</label>
                    <span>{selectedUser.totalPoints}</span>
                  </div>
                  <div className="detail-item">
                    <label>Level:</label>
                    <span>{selectedUser.level}</span>
                  </div>
                  <div className="detail-item">
                    <label>Badges:</label>
                    <span>{selectedUser.badges.join(', ')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Code Snippets:</label>
                    <span>{selectedUser.snippetCount}</span>
                  </div>
                </div>
              </div>

              <div className="user-detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Joined:</label>
                    <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Active:</label>
                    <span>{new Date(selectedUser.lastActiveAt).toLocaleDateString()}</span>
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

export default UserManagement;