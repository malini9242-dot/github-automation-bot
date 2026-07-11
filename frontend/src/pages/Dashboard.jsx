import "./Dashboard.css";
import React, { useState, useEffect } from "react";
import API from "../services/api";
import ActivityTimeline from "../components/ActivityTimeline";
import ProfileCard from "../components/ProfileCard";
import Sidebar from "../components/Sidebar";
import Repositories from "./Repositories";
import Rules from "./Rules";
import Login from "./Login";

function Dashboard() {
    const [profile, setProfile] = useState(null);
    const [repositories, setRepositories] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError("");
        try {
            const profileResponse = await API.get("/auth/profile/");
            setProfile(profileResponse.data);
            
            // If logged in successfully, fetch their repos and notifications
            fetchData();
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 404) {
                setProfile(null); // Force login screen
            } else {
                setError("Unable to connect to the backend server. Please make sure the backend is running.");
            }
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const repoResponse = await API.get("/github/repositories/");
            setRepositories(repoResponse.data);

            const notificationResponse = await API.get("/notifications/");
            setNotifications(notificationResponse.data);
        } catch (err) {
            console.error(err);
            setError("Unable to sync some github data, but you are logged in.");
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (repoId) => {
        await API.post("/github/connect/", { repo_id: repoId });
        // Re-sync repos to update their webhook_installed status
        const repoResponse = await API.get("/github/repositories/");
        setRepositories(repoResponse.data);
    };

    const handleLogout = async () => {
        if (!window.confirm("Are you sure you want to logout?")) return;
        try {
            await API.post("/auth/logout/");
            setProfile(null);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    // Show loading indicator during initial profile fetch
    if (loading && !profile && !error) {
        return (
            <div style={styles.fullscreenCenter}>
                <div className="loading-card" style={{ width: "300px" }}>
                    Loading AutoBot...
                </div>
            </div>
        );
    }

    // If profile is not found or null, show Login screen
    if (!profile) {
        return <Login />;
    }

    // Render Main Dashboard Grid
    return (
        <div className="dashboard-container">
            <div className="dashboard-grid">
                
                {/* Left Side: Sidebar */}
                <Sidebar 
                    activeTab={activeTab} 
                    onSelectTab={setActiveTab} 
                    onLogout={handleLogout} 
                />

                {/* Right Side: Tab Contents */}
                <div className="main-content" style={styles.mainContent}>
                    
                    {error && (
                        <div className="error-box">
                            ⚠ {error}
                        </div>
                    )}

                    {activeTab === "dashboard" && (
                        <div className="dashboard-view">
                            <div className="header" style={{ marginBottom: "30px" }}>
                                <h1>System Overview</h1>
                                <div className="user-box">
                                    Welcome, {profile.name || profile.username} 👋
                                </div>
                            </div>

                            <ProfileCard profile={profile} />

                            <div className="stats-container" style={{ margin: "30px 0" }}>
                                <div className="stat-card" onClick={() => setActiveTab("repositories")} style={{ cursor: "pointer" }}>
                                    <h2>{repositories.length}</h2>
                                    <p>Total Repositories</p>
                                </div>
                                <div className="stat-card" onClick={() => setActiveTab("notifications")} style={{ cursor: "pointer" }}>
                                    <h2>{notifications.length}</h2>
                                    <p>Events Logged</p>
                                </div>
                                <div className="stat-card" onClick={() => setActiveTab("rules")} style={{ cursor: "pointer" }}>
                                    <h2>{repositories.filter(r => r.webhook_installed).length}</h2>
                                    <p>Connected Webhooks</p>
                                </div>
                            </div>

                            <ActivityTimeline notifications={notifications.slice(0, 5)} />
                        </div>
                    )}

                    {activeTab === "repositories" && (
                        <Repositories 
                            repositories={repositories} 
                            loading={loading} 
                            onConnect={handleConnect} 
                        />
                    )}

                    {activeTab === "rules" && (
                        <Rules repositories={repositories} />
                    )}

                    {activeTab === "notifications" && (
                        <div className="notifications-view">
                            <div className="header" style={{ marginBottom: "25px" }}>
                                <div>
                                    <h1 style={{ margin: "0 0 5px 0" }}>Notifications Feed</h1>
                                    <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
                                        Complete log of all webhook signals processed by AutoBot.
                                    </p>
                                </div>
                            </div>
                            <ActivityTimeline notifications={notifications} />
                        </div>
                    )}

                    {activeTab === "activity" && (
                        <div className="analytics-view">
                            <div className="header" style={{ marginBottom: "30px" }}>
                                <div>
                                    <h1 style={{ margin: "0 0 5px 0" }}>System Analytics</h1>
                                    <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
                                        High-level insights of webhook trigger activities.
                                    </p>
                                </div>
                            </div>
                            
                            <div style={styles.analyticsGrid}>
                                <div style={styles.analyticsCard}>
                                    <h3>Event Distribution</h3>
                                    <div style={{ marginTop: "20px" }}>
                                        <p>🚀 Pushes: <strong>{notifications.filter(n => n.event_type === 'push').length}</strong></p>
                                        <p>🔀 Pull Requests: <strong>{notifications.filter(n => n.event_type === 'pull_request').length}</strong></p>
                                        <p>🐞 Issues: <strong>{notifications.filter(n => n.event_type === 'issues').length}</strong></p>
                                    </div>
                                </div>
                                
                                <div style={styles.analyticsCard}>
                                    <h3>Most Active Repositories</h3>
                                    <div style={{ marginTop: "20px" }}>
                                        {Object.entries(
                                            notifications.reduce((acc, curr) => {
                                                acc[curr.repository] = (acc[curr.repository] || 0) + 1;
                                                return acc;
                                            }, {})
                                        )
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 3)
                                        .map(([repo, count], i) => (
                                            <p key={repo}>{i+1}. {repo}: <strong>{count} hits</strong></p>
                                        ))}
                                        {notifications.length === 0 && <p style={{ color: "#94a3b8" }}>No active telemetry data.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

const styles = {
    fullscreenCenter: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b, #312e81)",
        color: "white",
    },
    mainContent: {
        padding: "10px",
        overflowY: "auto",
    },
    analyticsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginTop: "20px",
    },
    analyticsCard: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "30px",
    }
};

export default Dashboard;