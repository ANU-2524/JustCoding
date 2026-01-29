
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import { ThemeProvider } from "./components/ThemeContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Cursor from "./components/Cursor";
import "./Style/Navbar.css";

const GuestLeaderboard = lazy(() => import("./components/GuestLeaderboard"));
const GuestNotes = lazy(() => import("./components/GuestNotes"));
const CodeGallery = lazy(() => import("./components/CodeGallery"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const MainEditor = lazy(() => import("./components/MainEditor"));
const Profile = lazy(() => import("./components/Profile"));
const BlogPage = lazy(() => import("./components/BlogPage"));
const HomePage = lazy(() => import("./components/HomePage"));
const JoinRoom = lazy(() => import("./components/JoinRoom"));
const LiveRoom = lazy(() => import("./components/LiveRoom"));
const UserDashboard = lazy(() => import("./components/UserDashboard"));
const Challenges = lazy(() => import("./components/Challenges"));
const ChallengeSolve = lazy(() => import("./components/ChallengeSolve"));
const Contests = lazy(() => import("./components/Contests"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./components/TermsAndConditions"));
const ContributingPage = lazy(() => import("./components/ContributingPage"));
const FAQPage = lazy(() => import("./components/FAQPage"));
const Leaderboard = lazy(() => import("./components/Leaderboard"));
const ContestDetail = lazy(() => import("./components/ContestDetail"));
const ContestLeaderboard = lazy(() => import("./components/ContestLeaderboard"));
const ContestManagement = lazy(() => import("./components/ContestManagement"));
const ProgressExport = lazy(() => import("./components/ProgressExport"));
const BadgesPage = lazy(() => import("./components/BadgesPage"));
const DebugHelper = lazy(() => import("./components/DebugHelper"));
const TutorialsPage = lazy(() => import("./components/TutorialsPage"));
const TutorialView = lazy(() => import("./components/TutorialView"));
const RoomManagement = lazy(() => import("./components/RoomManagement"));
const CodeQuality = lazy(() => import("./components/CodeQuality"));
const CodeExplainer = lazy(() => import("./components/CodeExplainer"));
const SnippetsManager = lazy(() => import("./components/SnippetsManager"));
const CodeDebugger = lazy(() => import("./components/CodeDebugger"));
const LearningPaths = lazy(() => import("./components/LearningPaths"));
const Analytics = lazy(() => import("./components/Analytics"));


const GuestPortfolioBuilder = lazy(() => import("./components/GuestPortfolioBuilder"));
const NotFound = lazy(() => import("./components/NotFound"));

const CommunityPage = lazy(() => import("./components/CommunityPage"));
const CommunityPostDetail = lazy(() => import("./components/CommunityPostDetail"));


function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="app-container">
              <Cursor />
              <Navbar />
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  {/* Guest Leaderboard Participation */}
                  <Route path="/guest-leaderboard" element={<GuestLeaderboard />} />
                  {/* Guest Notes / Coding Journal */}
                  <Route path="/notes" element={<GuestNotes />} />
                  {/* Public Code Gallery */}
                  <Route path="/code-gallery" element={<CodeGallery />} />
                  {/* Portfolio Builder (guest-friendly) */}
                  <Route path="/portfolio-builder" element={<GuestPortfolioBuilder />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/contributing" element={<ContributingPage />} />
                  <Route path="/faq" element={<FAQPage />} />
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
                  
                  {/* Learning Paths */}
                  <Route path="/learning-paths" element={<LearningPaths />} />
                  <Route path="/learning-paths/:pathId" element={<LearningPaths />} />
                  
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
                  <Route path="/debug" element={<CodeDebugger />} />
                  <Route path="/debug-helper" element={<DebugHelper />} />

                  <Route path="/admin/rooms" element={<RoomManagement />} />
                  <Route path="/code-quality" element={<CodeQuality />} />
                  <Route path="/code-explainer" element={<CodeExplainer />} />
                  <Route path="/snippets" element={<SnippetsManager />} />
                  
                  {/* Community */}
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/community/posts/:id" element={<CommunityPostDetail />} />
                  
                  {/* Catch-all route for undefined paths */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <ScrollToTop />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
