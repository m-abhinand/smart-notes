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
  const [filterCompleted, setFilterCompleted] = useState(null); // null = all, true/false filters
  const [notification, setNotification] = useState("");
  const [showSignOut, setShowSignOut] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks`, {
        params: {
          token,
          search: searchQuery || undefined,
          completed: filterCompleted === null ? undefined : filterCompleted,
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
      console.error("Create task failed", err);
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

  // Apply grid paper background like Notes page (respecting current theme and updates)
  useEffect(() => {
    const applyBackground = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      const isDark = theme === "dark";

      if (isDark) {
        document.body.style.backgroundColor = "#000000";
        document.body.style.backgroundImage = `
          linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
        `;
      } else {
        document.body.style.backgroundColor = "#fdfbf7";
        document.body.style.backgroundImage = `
          linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
        `;
      }

      document.body.style.backgroundSize = "20px 20px";
      document.body.style.backgroundAttachment = "fixed";
    };

    applyBackground();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          applyBackground();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Menu onCollapseChange={handleMenuCollapse} />
      <div className="top-bar">
        <div className="top-bar__left">Smart Notes</div>

        <div className="top-bar__center">
          <Search onSearch={setSearchQuery} onSort={setSortBy} />
        </div>

        <div className="top-bar__right">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterCompleted === null ? "active" : ""}`}
              onClick={() => setFilterCompleted(null)}
              title="All"
            >
              All
            </button>
            <button
              className={`filter-btn ${filterCompleted === false ? "active" : ""}`}
              onClick={() => setFilterCompleted(false)}
              title="Active"
            >
              Active
            </button>
            <button
              className={`filter-btn ${filterCompleted === true ? "active" : ""}`}
              onClick={() => setFilterCompleted(true)}
              title="Completed"
            >
              Done
            </button>
          </div>

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

      <div className="tasks-container" style={containerStyle}>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks yet</h3>
            <p>Click the button to add a task.</p>
          </div>
        ) : (
          <ul className="tasks-grid">
            {tasks.map((t) => (
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

        {/* Inline new-task widget that behaves like the "What's on your mind?" bar */}
        <NewTask onCreate={createTask} />

        <Notification message={notification} onClose={() => setNotification("")} />
        <SignOutModal
          isOpen={showSignOut}
          onClose={() => setShowSignOut(false)}
          onConfirm={onLogout}
        />
      </div>
    </>
  );
}
