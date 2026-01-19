import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });
    onLogin(res.data.access_token, email);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
        <div className="login-link" style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.9rem" }}>
             Don't have an account? <Link to="/register" style={{ color: "var(--primary-color)", textDecoration: "none" }}>Register</Link>
        </div>
      </div>
    </div>
  );
}
