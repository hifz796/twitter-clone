import { useQuery } from "@tanstack/react-query";
import Post from "./Post";
import LoadingSpinner from "./LoadingSpinner";

const PostFeed = ({ feedType = "all", authUser, username, userId }) => {
  const getEndpoint = () => {
    switch (feedType) {
      case "all":
        return "/api/posts/all";
      case "following":
        return "/api/posts/following";
      case "userPosts":
        return `/api/posts/user/${username}`;
      case "likedPosts":
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", feedType, username, userId],
    queryFn: async () => {
      const res = await fetch(getEndpoint());
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch posts");
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-secondary text-lg">No posts yet</p>
        <p className="text-ink-muted text-sm mt-1">
          {feedType === "following"
            ? "Follow some people to see their posts"
            : "Be the first to post!"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-3">
      {posts.map((post) => (
        <Post key={post._id} post={post} authUser={authUser} />
      ))}
    </div>
  );
};

export default PostFeed;