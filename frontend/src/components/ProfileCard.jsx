import "./ProfileCard.css";

function ProfileCard({ profile }) {
    return (
        <div className="profile-card">

            <img
                src={profile.avatar}
                alt="Profile"
                className="profile-avatar"
            />

            <h2>{profile.name || profile.username}</h2>

            <p className="username">
                @{profile.username}
            </p>

            <div className="profile-stats">

                <div className="profile-stat">
                    <h3>{profile.followers || 0}</h3>
                    <span>Followers</span>
                </div>

                <div className="profile-stat">
                    <h3>{profile.following || 0}</h3>
                    <span>Following</span>
                </div>

                <div className="profile-stat">
                    <h3>{profile.repositories || 0}</h3>
                    <span>Repos</span>
                </div>

            </div>

            <div className="profile-details">

                <p>
                    📧 {profile.email || "Email not public"}
                </p>

            </div>

        </div>
    );
}

export default ProfileCard;