import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  FiHome,
  FiBell,
  FiUser,
  FiLogOut,
  FiMoreHorizontal,
} from "react-icons/fi";
import Avatar from "../common/Avatar";

const Logo = () => (
  <span className="text-2xl font-bold text-ink-primary tracking-tight">
    twitt
  </span>
);

const Sidebar = ({ authUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Logout failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/login");
    },
    onError: (err) => toast.error(err.message),
  });

  const navLinks = [
    { path: "/", label: "Home", icon: FiHome },
    { path: "/notifications", label: "Notifications", icon: FiBell },
    {
      path: `/profile/${authUser.username}`,
      label: "Profile",
      icon: FiUser,
    },
  ];

  return (
    <aside className="sticky top-0 h-screen flex flex-col py-2 px-3">
      {/* Logo */}
      <Link to="/" className="p-3 rounded-full hover:bg-surface-3 transition-colors w-fit mb-2">
        <XLogo />
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navLinks.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={22} />
              <span className="hidden xl:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Post button */}
      <Link
        to="/"
        className="btn-primary text-center mb-4 hidden xl:block"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Post
      </Link>
      <Link
        to="/"
        className="btn-primary p-3 rounded-full flex items-center justify-center mb-4 xl:hidden w-fit"
      >
        <span className="text-lg font-bold">+</span>
      </Link>

      {/* User info */}
      <div className="flex items-center gap-3 px-3 py-3 rounded-full hover:bg-surface-3 transition-colors cursor-pointer group">
        <Avatar user={authUser} size="sm" linkable={false} />
        <div className="flex-1 min-w-0 hidden xl:block">
          <p className="font-semibold text-sm text-ink-primary truncate">
            {authUser.fullName}
          </p>
          <p className="text-ink-secondary text-xs truncate">
            @{authUser.username}
          </p>
        </div>
        <button
          onClick={() => logout()}
          className="hidden xl:flex text-ink-secondary hover:text-red-500 transition-colors p-1"
          title="Logout"
        >
          <FiLogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;