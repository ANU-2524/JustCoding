// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import LoginPage from "./components/LoginPage";
import MainEditor from "./components/MainEditor";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./components/HomePage"; // Optional

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <MainEditor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
