// src/components/LiveRoomEntry.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import '../Style/JoinRoom.css';

const LiveRoomEntry = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const createRoom = () => {
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }
    const newRoomId = uuidv4();
    navigate(`/live/${newRoomId}?user=${username}`);
  };

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      alert("Please fill in both fields");
      return;
    }
    navigate(`/live/${roomId}?user=${username}`);
  };

  return (
    <div className="join-room-container join-room-page">
      <motion.div
        className="join-room-card"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="room-title">JustCoding DevZone...</h1>
        <p className="room-subtitle">Enter a room code or create your own !</p>

        <input
          type="text"
          placeholder="👤 Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="room-input"
        />
        <input
          type="text"
          placeholder="🏷️ Room Code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="room-input"
        />

        <div className="room-button-group">
          <button onClick={joinRoom} className="btnn room-join">Join Room</button>
          <button onClick={createRoom} className="btnn room-create">Create Room</button>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveRoomEntry;
