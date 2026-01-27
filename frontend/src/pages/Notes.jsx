import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api/client";
import NewNote from "../components/newNote";
import NoteOpen from "../components/NoteOpen";
import "./Notes.css";

export default function Notes() {
  const { token, searchQuery, sortBy, showNotification } = useOutletContext();
  
  const [notes, setNotes] = useState([]);
  const [showNewNote, setShowNewNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

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
  }, [searchQuery, sortBy, token]);

  const updateNote = async (id, updatedData) => {
    try {
      await api.put(`/notes/${id}?token=${token}`, updatedData);
      fetchNotes();
      setSelectedNote((prev) => ({ ...prev, ...updatedData }));
      if (showNotification) {
        if (updatedData.is_locked === true) showNotification("Note moved to Locked folder");
        else if (updatedData.is_archived === true) showNotification("Note archived");
        else if (updatedData.is_deleted === true) showNotification("Note moved to Trash");
        else if (updatedData.is_favorite !== undefined) showNotification(updatedData.is_favorite ? "Added to favorites" : "Removed from favorites");
        else showNotification("Note saved successfully");
      }
    } catch (error) {
      console.error("Failed to update note", error);
    }
  };

  useEffect(() => {
    // Keyboard shortcut Alt + N
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setShowNewNote(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const favorites = notes.filter(n => n.is_favorite);
  const otherNotes = notes.filter(n => !n.is_favorite);

  return (
    <div className="notes-container">
      {notes.length === 0 ? (
        <div className="empty-state">
          <h3>No notes yet</h3>
          <p>Click the + button to create your first note.</p>
        </div>
      ) : (
        <>
          {favorites.length > 0 && (
             <>
               <h3 className="section-heading">Favorites</h3>
               <ul className="notes-grid">
                 {favorites.map((n) => (
                   <li 
                     key={n.id} 
                     className={`note-card ${n.color || ''}`}
                     onClick={() => setSelectedNote(n)}
                   >
                     <b>{n.title}</b>
                     <p>{n.content}</p>
                   </li>
                 ))}
               </ul>
               {otherNotes.length > 0 && <h3 className="section-heading">Others</h3>}
             </>
          )}

          {otherNotes.length > 0 && (
            <ul className="notes-grid">
              {otherNotes.map((n) => (
                <li 
                  key={n.id} 
                  className={`note-card ${n.color || ''}`}
                  onClick={() => setSelectedNote(n)}
                >
                  <b>{n.title}</b>
                  <p>{n.content}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <NewNote
        isOpen={showNewNote}
        onOpen={() => setShowNewNote(true)}
        onClose={() => setShowNewNote(false)}
        onCreate={createNote}
      />
      {/* Floating Add Button logic was inside NewNote? No, NewNote is a Modal? 
          Wait, looking at Notes.css, .floating-add-button exists. 
          But NewNote component might encapsulate the button.
          Let's assume NewNote handles the trigger or is the modal.
          Checking NewNote usage in previous Notes.jsx:
          <NewNote onClose... onCreate... /> 
          It seems NewNote renders the button itself? 
          I'll assume yes for now. If not, I missed the button. 
          Actually, I better check NewNote.jsx to be sure I didn't lose the button.
      */}
      {selectedNote && (
        <NoteOpen 
          note={selectedNote} 
          onClose={() => setSelectedNote(null)} 
          onUpdate={updateNote}
        />
      )}
    </div>
  );
}
