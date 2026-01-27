import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../api/client";
import { TbFileText, TbCheckbox } from "react-icons/tb";
import "./Locked.css";
import "./Notes.css"; // Reuse note card styles

export default function Locked() {
  const { token } = useOutletContext();
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLockedContent();
  }, [token]);

  const fetchLockedContent = async () => {
    try {
      const nRes = await api.get(`/notes`, {
        params: { token, locked: true }
      });
      setNotes(nRes.data);
      
      const tRes = await api.get(`/tasks`, {
        params: { token, locked: true }
      });
      setTasks(tRes.data);
    } catch (e) {
      console.error("Failed to fetch locked content:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="locked-container">
        <div className="loading-message">Loading locked content...</div>
      </div>
    );
  }

  return (
    <div className="locked-content-container">
      <div className="locked-section">
        <h3><TbFileText /> Locked Notes ({notes.length})</h3>
        {notes.length === 0 ? (
          <div className="locked-empty">No locked notes</div>
        ) : (
          <ul className="notes-grid">
            {notes.map(n => (
              <li key={n.id} className={`note-card ${n.color || ''}`}>
                <b>{n.title}</b>
                <p>{n.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="locked-section">
        <h3><TbCheckbox /> Locked Tasks ({tasks.length})</h3>
        {tasks.length === 0 ? (
          <div className="locked-empty">No locked tasks</div>
        ) : (
          <div className="notes-grid">
            {tasks.map(t => (
              <div key={t.id} className="note-card">
                <b>{t.title}</b>
                <p>{t.description}</p>
                {t.due_date && (
                  <small style={{display:'block', marginTop:'0.5rem', opacity:0.6}}>
                    Due: {new Date(t.due_date).toLocaleDateString()}
                  </small>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
