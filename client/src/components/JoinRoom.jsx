// src/components/JoinRoom.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { FaCode, FaUsers, FaComments, FaSearch, FaPlus, FaLock, FaGlobe } from 'react-icons/fa';
import '../Style/JoinRoom.css';

const JoinRoom = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [rooms, setRooms] = useState([
    { id: 'js-project', name: 'JavaScript Project', language: 'JavaScript', users: 4, isPublic: true, description: 'Working on React components' },
    { id: 'py-algo', name: 'Python Algorithms', language: 'Python', users: 2, isPublic: true, description: 'Solving LeetCode problems' },
    { id: 'mobile-dev', name: 'Mobile App Dev', language: 'React Native', users: 3, isPublic: false, description: 'Building cross-platform app' },
    { id: 'api-dev', name: 'API Development', language: 'Node.js', users: 5, isPublic: true, description: 'RESTful API design' },
    { id: 'db-design', name: 'Database Design', language: 'SQL', users: 2, isPublic: true, description: 'Schema optimization' },
  ]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [username, setUsername] = useState('');
  const [newRoom, setNewRoom] = useState({
    name: '',
    language: 'JavaScript',
    isPublic: true,
    description: ''
  });
  const navigate = useNavigate();

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRoom = () => {
    if (newRoom.name.trim() && username.trim()) {
      const roomId = uuidv4();
      const room = {
        id: roomId,
        ...newRoom,
        users: 1
      };
      setRooms([room, ...rooms]);
      navigate(`/live/${roomId}?user=${username}`);
    } else {
      alert("Please enter your name and room name");
    }
  };

  const joinRoom = (room) => {
    if (!username.trim()) {
      alert("Please enter your name first");
      return;
    }
    navigate(`/live/${room.id}?user=${username}`);
  };

  const handleDirectJoin = () => {
    if (!username.trim() || !selectedRoom.trim()) {
      alert("Please enter your name and room code");
      return;
    }
    navigate(`/live/${selectedRoom}?user=${username}`);
  };

  return (
    <div className="join-room-container join-room-page">
      <motion.div
        className="join-room-main"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="room-title">JustCoding DevZone</h1>
        <p className="room-subtitle">Connect, code, and collaborate in real-time</p>

        <div className="username-input-container">
          <input
            type="text"
            placeholder="👤 Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="room-input username-input"
          />
        </div>

        <div className="collaborate-content">
          <div className="collaborate-left">
            <div className="create-room-card">
              <h2>Create New Room</h2>
              <div className="form-group">
                <label htmlFor="roomName">Room Name</label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                  placeholder="Enter room name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="language">Programming Language</label>
                <select
                  id="language"
                  value={newRoom.language}
                  onChange={(e) => setNewRoom({...newRoom, language: e.target.value})}
                >
                  <option value="JavaScript">JavaScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="React">React</option>
                  <option value="Node.js">Node.js</option>
                  <option value="HTML/CSS">HTML/CSS</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                  placeholder="Brief description of the room's purpose"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newRoom.isPublic}
                    onChange={(e) => setNewRoom({...newRoom, isPublic: e.target.checked})}
                  />
                  <span className="checkmark"></span>
                  Make this room public
                </label>
              </div>
              
              <button className="create-room-btn" onClick={handleCreateRoom}>
                <FaPlus /> Create Room
              </button>
            </div>
          </div>

          <div className="collaborate-right">
            <div className="rooms-header">
              <h2>Browse Available Rooms</h2>
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="rooms-list">
              {filteredRooms.map((room) => (
                <motion.div
                  key={room.id}
                  className="room-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => joinRoom(room)}
                >
                  <div className="room-header">
                    <h3>{room.name}</h3>
                    {room.isPublic ? (
                      <span className="room-badge public">
                        <FaGlobe /> Public
                      </span>
                    ) : (
                      <span className="room-badge private">
                        <FaLock /> Private
                      </span>
                    )}
                  </div>
                  <p className="room-description">{room.description}</p>
                  <div className="room-details">
                    <span className="room-language">{room.language}</span>
                    <span className="room-users">
                      <FaUsers /> {room.users} {room.users === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinRoom;