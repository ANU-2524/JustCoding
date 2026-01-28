import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaSearch, FaEdit, FaTrash, FaBan, FaCheck, FaTimes, FaCrown } from 'react-icons/fa';
import { AuthContext } from './AuthContext';
import { ThemeContext } from './ThemeContext';
import '../Style/UserManagement.css';

const UserManagement = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // This would typically fetch from an admin API endpoint
      // For now, we'll use mock data
      const mockUsers = [
        {
          id: '1',
          uid: 'user1',
          displayName: 'John Doe',
          email: 'john@example.com',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
          role: 'user',
          isBanned: false,
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-01-25T14:20:00Z',
          challengesCompleted: 15,
          contestsWon: 2,
          reputation: 1250
        },
        {
          id: '2',
          uid: 'user2',
          displayName: 'Jane Smith',
          email: 'jane@example.com',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
          role: 'moderator',
          isBanned: false,
          createdAt: '2024-01-10T09:15:00Z',
          lastLogin: '2024-01-24T16:45:00Z',
          challengesCompleted: 28,
          contestsWon: 5,
          reputation: 2100
        },
        {
          id: '3',
          uid: 'user3',
          displayName: 'Bob Johnson',
          email: 'bob@example.com',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
          role: 'user',
          isBanned: true,
          createdAt: '2024-01-20T11:00:00Z',
          lastLogin: '2024-01-20T11:00:00Z',
          challengesCompleted: 3,
          contestsWon: 0,
          reputation: 50
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      // This would typically make API calls to update user status
      console.log(`Performing ${action} on user ${userId}`, data);

      // Update local state for demo purposes
      setUsers(users.map(u =>
        u.id === userId
          ? { ...u, ...data }
          : u
      ));

      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'moderator': return '#ea580c';
      case 'user': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className={`user-management ${theme}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`user-management ${theme}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="user-management-header">
        <div className="header-content">
          <FaUsers className="header-icon" />
          <h1>User Management</h1>
          <p>Manage platform users, roles, and permissions</p>
        </div>
      </div>

      <div className="user-management-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{users.filter(u => u.role === 'moderator').length}</span>
            <span className="stat-label">Moderators</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{users.filter(u => u.isBanned).length}</span>
            <span className="stat-label">Banned</span>
          </div>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Activity</th>
              <th>Reputation</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="user-cell">
                  <div className="user-info">
                    <img
                      src={user.photoURL || '/default-avatar.png'}
                      alt={user.displayName}
                      className="user-avatar"
                    />
                    <div className="user-details">
                      <div className="user-name">{user.displayName}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-id">ID: {user.uid}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className="role-badge"
                    style={{ backgroundColor: getRoleColor(user.role) }}
                  >
                    {user.role === 'moderator' && <FaCrown className="role-icon" />}
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
                    {user.isBanned ? <FaBan /> : <FaCheck />}
                    {user.isBanned ? 'Banned' : 'Active'}
                  </span>
                </td>
                <td className="activity-cell">
                  <div className="activity-stats">
                    <span>{user.challengesCompleted} challenges</span>
                    <span>{user.contestsWon} contests won</span>
                    <span>Last login: {formatDate(user.lastLogin)}</span>
                  </div>
                </td>
                <td className="reputation-cell">
                  <span className="reputation-score">{user.reputation}</span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      title="Edit User"
                    >
                      <FaEdit />
                    </button>
                    {user.isBanned ? (
                      <button
                        className="action-btn unban"
                        onClick={() => handleUserAction(user.id, 'unban', { isBanned: false })}
                        title="Unban User"
                      >
                        <FaCheck />
                      </button>
                    ) : (
                      <button
                        className="action-btn ban"
                        onClick={() => handleUserAction(user.id, 'ban', { isBanned: true })}
                        title="Ban User"
                      >
                        <FaBan />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <motion.div
            className="user-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit User: {selectedUser.displayName}</h2>
              <button
                className="close-btn"
                onClick={() => setShowUserModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Display Name</label>
                <input
                  type="text"
                  value={selectedUser.displayName}
                  onChange={(e) => setSelectedUser({...selectedUser, displayName: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reputation</label>
                <input
                  type="number"
                  value={selectedUser.reputation}
                  onChange={(e) => setSelectedUser({...selectedUser, reputation: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowUserModal(false)}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                onClick={() => handleUserAction(selectedUser.id, 'update', selectedUser)}
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserManagement;