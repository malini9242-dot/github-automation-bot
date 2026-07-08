import "./ActivityTimeline.css";
function ActivityTimeline({ notifications }) {
    return (
        <div className="timeline-container">

            <h2 className="timeline-title">
                Recent Activity
            </h2>

            {
                notifications.length === 0 ? (
                    <p>No activity found.</p>
                ) : (
                    notifications.map((item) => (
                        <div
                            className="timeline-item"
                            key={item.id}
                        >
                            <div className="timeline-icon">
                                {
                                    item.event_type === "push"
                                    ? "🟢"
                                    : item.event_type === "pull_request"
                                    ? "🟡"
                                    : item.event_type === "issues"
                                    ? "🔵"
                                    : "⚪"
                                }
                            </div>

                            <div className="timeline-content">
                                <h4>
{
    item.event_type === "push"
    ? "🚀 Push Event Received"

    : item.event_type === "pull_request"
    ? "🔀 Pull Request Opened"

    : item.event_type === "issues"
    ? "🐞 Issue Created"

    : item.event_type === "repository"
    ? "📦 Repository Connected"

    : item.event_type
}
</h4>

                                <p>
                                    {item.repository}
                                </p>

                                <small>
                                    {new Date(
                                        item.created_at
                                    ).toLocaleString()}
                                </small>
                            </div>
                        </div>
                    ))
                )
            }

        </div>
    );
}

export default ActivityTimeline;