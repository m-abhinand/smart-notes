import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notes from "./pages/Notes";
import { lightTheme } from "./theme";

function App() {
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // Load token and email from localStorage on page load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("userEmail");
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUserEmail(savedEmail);
    }
    document.documentElement.setAttribute("data-theme", "light");
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
    navigate("/login");
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/notes" replace />}
      />
      <Route
        path="/register"
        element={!token ? <Register /> : <Navigate to="/notes" replace />}
      />
      <Route
        path="/notes"
        element={token ? <Notes token={token} userEmail={userEmail} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<Navigate to={token ? "/notes" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={token ? "/notes" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
