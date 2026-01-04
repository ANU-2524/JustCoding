import React, { useState, useEffect } from 'react';
import { FaCode, FaUsers, FaRobot, FaBars, FaTimes, FaSignOutAlt, FaHome, FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from "./ThemeContext";
import { useAuth } from './AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

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
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/editor', label: 'Editor', icon: <FaCode /> },
    { path: '/live', label: 'Collaborate', icon: <FaUsers /> },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${location.pathname === '/' ? 'hero-navbar' : ''}}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FaCode className="logo-icon" />
          <span className="logo-text">Just<span className="highlight">Coding</span></span>
        </Link>

        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          {currentUser && (
            <div className="nav-user-info">
              <span className="user-email">{currentUser.email}</span>
            </div>
          )}
        </div>

        <div className="nav-actions">
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span className="icon">
              {isDark ? <FaSun /> : <FaMoon />}
            </span>
          </button>

          {currentUser ? (
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span className="btn-text">Logout</span>
            </button>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}

          <button className="nav-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;