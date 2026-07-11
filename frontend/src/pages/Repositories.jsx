import React, { useState } from "react";
import RepoCard from "../components/RepoCard";
import "../pages/Dashboard.css";

function Repositories({ repositories, loading, onConnect }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    const filteredRepositories = repositories
        .filter((repo) => {
            const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase());
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
                return (b.stargazers_count || 0) - (a.stargazers_count || 0);
            }
            return 0;
        });

    return (
        <div>
            <div className="section-header" style={styles.header}>
                <div>
                    <h1 style={styles.title}>Your GitHub Repositories</h1>
                    <p style={styles.subtitle}>Connect repositories to enable webhook events and set up custom rules.</p>
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
                    All Repos
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
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="name">Name A-Z</option>
                    <option value="stars">Most Stars</option>
                </select>
            </div>

            <p className="repo-counter">
                Showing {filteredRepositories.length} of {repositories.length} repositories
            </p>

            {loading ? (
                <div className="loading-card">Loading repositories...</div>
            ) : filteredRepositories.length === 0 ? (
                <div className="empty-state">No repositories found 🔍</div>
            ) : (
                <div style={styles.grid}>
                    {filteredRepositories.map((repo) => (
                        <RepoCard key={repo.id} repo={repo} onConnect={onConnect} />
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    header: {
        marginBottom: "25px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "600",
        color: "#ffffff",
        margin: "0 0 5px 0",
    },
    subtitle: {
        fontSize: "15px",
        color: "#94a3b8",
        margin: 0,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
        marginTop: "20px",
    },
};

export default Repositories;
