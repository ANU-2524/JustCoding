import React, { useState, useEffect, useRef } from 'react';
import { FaCode, FaUsers, FaRobot, FaBars, FaTimes, FaSignOutAlt, FaHome, FaUser, FaCaretDown, FaMoon, FaSun, FaChartLine, FaQuestionCircle, FaNewspaper, FaTrophy, FaBook, FaBug, FaGithub, FaLightbulb, FaSave, FaRoad, FaComments, FaChevronDown, FaDownload, FaEllipsisH, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/editor', label: 'Editor', icon: <FaCode /> },
    { path: '/guest-leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
    { path: '/notes', label: 'Notes', icon: <FaBook /> },
    { path: '/portfolio-builder', label: 'Portfolio Builder', icon: <FaUser /> },
    { path: '/export', label: 'Export Progress', icon: <FaDownload /> },
  ];

  const learningItems = [
    // { path: '/tutorials', label: 'Tutorials', icon: <FaBook /> },
    // { path: '/learning-paths', label: 'Learning Paths', icon: <FaRoad /> },
    { path: '/blog', label: 'Blog', icon: <FaNewspaper /> },
  ];

  const codingToolsItems = [
    { path: '/challenges', label: 'Challenges', icon: <FaTrophy /> },
    { path: '/contests', label: 'Contests', icon: <FaTrophy /> },
    { path: '/code-quality', label: 'Code Quality', icon: <FaBug /> },
    { path: '/debug', label: 'AI Debugger', icon: <FaRobot /> },
    { path: '/code-explainer', label: 'Code Explainer', icon: <FaLightbulb /> },
    { path: '/snippets', label: 'Snippets', icon: <FaSave /> },
    { path: '/collab-editor', label: 'Collaborative Editor', icon: <FaUsers /> },
  ];

  const communityItems = [
    { path: '/leaderboard', label: 'Leaderboard', icon: <FaChartLine /> },
    { path: '/advanced-leaderboard', label: 'Advanced Leaderboard', icon: <FaTrophy /> },
    { path: '/live', label: 'Collaborate', icon: <FaUsers /> },
    { path: '/community', label: 'Community', icon: <FaComments /> },
    { path: '/daily-prompt', label: 'Daily Coding Prompt', icon: <FaLightbulb /> },
    { path: '/collaborative-prompt', label: 'Real-Time Collaboration', icon: <FaUsers /> },
    { path: '/prompt-history', label: 'Prompt History', icon: <FaBook /> },
    { path: '/code-gallery', label: 'Code Gallery', icon: <FaBook /> },
    { path: '/code-review-wall', label: 'Code Review Wall', icon: <FaComments /> },
  ];
  
  const profileDropdownItems = [
    { path: '/profile', label: 'Profile', icon: <FaUser /> },
    { path: '/dashboard', label: 'Dashboard', icon: <FaChartLine /> },
  ];

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''} ${location.pathname === '/' ? 'hero-navbar' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <FaCode className="logo-icon" />
          </motion.div>
          <span className="logo-text">Just<span className="highlight">Coding</span></span>
        </Link>

        {/* Desktop Navigation Links (center) - show top 3, keep the rest in a creative More dropdown */}
        <div className="nav-menu-desktop desktop-only compact">
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              title={item.label}
            >
              <span className="nav-link-icon">{item.icon}</span>
              <span className="nav-link-label">{item.label}</span>
              {location.pathname === item.path && (
                <motion.div 
                  className="active-indicator"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}

          <div className="nav-dropdown-container" ref={dropdownRef}>
            <button
              className="nav-dropdown-btn more-btn"
              onClick={() => setOpenDropdown(openDropdown === 'more' ? null : 'more')}
              title="More"
              aria-haspopup="true"
              aria-expanded={openDropdown === 'more'}
            >
              <span className="more-icon" aria-hidden>
                <FaEllipsisH />
              </span>
              <FaChevronDown className={`dropdown-arrow ${openDropdown === 'more' ? 'open' : ''}`} />
            </button>

            <AnimatePresence>
              {openDropdown === 'more' && (
                <motion.div
                  className="nav-dropdown-menu creative-more"
                  role="menu"
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="dropdown-header">
                    <div className="dropdown-header-title">More</div>
                    <button className="dropdown-close" onClick={() => setOpenDropdown(null)} aria-label="Close menu">
                      <FaTimesCircle />
                    </button>
                  </div>
                  {/* Remaining primary links */}
                  {navItems.slice(3).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      role="menuitem"
                      className={`dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {item.icon} <span>{item.label}</span>
                    </Link>
                  ))}

                  <div className="dropdown-section two-column">
                    <div>
                      <div className="dropdown-section-title">Learning</div>
                      {learningItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          role="menuitem"
                          className={`dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {item.icon} <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    <div>
                      <div className="dropdown-section-title">Tools</div>
                      {codingToolsItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          role="menuitem"
                          className={`dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {item.icon} <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="dropdown-section">
                    <div className="dropdown-section-title">Community</div>
                    {communityItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        role="menuitem"
                        className={`dropdown-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.icon} <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="nav-actions">
          {/* Theme Toggle */}
          <motion.button 
            className="theme-toggle-nav" 
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle theme"
          >
            {isDark ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
          </motion.button>

          {/* Desktop Profile Dropdown */}
          {currentUser && (
            <div className="profile-dropdown desktop-only" ref={profileRef}>
              <button 
                className="profile-btn"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <div className="avatar-icon">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      className="avatar-img"
                    />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <FaCaretDown className={`dropdown-arrow ${isProfileOpen ? 'rotated' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    className="profile-dropdown-menu"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {profileDropdownItems.map((item) => (
                      <Link 
                        key={item.path}
                        to={item.path}
                        className="dropdown-item"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <button className="dropdown-item" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Desktop Login Button */}
          {!currentUser && (
            <Link to="/login" className="login-btn desktop-only">
              <span>Login</span>
            </Link>
          )}
          
          {/* Mobile Hamburger Toggle */}
          <motion.button 
            className="nav-toggle" 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isMenuOpen ? 'close' : 'open'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex' }}
              >
                {isMenuOpen ? <FaTimes /> : <FaBars />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
        
        {/* Mobile Menu Backdrop */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="nav-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            >
              <div className="mobile-menu-header">
                <span className="mobile-menu-title">Navigation</span>
                <div className="mobile-menu-divider" />
              </div>

              {/* Navigation Links */}
              <div className="mobile-nav-links">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <Link
                      to={item.path}
                      className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Learning Section */}
              <div className="mobile-menu-section">
                <div className="mobile-menu-category-title">Learning</div>
                <div className="mobile-nav-links">
                  {learningItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * (index + 5) }}
                    >
                      <Link
                        to={item.path}
                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Coding Tools Section */}
              <div className="mobile-menu-section">
                <div className="mobile-menu-category-title">Tools</div>
                <div className="mobile-nav-links">
                  {codingToolsItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * (index + 8) }}
                    >
                      <Link
                        to={item.path}
                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Community Section */}
              <div className="mobile-menu-section">
                <div className="mobile-menu-category-title">Community</div>
                <div className="mobile-nav-links">
                  {communityItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * (index + 14) }}
                    >
                      <Link
                        to={item.path}
                        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Mobile Profile Section (when logged in) */}
              {currentUser ? (
                <motion.div 
                  className="mobile-profile-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="mobile-profile-header">
                    <div className="mobile-avatar">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt="Profile" 
                          className="avatar-img"
                        />
                      ) : (
                        <FaUser />
                      )}
                    </div>
                    <span className="mobile-user-email">
                      {currentUser.email?.split('@')[0] || 'User'}
                    </span>
                  </div>
                  
                  {profileDropdownItems.map((item) => (
                    <Link 
                      key={item.path}
                      to={item.path}
                      className="mobile-profile-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon} <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  <button 
                    className="mobile-logout-btn"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <FaSignOutAlt /> <span>Logout</span>
                  </button>
                </motion.div>
              ) : (
                /* Mobile Login Button (when not logged in) */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link 
                    to="/login" 
                    className="mobile-login-btn"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUser /> <span>Login</span>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;