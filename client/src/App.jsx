import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
const LoginPage = lazy(() => import("./components/LoginPage"));
const MainEditor = lazy(() => import("./components/MainEditor"));
const Profile = lazy(() => import("./components/Profile"));
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";

const HomePage = lazy(() => import("./components/HomePage"));
const JoinRoom = lazy(() => import("./components/JoinRoom")); 
const LiveRoom = lazy(() => import("./components/LiveRoom")); 
import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import "./Style/Navbar.css";
import Loader from "./components/Loader";

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
          <Suspense fallback={<Loader />}> 
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
            
            {/* Profile route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
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
          </Suspense>
          <ScrollToTop />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>

  );
}

export default App;
