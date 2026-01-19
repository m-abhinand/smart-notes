import React, { useEffect, useRef } from 'react';
import './ProfileDrop.css';
import handImg from '../assets/hand.jpg';
import pencilImg from '../assets/pencil.jpg';
import stormImg from '../assets/storm.jpg';

export default function ProfileDrop({ userEmail, onLogout, onClose, onBackgroundChange, currentBackground }) {
    const dropdownRef = useRef(null);

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

    const colors = [
        { id: 'default', label: 'Default', value: '' }, // Renders as 'none' reset
        { id: 'warm', label: 'Warm', value: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
        { id: 'cool', label: 'Cool', value: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)' },
        { id: 'ocean', label: 'Ocean', value: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
        { id: 'dusk', label: 'Dusk', value: 'linear-gradient(to top, #5f72bd 0%, #9b23ea 100%)' },
        { id: 'forest', label: 'Forest', value: 'linear-gradient(to top, #0ba360 0%, #3cba92 100%)' },
    ];

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <div className="profile-header">
                <span className="profile-label">Signed in as</span>
                <span className="profile-email">{userEmail}</span>
            </div>

            <div className="profile-section">
                <span className="profile-label">Theme Color</span>
                <div className="background-options">
                    {colors.map((color) => (
                        <div 
                            key={color.id}
                            className={`bg-option ${currentBackground === color.value ? 'active' : ''}`}
                            onClick={() => onBackgroundChange(color.value)}
                            title={color.label}
                            style={{ background: color.value || 'var(--secondary-color)' }}
                        >
                           {color.id === 'default' && (
                               <div className="bg-option-none" title="Default" />
                           )}
                        </div>
                    ))}
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
