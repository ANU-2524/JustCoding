import React, { useState, useMemo, useEffect } from "react";
import { auth, provider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GithubAuthProvider,
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

  /* ---------- HANDLE REDIRECT RESULT (MOBILE OAUTH) ---------- */
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) navigate(from);
      } catch (err) {
        console.error("Redirect error:", err);
        alert(err.message);
      }
    };
    handleRedirect();
  }, [navigate, from]);

  /* ---------- MOBILE DETECTION ---------- */
  const isMobile = () =>
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;

  /* ---------- PASSWORD STRENGTH ---------- */
  const strengthScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  /* ---------- SOCIAL LOGIN ---------- */
  const handleSocialSignIn = async (type) => {
    const socialProvider =
      type === "google" ? provider : new GithubAuthProvider();

    try {
      if (isMobile()) {
        await signInWithRedirect(auth, socialProvider);
      } else {
        await signInWithPopup(auth, socialProvider);
        navigate(from);
      }
    } catch (err) {
      console.error("Social auth error:", err);
      alert(err.message);
    }
  };

  /* ---------- EMAIL LOGIN / SIGNUP ---------- */
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    try {
      if (type === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate(from);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <div
        className={`sliding-wrapper ${
          isRightPanelActive ? "right-panel-active" : ""
        }`}
      >
        {/* -------- SIGN UP -------- */}
        <div className="form-container sign-up-container">
          <form onSubmit={(e) => handleSubmit(e, "signup")}>
            <h1>Create Account</h1>

            <div className="social-auth-row">
              <button type="button" onClick={() => handleSocialSignIn("google")}>
                <FcGoogle />
              </button>
              <button type="button" onClick={() => handleSocialSignIn("github")}>
                <FaGithub />
              </button>
            </div>

            <span>or use email</span>

            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {password && (
              <div className="strength-bars">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`bar ${strengthScore >= n ? "active" : ""}`}
                  />
                ))}
              </div>
            )}

            <button className="auth-action-btn">Sign Up</button>
          </form>
        </div>

        {/* -------- SIGN IN -------- */}
        <div className="form-container sign-in-container">
          <form onSubmit={(e) => handleSubmit(e, "login")}>
            <h1>Sign In</h1>

            <div className="social-auth-row">
              <button type="button" onClick={() => handleSocialSignIn("google")}>
                <FcGoogle />
              </button>
              <button type="button" onClick={() => handleSocialSignIn("github")}>
                <FaGithub />
              </button>
            </div>

            <span>or use your account</span>

            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button className="auth-action-btn">Sign In</button>
          </form>
        </div>

        {/* -------- OVERLAY -------- */}
        <div className="overlay-container">
          <div className="overlay">
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c"
              alt="bg"
              className="overlay-bg-image"
            />

            <div className="overlay-panel overlay-left">
              <FaCode />
              <h1>Welcome Back!</h1>
              <button onClick={() => setIsRightPanelActive(false)}>
                Sign In
              </button>
            </div>

            <div className="overlay-panel overlay-right">
              <FaRocket />
              <h1>Hello, Friend!</h1>
              <button onClick={() => setIsRightPanelActive(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
