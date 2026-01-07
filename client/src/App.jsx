import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./components/LoginPage";
import MainEditor from "./components/MainEditor";
import Profile from "./components/Profile";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./components/HomePage";
import JoinRoom from "./components/JoinRoom";
import LiveRoom from "./components/LiveRoom";
import Navbar from "./components/Navbar";
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
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Main personal editor - Protected */}
            <Route
              path="/editor"
              element={
                <ProtectedRoute>
                  <MainEditor />
                </ProtectedRoute>
              }
            />
            
            {/* Profile route - Protected */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Collaborative editor - Protected */}
            <Route
              path="/live"
              element={
                <ProtectedRoute>
                  <JoinRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live/:roomId"
              element={
                <ProtectedRoute>
                  <LiveRoom />
                </ProtectedRoute>
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
