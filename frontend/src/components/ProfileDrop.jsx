import React, { useEffect, useRef, useState } from 'react';
import './ProfileDrop.css';

export default function ProfileDrop({ userEmail, onLogout, onClose }) {
    const dropdownRef = useRef(null);
    const [currentTheme, setCurrentTheme] = useState(
        localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    // Apply saved theme on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const handleThemeChange = (theme) => {
        setCurrentTheme(theme);
        localStorage.setItem('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    };

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <div className="profile-header">
                <span className="profile-label">Signed in as</span>
                <span className="profile-email">{userEmail}</span>
            </div>

            <div className="profile-section">
                <span className="profile-label">Theme</span>
                <div className="theme-toggle">
                    <button 
                        className={`theme-btn ${currentTheme === 'light' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('light')}
                    >
                        Light
                    </button>
                    <button 
                        className={`theme-btn ${currentTheme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('dark')}
                    >
                        Dark
                    </button>
                </div>
            </div>

            <div className="profile-actions">
                <button className="logout-btn" onClick={onLogout}>
                    Sign Out
                </button>
            </div>
        </div>
    );
}
