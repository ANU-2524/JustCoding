import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import LoginPage from "./components/LoginPage";
import MainEditor from "./components/MainEditor";
import Profile from "./components/Profile";
import Dashboard from "./components/Dashboard";
import ScrollToTop from "./components/ScrollToTop";
// Note: Auth remains available, but core app is usable without login.

import HomePage from "./components/HomePage"; // Optional
import JoinRoom from "./components/JoinRoom"; // 👈 added
import LiveRoom from "./components/LiveRoom"; // 👈 added
import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import "./Style/Navbar.css";

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
        

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
          <Cursor />
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Main personal editor */}
            <Route
              path="/editor"
              element={
                <MainEditor />
              }
            />
            
            {/* Profile route */}
            <Route
              path="/profile"
              element={
                <Profile />
              }
            />

            {/* Dashboard route */}
            <Route
              path="/dashboard"
              element={
                <Dashboard />
              }
            />

            {/* Collaborative editor */}
            <Route
              path="/live"
              element={
                <JoinRoom />
              }
            />
            <Route
              path="/live/:roomId"
              element={
                <LiveRoom />
              }
            />
          </Routes>
          <ScrollToTop />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>

  );
}

export default App;
