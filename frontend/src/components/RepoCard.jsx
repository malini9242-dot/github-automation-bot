function RepoCard({ repo }) {
    return (
        <div className="repo-card">
            <h3>{repo.name}</h3>

            <p>
                {repo.private ? "🔒 Private" : "🌍 Public"}
            </p>

            <p>
                ⭐ {repo.stargazers_count || 0} Stars
            </p>
        </div>
    );
}

export default RepoCard;