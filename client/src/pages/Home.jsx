// src/pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const newRoom = uuidv4();
    if (username.trim() === "") return alert("Please enter your name");
    navigate(`/room/${newRoom}?user=${username}`);
  };

  const handleJoinRoom = () => {
    if (!roomId || !username) return alert("Fill both fields");
    navigate(`/room/${roomId}?user=${username}`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🚀 Welcome to JustCode Live!</h1>
      <input
        type="text"
        placeholder="Your Name"
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px", width: "200px", margin: "10px" }}
      /><br />
      <input
        type="text"
        placeholder="Enter Room Code"
        onChange={(e) => setRoomId(e.target.value)}
        style={{ padding: "10px", width: "200px", margin: "10px" }}
      /><br />
      <button onClick={handleJoinRoom} style={{ padding: "10px 20px", margin: "5px" }}>Join Room</button>
      <button onClick={handleCreateRoom} style={{ padding: "10px 20px", margin: "5px" }}>Create Room</button>
    </div>
  );
};

export default Home;
