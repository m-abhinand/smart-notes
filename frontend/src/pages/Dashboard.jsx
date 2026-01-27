import { useState, useMemo, useEffect } from "react";
import { Outlet, useOutletContext, useNavigate } from "react-router-dom";
import { TbCheck } from "react-icons/tb";
import Menu from "../components/Menu";
import ProfileDrop from "../components/ProfileDrop";
import Search from "../components/Search";
import Notification from "../components/Notification";
import SignOutModal from "../components/SignOutModal";
import Pin from "../components/Pin";
import KeyboardShortcuts from "../components/KeyboardShortcuts";
import api from "../api/client";
import "./Dashboard.css";

export default function Dashboard({ token, userEmail, onLogout }) {
  const navigate = useNavigate();
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [notification, setNotification] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinMode, setPinMode] = useState("verify");

  const handleMenuCollapse = (collapsed) => {
    setMenuCollapsed(collapsed);
  };

  const handleLockedNavigation = async () => {
    // Check if PIN exists
    try {
      const res = await api.get(`/auth/status`, { params: { token } });
      if (res.data.has_pin) {
        setPinMode("verify");
      } else {
        setPinMode("create");
      }
      setShowPinModal(true);
    } catch (e) {
      console.error("Failed to check PIN status:", e);
      setPinMode("create");
      setShowPinModal(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPinModal(false);
    if (pinMode === "create") {
      setNotification("PIN created successfully");
    } else {
      setNotification("Unlocked successfully");
    }
    navigate("/locked");
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
  };

  // Background theme effect (moved from Notes/Tasks to here so it runs once)
  useEffect(() => {
    const applyTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      const isDark = theme === 'dark';
      
      if (isDark) {
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
      document.body.style.backgroundSize = '20px 20px';
      document.body.style.backgroundAttachment = 'fixed';
    };

    applyTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          applyTheme();
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

  return (
    <>
      <Menu onCollapseChange={handleMenuCollapse} onLockedClick={handleLockedNavigation} />
      
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
              onShowShortcuts={() => {
                setDropdownOpen(false);
                setShowShortcuts(true);
              }}
            />
          )}
        </div>
      </div>

      <div className="dashboard-content" style={containerStyle}>
        <Outlet context={{ 
          token, 
          userEmail, 
          searchQuery, 
          sortBy, 
          menuCollapsed,
          showNotification: setNotification 
        }} />
      </div>

      <Notification 
        message={notification} 
        onClose={() => setNotification("")} 
      />
      
      <SignOutModal 
        isOpen={showSignOut}
        onClose={() => setShowSignOut(false)}
        onConfirm={onLogout}
      />

      <Pin
        mode={pinMode}
        token={token}
        isOpen={showPinModal}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
      />
      
      {showShortcuts && (
        <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
}
