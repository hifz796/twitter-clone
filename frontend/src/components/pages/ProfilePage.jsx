import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiEdit2, FiCalendar, FiLink, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Avatar from "../common/Avatar";
import PostFeed from "../common/PostFeed";
import LoadingSpinner from "../common/LoadingSpinner";

const tabs = [
  { id: "userPosts", label: "Posts" },
  { id: "likedPosts", label: "Likes" },
];

const ProfilePage = ({ authUser }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("userPosts");
  const [isEditing, setIsEditing] = useState(false);
  const coverRef = useRef(null);
  const avatarRef = useRef(null);

  const [editForm, setEditForm] = useState({
    fullName: "",
    bio: "",
    link: "",
    profileImg: null,
    coverImg: null,
    newPassword: "",
    currentPassword: "",
  });
  const [coverPreview, setCoverPreview] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`/api/users/profile/${username}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "User not found");
      return data;
    },
  });

  const { mutate: followUser, isPending: isFollowing } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/follow/${user._id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      setIsEditing(false);
      setCoverPreview(null);
      setAvatarPreview(null);
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const isOwnProfile = authUser._id === user?._id;
  const isFollowingUser = user?.followers?.includes(authUser._id);

  const handleImgChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "cover") {
        setCoverPreview(reader.result);
        setEditForm((prev) => ({ ...prev, coverImg: reader.result }));
      } else {
        setAvatarPreview(reader.result);
        setEditForm((prev) => ({ ...prev, profileImg: reader.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const openEdit = () => {
    setEditForm({
      fullName: user.fullName || "",
      bio: user.bio || "",
      link: user.link || "",
      profileImg: null,
      coverImg: null,
      newPassword: "",
      currentPassword: "",
    });
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-secondary">User not found</p>
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center gap-6 border-b border-surface-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost p-2"
        >
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-bold text-lg text-ink-primary leading-none">
            {user.fullName}
          </h1>
          <p className="text-ink-secondary text-sm">
            {user.followers?.length || 0} followers
          </p>
        </div>
      </header>

      {/* Cover image */}
      <div
        className="relative h-36 bg-surface-3 group cursor-pointer"
        onClick={() => isOwnProfile && isEditing && coverRef.current?.click()}
      >
        {(coverPreview || user.coverImg) && (
          <img
            src={coverPreview || user.coverImg}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        {isOwnProfile && isEditing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FiEdit2 size={20} className="text-white" />
          </div>
        )}
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImgChange(e, "cover")}
        />
      </div>

      {/* Profile info */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <div
            className="relative group cursor-pointer"
            onClick={() => isOwnProfile && isEditing && avatarRef.current?.click()}
          >
            <div className="w-20 h-20 rounded-full border-4 border-black overflow-hidden bg-surface-3">
              {(avatarPreview || user.profileImg) ? (
                <img
                  src={avatarPreview || user.profileImg}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-ink-secondary">
                  {user.fullName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {isOwnProfile && isEditing && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FiEdit2 size={16} className="text-white" />
              </div>
            )}
            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImgChange(e, "avatar")}
            />
          </div>

          <div>
            {isOwnProfile ? (
              isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setCoverPreview(null);
                      setAvatarPreview(null);
                    }}
                    className="btn-outline text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateProfile()}
                    disabled={isUpdating}
                    className="btn-primary text-sm"
                  >
                    {isUpdating ? <LoadingSpinner size="sm" /> : "Save"}
                  </button>
                </div>
              ) : (
                <button onClick={openEdit} className="btn-outline text-sm">
                  Edit profile
                </button>
              )
            ) : (
              <button
                onClick={() => followUser()}
                disabled={isFollowing}
                className={isFollowingUser ? "btn-outline text-sm" : "btn-primary text-sm"}
              >
                {isFollowing ? (
                  <LoadingSpinner size="sm" />
                ) : isFollowingUser ? (
                  "Unfollow"
                ) : (
                  "Follow"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Edit form */}
        {isOwnProfile && isEditing ? (
          <div className="space-y-3 mb-4">
            <input
              value={editForm.fullName}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, fullName: e.target.value }))
              }
              placeholder="Full name"
              className="input-field text-sm"
            />
            <textarea
              value={editForm.bio}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, bio: e.target.value }))
              }
              placeholder="Bio"
              rows={3}
              className="input-field text-sm resize-none"
            />
            <input
              value={editForm.link}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, link: e.target.value }))
              }
              placeholder="Website link"
              className="input-field text-sm"
            />
            <input
              value={editForm.currentPassword}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, currentPassword: e.target.value }))
              }
              type="password"
              placeholder="Current password (to change password)"
              className="input-field text-sm"
            />
            <input
              value={editForm.newPassword}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, newPassword: e.target.value }))
              }
              type="password"
              placeholder="New password"
              className="input-field text-sm"
            />
          </div>
        ) : (
          <div>
            <h2 className="font-bold text-xl text-ink-primary">
              {user.fullName}
            </h2>
            <p className="text-ink-secondary text-sm mb-2">
              @{user.username}
            </p>
            {user.bio && (
              <p className="text-ink-primary text-sm mb-3 leading-relaxed">
                {user.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-ink-secondary text-sm mb-3">
              {user.link && (
                <a
                  href={user.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-brand hover:underline"
                >
                  <FiLink size={13} />
                  {user.link.replace(/^https?:\/\//, "")}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <FiCalendar size={13} />
                Joined {joinDate}
              </span>
            </div>
            <div className="flex gap-4 text-sm">
              <span>
                <strong className="text-ink-primary">{user.following?.length || 0}</strong>
                <span className="text-ink-secondary ml-1">Following</span>
              </span>
              <span>
                <strong className="text-ink-primary">{user.followers?.length || 0}</strong>
                <span className="text-ink-secondary ml-1">Followers</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-surface-3" />

      {/* Tabs */}
      <div className="flex border-b border-surface-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 font-semibold text-sm transition-colors relative hover:bg-surface-1 ${
              activeTab === tab.id ? "text-ink-primary" : "text-ink-secondary"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-brand rounded-full" />
            )}
          </button>
        ))}
      </div>

      <PostFeed
        feedType={activeTab}
        authUser={authUser}
        username={user.username}
        userId={user._id}
      />
    </div>
  );
};

export default ProfilePage;