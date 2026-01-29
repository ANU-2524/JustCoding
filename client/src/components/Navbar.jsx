import React, { useState, useEffect, useRef } from 'react';
import { FaCode, FaUsers, FaRobot, FaBars, FaTimes, FaSignOutAlt, FaHome, FaUser, FaCaretDown, FaMoon, FaSun, FaChartLine, FaQuestionCircle, FaNewspaper, FaTrophy, FaBook, FaBug, FaGithub, FaLightbulb, FaSave, FaRoad  , FaComments } from 'react-icons/fa'; // Added FaBook, FaGithub, FaLightbulb, FaSave, and FaRoad
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
  const profileRef = useRef(null);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/editor', label: 'Editor', icon: <FaCode /> },
    { path: '/tutorials', label: 'Tutorials', icon: <FaBook /> },
    { path: '/learning-paths', label: 'Learning Paths', icon: <FaRoad /> },
    { path: '/challenges', label: 'Challenges', icon: <FaTrophy /> },
    { path: '/contests', label: 'Contests', icon: <FaTrophy /> },
    { path: '/leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
    { path: '/analytics', label: 'Analytics', icon: <FaChartLine /> },
    { path: '/code-quality', label: 'Code Quality', icon: <FaBug /> },
    { path: '/code-explainer', label: 'Code Explainer', icon: <FaLightbulb /> },
    { path: '/snippets', label: 'Snippets', icon: <FaSave /> },
    { path: '/live', label: 'Collaborate', icon: <FaUsers /> },
    { path: '/community', label: 'Community', icon: <FaComments /> },
    // { path: '/faq', label: 'FAQ', icon: <FaQuestionCircle /> },
    { path: '/blog', label: 'Blog', icon: <FaNewspaper /> }, // Using FaNewspaper for blog
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

        {/* Desktop Navigation Links (center) */}
        <div className="nav-menu-desktop desktop-only">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-link-icon">{item.icon}</span>
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <motion.div 
                  className="active-indicator"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}

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
                    transition={{ delay: 0.1 * index }}
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