import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", {
        email,
        password,
      });
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Registration failed. User might already exist.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>Create Account</h2>
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
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
        <button onClick={handleRegister}>Sign Up</button>
        <div className="register-link">
             Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
