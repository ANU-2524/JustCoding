import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import LoginPage from "./components/LoginPage";
import MainEditor from "./components/MainEditor";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./components/HomePage";
import JoinRoom from "./components/JoinRoom";
import LiveRoom from "./components/LiveRoom";
import Navbar from "./components/Navbar";
import "./Style/Navbar.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <Routes>
              {/* Home page */}
              <Route path="/" element={<HomePage />} />

              {/* Login page */}
              <Route path="/login" element={<LoginPage />} />

              {/* Main personal editor - now public */}
              <Route path="/editor" element={<MainEditor />} />

              {/* Profile route - still protected */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Collaborative editor - still protected */}
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
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
