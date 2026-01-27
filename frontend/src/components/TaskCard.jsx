import React from "react";
import { TbTrash, TbCalendar, TbCircle, TbCircleCheckFilled } from "react-icons/tb";
import "./TaskCard.css";

function getTimeLeft(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return null;
  const now = new Date();
  const diff = due - now;
  if (diff <= 0) return "Overdue";

  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) return `${days}d ${hours}h left`;
  return `${totalHours}h left`;
}

export default function TaskCard({ task, onToggle, onDelete, onOpen }) {
  if (!task) return null;

  const handleCardClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    onOpen && onOpen();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  const timeLeft = getTimeLeft(task.due_date);

  return (
    <div
      className={`task-card ${task.completed ? "completed" : ""} ${task.priority ? `priority-${task.priority}` : ''}`}
      title={task.title}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-pressed={!!task.completed}
    >
      {/* DELETE BUTTON - Top Right Corner */}
      <button
        className="task-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete && onDelete();
        }}
        aria-label="Delete task"
      >
        <TbTrash />
      </button>

      {/* TOP ROW: Checkbox Icon + Title + Priority Badge */}
      <div className="task-top-row">
        <div className="task-checkbox-icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggle && onToggle();
          }}
          role="button"
          tabIndex={0}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed ? (
            <TbCircleCheckFilled className="checkbox-filled" />
          ) : (
            <TbCircle className="checkbox-empty" />
          )}
        </div>
        
        <div className="task-title">{task.title}</div>
        
        {task.priority && (
          <span 
            className={`task-priority-badge priority-${task.priority}`}
            title={`Priority: ${task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}`}
          >
            {task.priority === 3 ? 'H' : task.priority === 2 ? 'M' : 'L'}
          </span>
        )}
      </div>

      {/* BOTTOM ROW: Date (left) and Timer Badge (right) */}
      {task.due_date && (
        <div className="task-bottom-row">
          <div className="task-due">
            <TbCalendar />
            <span>
              {new Date(task.due_date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {timeLeft && (
            <div
              className={`task-timer ${
                timeLeft === "Overdue" ? "overdue" : ""
              }`}
            >
              {timeLeft}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
