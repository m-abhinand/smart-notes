import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notes from "./pages/Notes";
import Tasks from "./pages/Tasks";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import Locked from "./pages/Locked";
import { lightTheme } from "./theme";

function App() {
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // Load token, email, and theme from localStorage on page load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("userEmail");
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUserEmail(savedEmail);
    }
    
    // Load and apply saved theme
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Save token and email to localStorage on login
  const handleLogin = (token, email) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    setToken(token);
    setUserEmail(email);
    navigate("/notes");
  };

  // Clear token and email from localStorage on logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setToken(null);
    setUserEmail("");
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route
        path="/login"
        element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/notes" replace />}
      />
      <Route
        path="/register"
        element={!token ? <Register /> : <Navigate to="/notes" replace />}
      />
      
      {/* Protected Layout Routes */}
      <Route
        element={token ? <Dashboard token={token} userEmail={userEmail} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route path="/notes" element={<Notes />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/locked" element={<Locked />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
