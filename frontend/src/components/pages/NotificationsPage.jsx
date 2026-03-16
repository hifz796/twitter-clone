import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { FiHeart, FiUserPlus, FiMessageCircle, FiTrash2 } from "react-icons/fi";
import Avatar from "../common/Avatar";
import LoadingSpinner from "../common/LoadingSpinner";

const iconMap = {
  like: <FiHeart size={14} className="text-red-500" />,
  follow: <FiUserPlus size={14} className="text-brand" />,
  comment: <FiMessageCircle size={14} className="text-green-500" />,
};

const labelMap = {
  like: "liked your post",
  follow: "started following you",
  comment: "commented on your post",
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });

  const { mutate: clearAll } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notifications cleared");
    },
  });

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-surface-3 px-4 py-4 flex items-center justify-between">
        <h1 className="font-bold text-xl text-ink-primary">Notifications</h1>
        {notifications?.length > 0 && (
          <button
            onClick={() => clearAll()}
            className="btn-ghost p-2 text-ink-secondary hover:text-red-500"
            title="Clear all"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </header>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {!isLoading && (!notifications || notifications.length === 0) && (
        <div className="text-center py-16">
          <p className="text-ink-secondary text-lg">No notifications yet</p>
          <p className="text-ink-muted text-sm mt-1">
            When someone likes or follows you, you'll see it here
          </p>
        </div>
      )}

      <div className="divide-y divide-surface-3">
        {notifications?.map((n) => (
          <div
            key={n._id}
            className={`flex items-start gap-3 px-4 py-4 hover:bg-surface-1 transition-colors animate-fade-in ${
              !n.read ? "bg-brand/5" : ""
            }`}
          >
            <Avatar user={n.from} size="sm" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-ink-primary text-sm">
                  {n.from?.fullName}
                </span>
                <span className="text-ink-secondary text-xs">
                  @{n.from?.username}
                </span>
                <span className="flex items-center gap-1 text-ink-secondary text-sm">
                  {iconMap[n.type]} {labelMap[n.type]}
                </span>
              </div>
              <p className="text-ink-muted text-xs mt-0.5">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
            {!n.read && (
              <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;