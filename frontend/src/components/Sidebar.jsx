import React from "react";
import { FaHome, FaFolder, FaCog, FaBell, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

function Sidebar({ activeTab, onSelectTab, onLogout }) {
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: <FaHome /> },
        { id: "repositories", label: "Repositories", icon: <FaFolder /> },
        { id: "rules", label: "Automation Rules", icon: <FaCog /> },
        { id: "notifications", label: "Notifications", icon: <FaBell /> },
        { id: "activity", label: "Analytics", icon: <FaChartLine /> },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <span className="logo-icon">🤖</span>
                <h2>AutoBot</h2>
            </div>

            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
                        onClick={() => onSelectTab(item.id)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={onLogout}>
                    <FaSignOutAlt className="sidebar-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}

export default Sidebar;