import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronLeft, FiArrowLeft, FiSun, FiMoon } from "react-icons/fi";
import api from "../api/client";
import FeatureCarousel from "./FeatureCarousel";
import "./Login.css";

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register State
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      onLogin(res.data.access_token, email);
    } catch (e) {
      setError("Invalid credentials");
    }
  };

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", {
        email: regEmail,
        password: regPassword,
      });
      // Allow user to login immediately or auto-login
      // For now, switch to login view and pre-fill
      setEmail(regEmail);
      setIsRegistering(false);
      setError("");
      alert("Account created! Please login.");
    } catch (err) {
      console.error(err);
      setError("Registration failed. User may exist.");
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="login-page">
      {/* Theme Toggle */}
      <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
        {theme === "light" ? <FiMoon /> : <FiSun />}
      </button>

      {/* LEFT CONTAINER (STACK) */}
      <div className="login-left-container">
        
        {/* LOGIN CARD */}
        <div className={`auth-card login-card ${isRegistering ? "back" : "front"}`}>
          <h1 className="login-title">Welcome back</h1>
          
          <div className="login-fields">
            <label htmlFor="email">Email</label>
            <div className="input-box">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label htmlFor="password">Password</label>
            <div className="input-box">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="error-msg">{!isRegistering && error}</div>

          <button className="login-primary" onClick={handleLogin}>
            Login
          </button>

          <p className="login-footer">
            Don’t have an account? <span className="link-text" onClick={toggleMode}>Get started</span>
          </p>
        </div>

        {/* REGISTER CARD */}
        <div className={`auth-card register-card ${isRegistering ? "front" : "back"}`}>
           <h1 className="login-title">Join us</h1>

          <div className="login-fields">
            <label htmlFor="reg-email">Email</label>
            <div className="input-box">
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            <label htmlFor="reg-password">Password</label>
            <div className="input-box">
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="error-msg">{isRegistering && error}</div>

          <button className="login-primary" onClick={handleRegister}>
            Sign Up
          </button>

          <p className="login-footer">
            Already have an account? <span className="link-text" onClick={toggleMode}>Login</span>
          </p>
        </div>

      </div>

      {/* RIGHT */}
      <div className="login-right-container">
        <FeatureCarousel />
        
        <div className="home-link" onClick={() => navigate("/")}>
          <FiArrowLeft className="home-icon" />
          <span>Home</span>
        </div>
      </div>
    </div>
  );
}
