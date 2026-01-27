import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TbFileText, TbChecklist, TbLock, TbTrash, TbChevronLeft, TbChevronRight, TbSettings } from "react-icons/tb";
import "./Menu.css";

export default function Menu({ onSelectCategory, onCollapseChange, onLockedClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const categories = [
    { id: "notes", label: "Notes", icon: <TbFileText /> },
    { id: "tasks", label: "Tasks", icon: <TbChecklist /> },
    { id: "locked", label: "Locked", icon: <TbLock /> },
    { id: "trash", label: "Trash", icon: <TbTrash /> },
  ];

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (onCollapseChange) onCollapseChange(next);
  };

  const go = (id) => {
    if (onSelectCategory) onSelectCategory(id);
    
    // Special handling for locked - show PIN modal instead of navigating
    if (id === "locked" && onLockedClick) {
      onLockedClick();
      return;
    }
    
    // basic routing mapping (other routes can be implemented later)
    if (id === "notes") navigate("/notes");
    else navigate(`/${id}`);
  };

  const isActive = (id) => {
    if (id === "notes") return location.pathname === "/notes";
    return location.pathname === `/${id}`;
  };

  return (
    <div className={`menu ${collapsed ? "collapsed" : ""}`}>
      <div
        className="menu-header"
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
      >
        {collapsed ? (
          <div className="menu-icon"><TbChevronRight /></div>
        ) : (
          <div className="menu-icon"><TbChevronLeft /></div>
        )}
        <span className={`menu-label ${collapsed ? "hidden" : ""}`}>Menu</span>
      </div>
      <ul className="menu-list">
        {categories.map((category) => (
          <li
            key={category.id}
            className={`menu-item ${category.id} ${isActive(category.id) ? "active" : ""}`}
            onClick={() => go(category.id)}
          >
            <div className="menu-icon">{category.icon}</div>
            <span className={`menu-label ${collapsed ? "hidden" : ""}`}>
              {category.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer with settings anchored to bottom */}
      <div className="menu-footer">
        <div
          className={`menu-item settings ${isActive("settings") ? "active" : ""}`}
          onClick={() => go("settings")}
        >
          <div className="menu-icon">
            <TbSettings />
          </div>
          <span className={`menu-label ${collapsed ? "hidden" : ""}`}>
            Settings
          </span>
        </div>
      </div>
    </div>
  );
}
