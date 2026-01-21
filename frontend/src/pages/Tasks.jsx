import { useEffect, useState, useMemo } from "react";
import api from "../api/client";
import Menu from "../components/Menu";
import ProfileDrop from "../components/ProfileDrop";
import Search from "../components/Search";
import Notification from "../components/Notification";
import SignOutModal from "../components/SignOutModal";
import NewTask from "../components/NewTask";
import TaskCard from "../components/TaskCard";
import "./Tasks.css";

export default function Tasks({ token, userEmail, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterCompleted, setFilterCompleted] = useState(null);
  const [notification, setNotification] = useState("");
  const [showSignOut, setShowSignOut] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks`, {
        params: {
          token,
          search: searchQuery || undefined,
          completed:
            filterCompleted === null || filterCompleted === "due"
              ? undefined
              : filterCompleted,
          sort: sortBy,
        },
      });
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchQuery, sortBy, filterCompleted]);

  const createTask = async (payload) => {
    try {
      await api.post(`/tasks?token=${token}`, payload);
      setNotification("Task created");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await api.patch(
        `/tasks/${task.id}/complete`,
        null,
        { params: { token, completed: !task.completed } }
      );
      setNotification(task.completed ? "Marked incomplete" : "Marked complete");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const removeTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`, { params: { token } });
      setNotification("Task deleted");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

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

  const counts = useMemo(() => {
    const all = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const inProgress = tasks.filter(t => !t.completed).length;
    const due = tasks.filter(
      t => !t.completed && t.due_date && new Date(t.due_date) < new Date()
    ).length;
    return { all, completed, inProgress, due };
  }, [tasks]);

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
            onClick={() => setDropdownOpen(v => !v)}
          >
            <svg height="28" width="28" viewBox="0 0 24 24">
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

      <div className="tasks-container" style={containerStyle}>
        {/* FILTER BAR */}
        <div className="filter-bar">
          <button
            className={`filter-chip${filterCompleted === null ? " active" : ""}`}
            onClick={() => setFilterCompleted(null)}
          >
            All <span className="chip-count">{counts.all}</span>
          </button>
          <button
            className={`filter-chip${filterCompleted === false ? " active" : ""}`}
            onClick={() => setFilterCompleted(false)}
          >
            In Progress <span className="chip-count">{counts.inProgress}</span>
          </button>
          <button
            className={`filter-chip${filterCompleted === true ? " active" : ""}`}
            onClick={() => setFilterCompleted(true)}
          >
            Completed <span className="chip-count">{counts.completed}</span>
          </button>
          <button
            className={`filter-chip${filterCompleted === "due" ? " active" : ""}`}
            onClick={() => setFilterCompleted("due")}
          >
            Due <span className="chip-count">{counts.due}</span>
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Click the button to add a task.</p>
          </div>
        ) : (
          <ul className="tasks-grid">
            {tasks
              .filter(t => {
                if (filterCompleted === null) return true;
                if (filterCompleted === true) return t.completed;
                if (filterCompleted === false) return !t.completed;
                if (filterCompleted === "due")
                  return (
                    !t.completed &&
                    t.due_date &&
                    new Date(t.due_date) < new Date()
                  );
                return true;
              })
              .map(t => (
                <li key={t.id}>
                  <TaskCard
                    task={t}
                    onToggle={() => toggleComplete(t)}
                    onDelete={() => removeTask(t.id)}
                  />
                </li>
              ))}
          </ul>
        )}

        <NewTask onCreate={createTask} />
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
