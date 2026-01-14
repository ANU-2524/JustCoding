import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
const LoginPage = lazy(() => import("./components/LoginPage"));
const MainEditor = lazy(() => import("./components/MainEditor"));
const Profile = lazy(() => import("./components/Profile"));
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
const BlogPage = lazy(() => import("./components/BlogPage"));
const HomePage = lazy(() => import("./components/HomePage"));
const JoinRoom = lazy(() => import("./components/JoinRoom")); 
const LiveRoom = lazy(() => import("./components/LiveRoom")); 
const UserDashboard = lazy(() => import("./components/UserDashboard"));
const Challenges = lazy(() => import("./components/Challenges"));
const ChallengeSolve = lazy(() => import("./components/ChallengeSolve"));
import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import "./Style/Navbar.css";
import Loader from "./components/Loader";
import FAQPage from "./components/FAQPage";
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
            <Route path="/blog" element={<BlogPage />} />
<Route path="/faq" element={<FAQPage />} />
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
            
            {/* User Dashboard route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
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

            {/* Coding Challenges */}
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:slug" element={<ChallengeSolve />} />
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
