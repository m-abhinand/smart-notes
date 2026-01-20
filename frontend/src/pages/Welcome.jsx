import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit3,
  FiSearch,
  FiLock,
  FiLayout,
  FiCpu,
  FiArrowRight,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import NotebookPreview from "./NotebookPreview";
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  const fullText =
    "A clean, intelligent space to write, organize, and find your thoughts — instantly.";

  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    if (index < fullText.length) {
      const t = setTimeout(() => {
        setText(prev => prev + fullText[index]);
        setIndex(i => i + 1);
      }, 28);
      return () => clearTimeout(t);
    }
  }, [index, fullText]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="welcome-page">
      {/* Theme Toggle */}
      <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
        {theme === "light" ? <FiMoon /> : <FiSun />}
      </button>

      {/* LEFT */}
      <div className="welcome-left">
        <h1 className="welcome-title">Smart Notes</h1>

        <p className="welcome-description">
          {text}
          <span className="cursor" />
        </p>

        <ul className="feature-list">
          <li><FiEdit3 className="icon accent" />Minimal, distraction-free writing</li>
          <li><FiSearch className="icon accent" />Fast search & smart sorting</li>
          <li><FiLayout className="icon accent" />Structured notes, your way</li>
          <li><FiLock className="icon accent" />Private & secure by default</li>
          <li><FiCpu className="icon accent" />AI-powered features coming soon</li>
        </ul>

        <div className="welcome-actions">
          <button className="cta-button" onClick={() => navigate("/login")}>
            Dive in <FiArrowRight className="arrow-icon" />
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <NotebookPreview />
    </div>
  );
}
