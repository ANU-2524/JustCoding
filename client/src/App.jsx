import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import LoginPage from "./components/LoginPage";
import MainEditor from "./components/MainEditor";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./components/HomePage";
import JoinRoom from "./components/JoinRoom";
import LiveRoom from "./components/LiveRoom";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Main personal editor */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <MainEditor />
              </ProtectedRoute>
            }
          />

          {/* Collaborative editor */}
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
      </Router>
    </AuthProvider>
  );
}

export default App;
