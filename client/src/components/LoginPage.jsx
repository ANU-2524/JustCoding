// src/components/LoginPage.jsx
import React, { useState, useMemo, useEffect } from "react";
import { auth, provider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  GithubAuthProvider 
} from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import "../Style/LoginPage.css";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaEye, FaEyeSlash, FaRocket, FaCode } from "react-icons/fa"; 

const LoginPage = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/editor";

  // Handle OAuth redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          navigate(from);
        }
      } catch (error) {
        console.error("Redirect sign-in error:", error);
        // Handle specific mobile OAuth errors
        if (error.code === 'auth/popup-blocked') {
          alert("Popup was blocked. Please allow popups for this site and try again.");
        } else if (error.code === 'auth/popup-closed-by-user') {
          // User closed popup, no action needed
        } else {
          alert(`Authentication failed: ${error.message}`);
        }
      }
    };

    handleRedirectResult();
  }, [navigate, from]);

  // Detect if device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  };

  // Password Strength Logic
  const strengthScore = useMemo(() => {
    if (!password) {
return 0;
}
    let score = 0;
    if (password.length > 7) {
score++;
}
    if (/[A-Z]/.test(password)) {
score++;
}
    if (/[0-9]/.test(password)) {
score++;
}
    if (/[^A-Za-z0-9]/.test(password)) {
score++;
}
    return score;
  }, [password]);

  const handleSocialSignIn = async (type) => {
    const socialProvider = type === 'google' ? provider : new GithubAuthProvider();
    
    try {
      if (isMobile()) {
        // Use redirect for mobile devices to avoid popup issues
        await signInWithRedirect(auth, socialProvider);
        // Navigation will happen in the useEffect when redirect completes
      } else {
        // Use popup for desktop
        await signInWithPopup(auth, socialProvider);
        navigate(from);
      }
    } catch (err) {
      console.error("Social sign-in error:", err);
      if (err.code === 'auth/popup-blocked') {
        alert("Popup was blocked. Please allow popups for this site and try again.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        // User closed popup, no action needed
      } else {
        alert(`Authentication failed: ${err.message}`);
      }

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate(from);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className={`sliding-wrapper ${isRightPanelActive ? "right-panel-active" : ""}`}>
        
        {/* SIGN UP FORM */}
        <div className="form-container sign-up-container">
          <form onSubmit={(e) => handleSubmit(e, 'signup')}>
            <h1 className="form-title">Create Account</h1>
            <div className="social-auth-row">
              <button type="button" className="social-btn" onClick={() => handleSocialSignIn('google')}><FcGoogle /></button>
              <button type="button" className="social-btn github" onClick={() => handleSocialSignIn('github')}><FaGithub /></button>
            </div>
            <span className="divider-text">or use email for registration</span>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
            {password && (
                <div className="strength-meter-container">
                    <div className="strength-bars">
                        {[1, 2, 3, 4].map(b => <div key={b} className={`bar ${strengthScore >= b ? `lvl-${strengthScore}` : ''}`} />)}
                    </div>
                </div>
            )}
            <button className="auth-action-btn">Sign Up</button>
          </form>
        </div>

        {/* LOGIN FORM */}
        <div className="form-container sign-in-container">
          <form onSubmit={(e) => handleSubmit(e, 'login')}>
            <h1 className="form-title">Sign In</h1>
            <div className="social-auth-row">
              <button type="button" className="social-btn" onClick={() => handleSocialSignIn('google')}><FcGoogle /></button>
              <button type="button" className="social-btn github" onClick={() => handleSocialSignIn('github')}><FaGithub /></button>
            </div>
            <span className="divider-text">or use your account</span>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="password-wrapper">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <span className="eye-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
            </div>
            <button className="auth-action-btn">Sign In</button>
          </form>
        </div>

        {/* THE SLIDING OVERLAY WITH IMAGE */}
        <div className="overlay-container">
          <div className="overlay">
            <img 
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80" 
              alt="Coding Background" 
              className="overlay-bg-image" 
            />
            <div className="overlay-panel overlay-left">
              <FaCode className="overlay-icon" />
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost-btn" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <FaRocket className="overlay-icon" />
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost-btn" onClick={() => setIsRightPanelActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;