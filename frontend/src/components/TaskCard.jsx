import React from "react";
import { TbTrash, TbCalendar } from "react-icons/tb";
import "./TaskCard.css";

export default function TaskCard({ task, onToggle, onDelete }) {
  return (
    <div className={`task-card ${task.completed ? "completed" : ""}`}>
      <div className="task-left">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggle}
          aria-label="Toggle complete"
        />
      </div>

      <div className="task-body">
        <div className="task-title">{task.title}</div>
        {task.description ? <div className="task-desc">{task.description}</div> : null}
        {task.due_date ? (
          <div className="task-due"><TbCalendar /> {new Date(task.due_date).toLocaleDateString()}</div>
        ) : null}
      </div>

      <div className="task-actions">
        <button className="task-delete" onClick={onDelete} title="Delete">
          <TbTrash />
        </button>
      </div>
    </div>
  );
}
