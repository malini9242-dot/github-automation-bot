import React, { useState } from "react";
import "./RepoCard.css";

function RepoCard({ repo, onConnect }) {
    const [connecting, setConnecting] = useState(false);

    const handleConnectClick = async () => {
        setConnecting(true);
        try {
            await onConnect(repo.id);
        } catch (err) {
            console.error(err);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="repo-card">
            <div className="repo-header">
                <h3>{repo.name}</h3>
                <span className={`privacy-badge ${repo.private ? "private" : "public"}`}>
                    {repo.private ? "🔒 Private" : "🌍 Public"}
                </span>
            </div>

            <p className="repo-desc">
                {repo.description || "No description provided."}
            </p>

            <div className="repo-footer">
                <span className="stars">⭐ {repo.stargazers_count || 0} Stars</span>
                {repo.webhook_installed ? (
                    <span className="badge connected">✓ Connected</span>
                ) : (
                    <button 
                        onClick={handleConnectClick} 
                        disabled={connecting}
                        className="connect-btn"
                    >
                        {connecting ? "Connecting..." : "Connect Webhook"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default RepoCard;