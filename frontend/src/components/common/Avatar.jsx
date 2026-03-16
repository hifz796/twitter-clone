import { Link } from "react-router-dom";

const Avatar = ({ user, size = "md", linkable = true }) => {
  const sizes = {
    xs: "w-7 h-7 text-xs",
    sm: "w-9 h-9 text-sm",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-24 h-24 text-2xl",
  };

  const initials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatar = (
    <div className={`${sizes[size]} avatar flex-shrink-0`}>
      {user?.profileImg ? (
        <img
          src={user.profileImg}
          alt={user.username}
          className={`${sizes[size]} avatar`}
        />
      ) : (
        <div
          className={`${sizes[size]} avatar bg-surface-3 flex items-center justify-center font-semibold text-ink-secondary`}
        >
          {initials || "?"}
        </div>
      )}
    </div>
  );

  if (linkable && user?.username) {
    return (
      <Link
        to={`/profile/${user.username}`}
        onClick={(e) => e.stopPropagation()}
      >
        {avatar}
      </Link>
    );
  }

  return avatar;
};

export default Avatar;