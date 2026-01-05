import React, { useState, useEffect, useRef } from 'react';
import { FaCode, FaUsers, FaRobot, FaBars, FaTimes, FaSignOutAlt, FaHome, FaUser, FaCaretDown } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
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
    { path: '/live', label: 'Collaborate', icon: <FaUsers /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${location.pathname === '/' ? 'hero-navbar' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <FaCode className="logo-icon" />
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
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="nav-actions">
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
                <FaCaretDown className="dropdown-arrow" />
              </button>
              
              {isProfileOpen && (
                <div className="profile-dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                    <FaUser /> Profile
                  </Link>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Desktop Login Button */}
          {!currentUser && (
            <Link to="/login" className="login-btn desktop-only">
              Login
            </Link>
          )}
          
          {/* Mobile Hamburger Toggle */}
          <button className="nav-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {/* Navigation Links */}
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
          
          {/* Mobile Profile Section (when logged in) */}
          {currentUser ? (
            <div className="mobile-profile-section">
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
              
              <Link 
                to="/profile" 
                className="mobile-profile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <FaUser /> <span>Profile</span>
              </Link>
              
              <button 
                className="mobile-logout-btn"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <FaSignOutAlt /> <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Mobile Login Button (when not logged in) */
            <Link 
              to="/login" 
              className="mobile-login-btn"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;