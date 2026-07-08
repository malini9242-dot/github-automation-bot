import "./Dashboard.css";
import React, { useState, useEffect } from "react";
import API from "../services/api";
import ActivityTimeline from "../components/ActivityTimeline";
import ProfileCard from "../components/ProfileCard";
import RepoCard from "../components/RepoCard";

function Dashboard() {
    const [profile, setProfile] = useState({});
    const [repositories, setRepositories] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const filteredRepositories = repositories
    .filter((repo) => {

        const matchesSearch =
            repo.name.toLowerCase().includes(
                search.toLowerCase()
            );

        const matchesFilter =
            filter === "all"
                ? true
                : filter === "public"
                ? !repo.private
                : repo.private;

        return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {

        if (sortBy === "name") {
            return a.name.localeCompare(b.name);
        }

        if (sortBy === "stars") {
            return (
                (b.stargazers_count || 0) -
                (a.stargazers_count || 0)
            );
        }

        return 0;
    });
    useEffect(() => {
    fetchData();
}, []);

const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
        const profileResponse =
            await API.get("/auth/profile/");

        setProfile(profileResponse.data);

        const repoResponse =
            await API.get("/github/repositories/");

        setRepositories(repoResponse.data);
        const notificationResponse =
            await API.get("/notifications/");
        setNotifications(notificationResponse.data);

    } catch (error) {
    console.error(error);

    setError(
        "Unable to load dashboard data. Please make sure the backend server is running."
    );
}
    setLoading(false);
};
    return (
        <div className="dashboard">
{
        error && (
            <div className="error-box">
                ⚠ {error}
            </div>
        )
    }
            <div className="header">
                <h1>GitHub Automation Bot</h1>
                <div className="user-box">
                    Welcome {profile.username} 👋
                </div>
            </div>
{
    loading ? (
        <div className="loading-card">
            Loading profile...
        </div>
    ) : (
        <ProfileCard profile={profile} />
    )
}
            <div className="stats-container">

                <div className="stat-card">
                    <h2>{repositories.length}</h2>
                    <p>Repositories</p>
                </div>

                <div className="stat-card">
                    <h2>{notifications.length}</h2>
                    <p>Notifications</p>
                </div>

                <div className="stat-card">
                    <h2>5</h2>
                    <p>Automation Rules</p>
                </div>

            </div>

            <input
    type="text"
    placeholder="🔍 Search repositories..."
    className="search-box"
    
    value={search}
    onChange={(e) => setSearch(e.target.value)}
/>
<div className="filter-container">

    <button
        className={filter === "all" ? "active-filter" : ""}
        onClick={() => setFilter("all")}
    >
        All
    </button>

    <button
        className={filter === "public" ? "active-filter" : ""}
        onClick={() => setFilter("public")}
    >
        Public
    </button>

    <button
        className={filter === "private" ? "active-filter" : ""}
        onClick={() => setFilter("private")}
    >
        Private
    </button>

    <select
        value={sortBy}
        onChange={(e) =>
            setSortBy(e.target.value)
        }
    >
        <option value="name">
            Name A-Z
        </option>

        <option value="stars">
            Most Stars
        </option>
    </select>

</div>
<p className="repo-counter">
    Showing {filteredRepositories.length}
    of {repositories.length}
    repositories
</p>
            {
    loading ? (

        <div className="loading-card">
            Loading repositories...
        </div>

    ) : (

        <div className="repo-container">

            {
                filteredRepositories.length === 0 ? (
                    <div className="empty-state">
                        No repositories found 🔍
                    </div>
                ) : (
                    filteredRepositories.map((repo) => (
                        <RepoCard
                            key={repo.id}
                            repo={repo}
                        />
                    ))
                )
            }

        </div>

    )
}
           {
loading ? (
    <div className="loading-card">
        Loading activity...
    </div>
) : (
    <ActivityTimeline
        notifications={notifications}
    />
)
}

            <div className="section-title">
                
            </div>

            

        </div>
    );
}

export default Dashboard;