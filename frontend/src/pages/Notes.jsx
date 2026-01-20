import { useEffect, useState, useRef, useMemo } from "react";
import { TbSearch, TbArrowsSort, TbCheck, TbPlus } from "react-icons/tb";
import api from "../api/client";
import NewNote from "../components/newNote";
import Menu from "../components/Menu";
import ProfileDrop from "../components/ProfileDrop";
import Search from "../components/Search";
import NoteOpen from "../components/NoteOpen";
import Notification from "../components/Notification";
import SignOutModal from "../components/SignOutModal";
import "./Notes.css";

export default function Notes({ token, userEmail, onLogout }) {
  const [notes, setNotes] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedNote, setSelectedNote] = useState(null);
  const [notification, setNotification] = useState("");
  const [showSignOut, setShowSignOut] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes`, {
        params: {
          token,
          search: searchQuery,
          sort: sortBy
        }
      });
      setNotes(res.data);
    } catch (error) {
      console.error("Failed to fetch notes", error);
    }
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
  }, [searchQuery, sortBy]);

  const handleMenuCollapse = (collapsed) => {
    setMenuCollapsed(collapsed);
  };

  // Apply grid paper background
  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme === 'dark';
    
    if (isDark) {
      // Dark theme - pitch black with subtle grid
      document.body.style.backgroundColor = '#000000';
      document.body.style.backgroundImage = `
        linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
      `;
    } else {
      // Light theme - warm paper with grid
      document.body.style.backgroundColor = '#fdfbf7';
      document.body.style.backgroundImage = `
        linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
      `;
    }
    document.body.style.backgroundSize = '20px 20px';
    document.body.style.backgroundAttachment = 'fixed';
    
    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          const newIsDark = newTheme === 'dark';
          
          if (newIsDark) {
            document.body.style.backgroundColor = '#000000';
            document.body.style.backgroundImage = `
              linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `;
          } else {
            document.body.style.backgroundColor = '#fdfbf7';
            document.body.style.backgroundImage = `
              linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `;
          }
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

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

  const updateNote = async (id, updatedData) => {
    try {
      await api.put(`/notes/${id}?token=${token}`, updatedData);
      fetchNotes();
      setSelectedNote((prev) => ({ ...prev, ...updatedData }));
      setNotification("Note saved successfully");
    } catch (error) {
      console.error("Failed to update note", error);
    }
  };

  return (
    <>
      <Menu onCollapseChange={handleMenuCollapse} />
      <div className="top-bar">
        <div className="top-bar__left">Smart Notes</div>
        
        <div className="top-bar__center">
          <Search onSearch={setSearchQuery} onSort={setSortBy} />
        </div>

        <div className="top-bar__right">
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
            <ProfileDrop 
              userEmail={userEmail} 
              onLogout={() => {
                setDropdownOpen(false);
                setShowSignOut(true);
              }}
              onClose={() => setDropdownOpen(false)}
            />
          )}
        </div>
      </div>
      <div className="notes-container" style={containerStyle}>
        {notes.length === 0 ? (
          <div className="empty-state">
            <h3>No notes yet</h3>
            <p>Click the + button to create your first note.</p>
          </div>
        ) : (
          <ul className="notes-grid">
            {notes.map((n) => (
              <li 
                key={n.id} 
                className="note-card"
                onClick={() => setSelectedNote(n)}
              >
                <b>{n.title}</b>
                <p>{n.content}</p>
              </li>
            ))}
          </ul>
        )}
        <NewNote
          onClose={() => setShowNewNote(false)}
          onCreate={createNote}
        />
        {selectedNote && (
          <NoteOpen 
            note={selectedNote} 
            onClose={() => setSelectedNote(null)} 
            onUpdate={updateNote}
          />
        )}
        <Notification 
          message={notification} 
          onClose={() => setNotification("")} 
        />
        <SignOutModal 
          isOpen={showSignOut}
          onClose={() => setShowSignOut(false)}
          onConfirm={onLogout}
        />
      </div>
    </>
  );
}
