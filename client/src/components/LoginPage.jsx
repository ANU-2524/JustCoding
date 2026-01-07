// src/components/LoginPage.jsx
import React, { useState } from "react";
import { auth, provider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  browserPopupRedirectResolver,
  sendPasswordResetEmail
} from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ Added useLocation
import { useTheme } from "./ThemeContext";
import "../Style/theme.css";
import "../Style/LoginPage.css";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // ✅ used to detect original page
  const { theme, isDark } = useTheme(); // Add theme context

  const from = location.state?.from?.pathname || "/editor"; // 👈 default to /editor if no previous page

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider); // ✅ set resolver
      navigate(from); // take back to /editor or intended route
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate(from); // ✅ Go back to previous route
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-container login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login to JustCoding" : "Register for JustCoding"}</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {isLogin && (
          <p
            className="forgot-password"
            onClick={handleResetPassword}
            style={{
              textAlign: 'right',
              cursor: 'pointer',
              color: '#007bff',
              fontSize: '0.9rem',
              marginTop: '-10px',
              marginBottom: '15px'
            }}
          >
            Forgot Password?
          </p>
        )}

        <button type="submit">
          {isLogin ? "Login" : "Sign Up"}
        </button>

        <p className="toggle-mode">
          {isLogin ? "Don't have an account?" : "Already registered?"}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Sign Up" : " Login"}
          </span>
        </p>
      </form>

      <div className="google-signin-container">
        <button className="google-button" onClick={handleGoogleSignIn}>
          <FcGoogle size={20} style={{ marginRight: "8px" }} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
