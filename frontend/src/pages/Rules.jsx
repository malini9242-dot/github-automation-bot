import React, { useState, useEffect } from "react";
import API from "../services/api";

function Rules({ repositories }) {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form fields
    const [selectedRepo, setSelectedRepo] = useState("");
    const [selectedEvent, setSelectedEvent] = useState("push");
    const [selectedAction, setSelectedAction] = useState("notification");

    // Connected repositories only
    const connectedRepos = repositories.filter(repo => repo.webhook_installed);

    useEffect(() => {
        fetchRules();
    }, []);

    useEffect(() => {
        if (connectedRepos.length > 0 && !selectedRepo) {
            setSelectedRepo(connectedRepos[0].id || connectedRepos[0].repo_id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [repositories, connectedRepos]);

    const fetchRules = async () => {
        setLoading(true);
        try {
            const res = await API.get("/rules/");
            setRules(res.data);
        } catch (err) {
            console.error("Failed to fetch rules", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        if (!selectedRepo) {
            alert("Please select a connected repository first.");
            return;
        }
        setSubmitting(true);
        try {
            const res = await API.post("/rules/", {
                repository_id: selectedRepo,
                event_type: selectedEvent,
                action_type: selectedAction
            });
            setRules([res.data, ...rules]);
            alert("Automation rule created successfully!");
        } catch (err) {
            console.error("Failed to create rule", err);
            alert("Error creating automation rule.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleRule = async (ruleId, currentActive) => {
        try {
            const res = await API.patch(`/rules/${ruleId}/`, {
                active: !currentActive
            });
            setRules(rules.map(r => r.id === ruleId ? res.data : r));
        } catch (err) {
            console.error("Failed to toggle rule", err);
        }
    };

    const handleDeleteRule = async (ruleId) => {
        if (!window.confirm("Are you sure you want to delete this rule?")) return;
        try {
            await API.delete(`/rules/${ruleId}/`);
            setRules(rules.filter(r => r.id !== ruleId));
        } catch (err) {
            console.error("Failed to delete rule", err);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Automation Rules</h1>
                <p style={styles.subtitle}>Define how the bot handles repository webhooks automatically.</p>
            </div>

            <div className="rules-grid" style={styles.grid}>
                {/* Rule Form */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Create New Rule</h2>
                    <form onSubmit={handleCreateRule} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Connected Repository</label>
                            {connectedRepos.length === 0 ? (
                                <p style={styles.warningText}>
                                    ⚠ No connected repositories. Please connect a repository in the Repositories tab first.
                                </p>
                            ) : (
                                <select 
                                    value={selectedRepo} 
                                    onChange={(e) => setSelectedRepo(e.target.value)}
                                    style={styles.select}
                                >
                                    <option value="" disabled>Select a repository...</option>
                                    {connectedRepos.map(repo => (
                                        <option key={repo.id || repo.repo_id} value={repo.id || repo.repo_id}>
                                            {repo.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>GitHub Event Trigger</label>
                            <select 
                                value={selectedEvent} 
                                onChange={(e) => setSelectedEvent(e.target.value)}
                                style={styles.select}
                            >
                                <option value="push">Push Event</option>
                                <option value="pull_request">Pull Request Event</option>
                                <option value="issues">Issue Event</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Action Response</label>
                            <select 
                                value={selectedAction} 
                                onChange={(e) => setSelectedAction(e.target.value)}
                                style={styles.select}
                            >
                                <option value="notification">Create Notification</option>
                                <option value="log">Save Log Event</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting || connectedRepos.length === 0}
                            style={styles.submitBtn}
                        >
                            {submitting ? "Creating..." : "Add Rule"}
                        </button>
                    </form>
                </div>

                {/* Rules List */}
                <div style={styles.listCard}>
                    <h2 style={styles.cardTitle}>Active Rules ({rules.length})</h2>
                    {loading ? (
                        <p style={styles.loadingText}>Loading rules...</p>
                    ) : rules.length === 0 ? (
                        <div style={styles.emptyState}>No automation rules configured.</div>
                    ) : (
                        <div style={styles.listContainer}>
                            {rules.map(rule => (
                                <div key={rule.id} style={styles.ruleItem}>
                                    <div style={styles.ruleDetails}>
                                        <h3 style={styles.ruleRepo}>{rule.repository_name}</h3>
                                        <div style={styles.ruleMeta}>
                                            <span style={styles.metaBadge}>⚡ {rule.event_type}</span>
                                            <span style={styles.metaBadge}>⚙ {rule.action_type === 'notification' ? 'Notify' : 'Log'}</span>
                                        </div>
                                    </div>
                                    <div style={styles.ruleActions}>
                                        <button 
                                            onClick={() => handleToggleRule(rule.id, rule.active)}
                                            style={rule.active ? styles.activeToggle : styles.inactiveToggle}
                                        >
                                            {rule.active ? "Active" : "Paused"}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteRule(rule.id)}
                                            style={styles.deleteBtn}
                                        >
                                            🗑 Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        width: "100%",
    },
    header: {
        marginBottom: "30px",
    },
    title: {
        fontSize: "28px",
        color: "#ffffff",
        margin: "0 0 5px 0",
    },
    subtitle: {
        color: "#94a3b8",
        fontSize: "15px",
        margin: 0,
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px",
    },
    card: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "30px",
        height: "fit-content",
    },
    listCard: {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "20px",
        padding: "30px",
        display: "flex",
        flexDirection: "column",
    },
    cardTitle: {
        fontSize: "20px",
        color: "#ffffff",
        margin: "0 0 20px 0",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "10px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        color: "#cbd5e1",
        fontSize: "14px",
        fontWeight: "500",
    },
    select: {
        padding: "12px 16px",
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        color: "white",
        fontSize: "14px",
        outline: "none",
        cursor: "pointer",
        width: "100%",
    },
    submitBtn: {
        padding: "14px",
        background: "#6366f1",
        color: "white",
        border: "none",
        borderRadius: "12px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginTop: "10px",
    },
    warningText: {
        color: "#fca5a5",
        fontSize: "13px",
        margin: 0,
    },
    loadingText: {
        color: "#94a3b8",
        textAlign: "center",
    },
    emptyState: {
        color: "#94a3b8",
        textAlign: "center",
        padding: "40px 0",
    },
    listContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    ruleItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderRadius: "14px",
        gap: "10px",
    },
    ruleDetails: {
        flex: 1,
    },
    ruleRepo: {
        margin: "0 0 8px 0",
        fontSize: "16px",
        color: "#ffffff",
        fontWeight: "600",
        wordBreak: "break-all",
    },
    ruleMeta: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
    },
    metaBadge: {
        padding: "4px 8px",
        background: "rgba(255, 255, 255, 0.06)",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#cbd5e1",
    },
    ruleActions: {
        display: "flex",
        gap: "10px",
        flexShrink: 0,
    },
    activeToggle: {
        padding: "8px 12px",
        background: "rgba(16, 185, 129, 0.15)",
        color: "#34d399",
        border: "1px solid rgba(16, 185, 129, 0.25)",
        borderRadius: "8px",
        fontSize: "12px",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },
    inactiveToggle: {
        padding: "8px 12px",
        background: "rgba(100, 116, 139, 0.15)",
        color: "#94a3b8",
        border: "1px solid rgba(100, 116, 139, 0.25)",
        borderRadius: "8px",
        fontSize: "12px",
        cursor: "pointer",
        whiteSpace: "nowrap",
    },
    deleteBtn: {
        padding: "8px 12px",
        background: "rgba(239, 68, 68, 0.15)",
        color: "#fca5a5",
        border: "1px solid rgba(239, 68, 68, 0.25)",
        borderRadius: "8px",
        fontSize: "12px",
        cursor: "pointer",
        whiteSpace: "nowrap",
    }
};

export default Rules;
