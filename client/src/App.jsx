import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { useTheme, ThemeProvider } from "./components/ThemeContext";
import LoginPage from "./components/LoginPage";
import MainEditor from "./components/MainEditor";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./components/HomePage"; // Optional
import JoinRoom from "./components/JoinRoom"; // 👈 added
import LiveRoom from "./components/LiveRoom"; // 👈 added
import Navbar from "./components/Navbar";
import "./Style/Navbar.css";

// function App() {
//   return (
//     <AuthProvider>
//       <Router>

function AppLayout() {
  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/editor" element={<MainEditor />} />
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
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
