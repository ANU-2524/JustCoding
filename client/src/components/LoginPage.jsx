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
import "../Style/LoginPage.css";
import { FcGoogle } from "react-icons/fc";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // ✅ used to detect original page

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
    alert("Enter your email first");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset link sent. Check your email.");
  } catch (error) {
    switch (error.code) {
      case "auth/user-not-found":
        alert("No account found with this email");
        break;
      case "auth/invalid-email":
        alert("Invalid email address");
        break;
      default:
        alert(error.message);
    }
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
    <div className="login-container">
      <div className="login-page">
        <div className="login-left">
          <div className="login-content-wrapper">
            <div className="login-header">
              <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
              <p className="subtitle">{isLogin ? "Sign in to continue to JustCoding" : "Join us to start coding"}</p>
            </div>
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="input-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isLogin && (
                <div className="form-footer">
                  <p
                    className="forgot-password"
                    onClick={handleResetPassword}
                  >
                    Forgot Password?
                  </p>
                </div>
              )}

              <button type="submit" className="auth-button">
                {isLogin ? "Login" : "Create Account"}
              </button>

              <div className="divider">
                <span>or</span>
              </div>
            </form>

            <div className="google-signin-container">
              <button className="google-button" onClick={handleGoogleSignIn}>
                <FcGoogle size={20} style={{ marginRight: "8px" }} />
                {isLogin ? "Sign in with Google" : "Sign up with Google"}
              </button>
            </div>
            
            <div className="switch-mode">
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <span onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? " Sign Up" : " Login"}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="login-right">
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&h=800&q=80" alt="Coding" className="login-right-image" />
          <div className="login-right-content">
            <h3>JustCoding</h3>
            <p>Experience seamless collaborative coding with our powerful editor. Connect with developers worldwide and enhance your skills.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
