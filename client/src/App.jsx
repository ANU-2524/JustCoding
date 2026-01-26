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
const Contests = lazy(() => import("./components/Contests"));
import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import "./Style/Navbar.css";
// import Loader from "./components/Loader";
// import FAQPage from "./components/FAQPage";
// const FAQPage = lazy(() => import("./components/FAQPage"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./components/TermsAndConditions"));
const Leaderboard = lazy(() => import("./components/Leaderboard"));
const ContestDetail = lazy(() => import("./components/ContestDetail"));
const ContestLeaderboard = lazy(() => import("./components/ContestLeaderboard"));
const ContestManagement = lazy(() => import("./components/ContestManagement"));
const ProgressExport = lazy(() => import("./components/ProgressExport"));
const BadgesPage = lazy(() => import("./components/BadgesPage"));
// const UserManagement = lazy(() => import("./components/UserManagement"));
const DebugHelper = lazy(() => import("./components/DebugHelper"));
const TutorialsPage = lazy(() => import("./components/TutorialsPage"));
const TutorialView = lazy(() => import("./components/TutorialView"));

const RoomManagement = lazy(() => import("./components/RoomManagement"));
const CodeQuality = lazy(() => import("./components/CodeQuality"));
const Visualizer = lazy(() => import("./components/Visualizer"));
const AuthManagement = lazy(() => import("./components/AuthManagement"));
const Analytics = lazy(() => import("./components/Analytics"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Cursor />
            <Navbar />
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/blog" element={<BlogPage />} />
                {/* <Route path="/faq" element={<FAQPage />} /> */}
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
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
                
                {/* Tutorials */}
                <Route path="/tutorials" element={<TutorialsPage />} />
                <Route path="/tutorials/:slug" element={<TutorialView />} />
                
                {/* Contests */}
                <Route path="/contests" element={<Contests />} />
                <Route path="/contests/:slug" element={<ContestDetail />} />
                <Route path="/contests/:slug/leaderboard" element={<ContestLeaderboard />} />
                <Route path="/admin/contests" element={<ContestManagement />} />
                
                {/* Analytics/Progress */}
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/progress" element={<Analytics />} />
                <Route path="/export" element={<ProgressExport />} />
                <Route path="/badges" element={<BadgesPage />} />
                {/* <Route path="/admin/users" element={<UserManagement />} /> */}
                <Route path="/debug" element={<DebugHelper />} />

                <Route path="/admin/rooms" element={<RoomManagement />} />
                <Route path="/code-quality" element={<CodeQuality />} />
                <Route path="/visualizer" element={<Visualizer />} />
                <Route path="/admin/auth" element={<AuthManagement />} />
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
