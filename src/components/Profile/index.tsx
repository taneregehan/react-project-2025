import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";
import { useState, useEffect } from "react";

type ProfileCardProps = {
  profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatRoleName = (role: any) => {
    if (role && typeof role === "object" && role.name) {
      return role.name;
    }

    if (typeof role === "string") {
      try {
        const parsedRole = JSON.parse(role);
        if (parsedRole && typeof parsedRole === "object" && parsedRole.name) {
          return parsedRole.name;
        }
        return parsedRole?.toString() || "User";
      } catch (e) {
        return role || "User";
      }
    }

    return role?.toString() || "User";
  };

  const displayName = profile?.name || AuthSession.getName() || "User";
  const displayEmail = profile?.email || AuthSession.getEmail() || "No email available";
  const displayRole = profile?.role
    ? formatRoleName(profile.role)
    : formatRoleName(AuthSession.getRoles());

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "#19979c",
      "#ff8847",
      "#5a32a8",
      "#32a852",
      "#c0c033",
      "#a832a4",
      "#327ba8",
      "#3244a8",
      "#c2068a",
      "#108f7c",
    ];

    const hash = name.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  };

  const avatarColor = getAvatarColor(displayName);

  return (
    <div className={`profile-section ${animateIn ? "profile-animate-in" : ""}`}>
      <div
        className="profile-avatar"
        style={{
          background: avatarColor,
          color: "#ffffff",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          fontWeight: "bold",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        }}>
        <span>{getInitials(displayName)}</span>
      </div>
      <div className="profile-info">
        <h2 className="profile-name">Hoş geldin, {displayName}</h2>
        <div className="profile-details">
          <div className="profile-detail-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={avatarColor}
              width="18"
              height="18">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-.4 4.25l-7.07 4.42c-.32.2-.74.2-1.06 0L4.4 8.25c-.25-.16-.4-.43-.4-.72 0-.67.73-1.07 1.3-.72L12 11l6.7-4.19c.57-.35 1.3.05 1.3.72 0 .29-.15.56-.4.72z" />
            </svg>
            <span>{displayEmail}</span>
          </div>
          <div className="profile-detail-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={avatarColor}
              width="18"
              height="18">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z" />
            </svg>
            <span className="profile-role">{displayRole}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
