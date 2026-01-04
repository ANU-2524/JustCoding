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
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${location.pathname === '/' ? 'hero-navbar' : ''}`}>
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
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <div className="profile-dropdown" ref={profileRef}>
              <div className="profile-btn-wrapper">
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
                      <FaUser /> Edit Profile
                    </Link>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
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