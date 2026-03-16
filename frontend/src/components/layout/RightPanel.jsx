import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Avatar from "../common/Avatar";
import LoadingSpinner from "../common/LoadingSpinner";

const RightPanel = ({ authUser }) => {
  const queryClient = useQueryClient();

  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const res = await fetch("/api/users/suggested");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/users/follow/${userId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to follow");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return null;
  if (!suggestedUsers || suggestedUsers.length === 0) return null;

  return (
    <div className="sticky top-4 space-y-4">
      <div className="card p-4">
        <h3 className="font-bold text-ink-primary mb-4">Who to follow</h3>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user._id} className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div className="flex-1 min-w-0">
                <Link
                  to={`/profile/${user.username}`}
                  className="font-semibold text-sm text-ink-primary hover:underline truncate block"
                >
                  {user.fullName}
                </Link>
                <p className="text-ink-secondary text-xs truncate">
                  @{user.username}
                </p>
              </div>
              <button
                onClick={() => follow(user._id)}
                disabled={isPending}
                className="btn-outline text-xs px-3 py-1.5 flex-shrink-0"
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      <p className="text-ink-muted text-xs px-1">
        © 2024 Twitt Clone · Built with ♥
      </p>
    </div>
  );
};

export default RightPanel;