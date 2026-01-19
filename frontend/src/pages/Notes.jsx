import { useEffect, useState, useRef, useMemo } from "react";
import api from "../api/client";
import NewNote from "../components/newNote";
import Menu from "../components/Menu";
import "./Notes.css";

export default function Notes({ token, userEmail, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotes = async () => {
    const res = await api.get(`/notes?token=${token}`);
    setNotes(res.data);
  };

  const createNote = async (note) => {
    await api.post(`/notes?token=${token}`, {
      title: note.title,
      content: note.content,
      tags: [],
    });
    fetchNotes();
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleMenuCollapse = (collapsed) => {
    setMenuCollapsed(collapsed);
  };

  const containerStyle = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    const menuLeft = parseInt(root.getPropertyValue("--menu-left-offset")) || 16;
    const openWidth = parseInt(root.getPropertyValue("--menu-width-open")) || 250;
    const collapsedWidth =
      parseInt(root.getPropertyValue("--menu-width-collapsed")) || 56;
    const gap = parseInt(root.getPropertyValue("--menu-gap")) || 24;
    const menuW = menuCollapsed ? collapsedWidth : openWidth;
    return { paddingLeft: `${menuLeft + menuW + gap}px` };
  }, [menuCollapsed]);

  return (
    <>
      <Menu onCollapseChange={handleMenuCollapse} />
      <div className="top-bar">
        <div className="top-bar__left">Smart Notes</div>
        <div className="top-bar__right" ref={dropdownRef}>
          <div
            className="user-icon"
            onClick={() => setDropdownOpen((v) => !v)}
            tabIndex={0}
            aria-label="User menu"
          >
            <svg height="28" width="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="var(--primary-color)" />
              <ellipse
                cx="12"
                cy="17"
                rx="7"
                ry="4"
                fill="var(--primary-color)"
                opacity="0.5"
              />
            </svg>
          </div>
          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="user-email">{userEmail}</div>
              <button className="logout-button" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="notes-container" style={containerStyle}>
        <ul className="notes-grid">
          {notes.map((n) => (
            <li key={n.id} className="note-card">
              <b>{n.title}</b>
              <p>{n.content}</p>
            </li>
          ))}
        </ul>
        <button
          className="floating-add-button"
          onClick={() => setShowNewNote(true)}
        >
          +
        </button>
        {showNewNote && (
          <NewNote
            onClose={() => setShowNewNote(false)}
            onCreate={createNote}
          />
        )}
      </div>
    </>
  );
}
