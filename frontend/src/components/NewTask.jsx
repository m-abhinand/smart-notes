import { useState, useEffect } from "react";
import { TbX, TbDeviceFloppy, TbCalendar, TbFlag, TbClock, TbCornerDownLeft } from "react-icons/tb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./NewTask.css";

export default function NewTask({ onCreate, isOpen, onOpen, onClose }) {
  const getInitialDate = () => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  };

  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [priority, setPriority] = useState(2);
  const [loading, setLoading] = useState(false);

  const [internalExpanded, setInternalExpanded] = useState(false);
  const isControlled = isOpen !== undefined;
  const isExpanded = isControlled ? isOpen : internalExpanded;

  const handleOpen = () => {
    if (isControlled) onOpen && onOpen();
    else setInternalExpanded(true);
  };

  const handleClose = () => {
    reset();
    if (isControlled) onClose && onClose();
    else setInternalExpanded(false);
  };

  const reset = () => {
    setTitle("");
    setSelectedDate(getInitialDate());
    setPriority(2);
  };

  const setToday = () => {
    const now = new Date();
    const newD = new Date(selectedDate);
    newD.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    setSelectedDate(newD);
  };

  const setTomorrow = () => {
    const now = new Date();
    const tmrw = new Date(now);
    tmrw.setDate(tmrw.getDate() + 1);
    
    const newD = new Date(selectedDate);
    newD.setFullYear(tmrw.getFullYear(), tmrw.getMonth(), tmrw.getDate());
    setSelectedDate(newD);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onCreate({
        title: title.trim(),
        due_date: selectedDate.toISOString(),
        priority,
      });
      // reset is called in finally? or after? 
      // Original code: reset(); setIsExpanded(false);
      reset();
      handleClose(); // ensure close happens
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Shortcut Ctrl + Enter to save, Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isExpanded) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCreate();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, title, selectedDate, priority]);

  return (
    <div 
      className={`new-task-container ${isExpanded ? "expanded" : ""}`}
      onClick={(e) => {
        if (isExpanded && e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {!isExpanded ? (
        <div className="new-task-trigger" onClick={handleOpen}>
          <span className="trigger-text">Add a task…</span>
        </div>
      ) : (
        <div className="new-task-overlay">
          <div className="new-task-card compact">
            {/* HEADER */}
            <div className="task-modal-header">
              <input
                className="task-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                autoFocus
              />

              <div className="task-header-actions">
                <span className="shortcut-hint">Ctrl + <TbCornerDownLeft /></span>
                <button
                  className="task-save"
                  onClick={handleCreate}
                  disabled={loading}
                  title="Save (Ctrl + Enter)"
                >
                  <TbDeviceFloppy />
                </button>
                <button
                  className="task-close"
                  onClick={() => {
                    reset();
                    setIsExpanded(false);
                  }}
                >
                  <TbX />
                </button>
              </div>
            </div>

            {/* FOOTER */}
            <div className="task-footer compact">
              <div className="date-time-row">
                <div className="picker-wrapper">
                  <TbCalendar className="calendar-icon" />
                  <DatePicker 
                    selected={selectedDate} 
                    onChange={(date) => setSelectedDate(date)} 
                    dateFormat="MMM d, yyyy"
                    className="custom-datepicker-input"
                  />
                </div>
                
                <div className="picker-wrapper">
                  <TbClock className="calendar-icon" /> 
                  <input
                    type="time"
                    className="custom-datepicker-input time-input"
                    value={selectedDate.toTimeString().slice(0,5)}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(':');
                      const newDate = new Date(selectedDate);
                      newDate.setHours(parseInt(h), parseInt(m));
                      setSelectedDate(newDate);
                    }}
                  />
                </div>
              </div>

              <div className="priority-quick-select">
                <TbFlag />
                <button 
                  className={priority === 1 ? 'active low' : 'low'}
                  onClick={() => setPriority(1)}
                  title="Low priority"
                >
                  Low
                </button>
                <button 
                  className={priority === 2 ? 'active medium' : 'medium'}
                  onClick={() => setPriority(2)}
                  title="Medium priority"
                >
                  Medium
                </button>
                <button 
                  className={priority === 3 ? 'active high' : 'high'}
                  onClick={() => setPriority(3)}
                  title="High priority"
                >
                  High
                </button>
              </div>

              <div className="quick-dates">
                <button onClick={setToday}>Today</button>
                <button onClick={setTomorrow}>Tomorrow</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
