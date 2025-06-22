// src/components/JoinRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const JoinRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = uuidv4();
    if (!username.trim()) {
      alert("Please enter your name");
      return;
    }
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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Join or Create a Live Room</h2>
      <input
        type="text"
        placeholder="Your Name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px", width: "250px", margin: "10px" }}
      />
      <br />
      <input
        type="text"
        placeholder="Enter Room Code"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        style={{ padding: "10px", width: "250px", margin: "10px" }}
      />
      <br />
      <button onClick={joinRoom} style={{ padding: "10px 20px", marginRight: "10px" }}>Join Room</button>
      <button onClick={createRoom} style={{ padding: "10px 20px" }}>Create Room</button>
    </div>
  );
};

export default JoinRoom;
