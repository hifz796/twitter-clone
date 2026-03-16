import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import {
  FiHeart,
  FiMessageCircle,
  FiTrash2,
  FiShare,
  FiBookmark,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import Avatar from "./Avatar";
import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post, authUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();

  const isLiked = post.likes.includes(authUser._id);
  const isOwner = post.user._id === authUser._id;

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/like/${post._id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to like post");
      return data;
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueriesData({ queryKey: ["posts"] }, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((p) =>
          p._id === post._id ? { ...p, likes: updatedLikes } : p
        );
      });
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/comment/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to comment");
      return data;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  return (
    <article className="px-4 py-4 hover:bg-surface-1 transition-colors duration-150 cursor-pointer animate-fade-in">
      <div className="flex gap-3">
        <Avatar user={post.user} size="md" />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={`/profile/${post.user.username}`}
              className="font-semibold text-ink-primary hover:underline truncate"
            >
              {post.user.fullName}
            </Link>
            <span className="text-ink-secondary text-sm flex-shrink-0">
              @{post.user.username}
            </span>
            <span className="text-ink-muted text-sm flex-shrink-0">·</span>
            <span className="text-ink-secondary text-sm flex-shrink-0">
              {timeAgo}
            </span>
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePost();
                }}
                className="ml-auto btn-ghost p-1.5 text-ink-muted hover:text-red-500"
              >
                {isDeleting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <FiTrash2 size={15} />
                )}
              </button>
            )}
          </div>

          {/* Content */}
          {post.text && (
            <p className="text-ink-primary leading-relaxed mb-3 whitespace-pre-wrap break-words">
              {post.text}
            </p>
          )}

          {post.img && (
            <div className="mb-3 rounded-2xl overflow-hidden border border-surface-3">
              <img
                src={post.img}
                alt="Post image"
                className="w-full max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button
              className="post-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(!showComments);
              }}
            >
              <FiMessageCircle size={17} />
              <span>{post.comments.length || ""}</span>
            </button>

            <button
              className={`post-action-btn ${isLiked ? "text-red-500" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLiking) likePost();
              }}
            >
              {isLiking ? (
                <LoadingSpinner size="sm" />
              ) : isLiked ? (
                <FaHeart size={16} className="animate-pulse-like" />
              ) : (
                <FiHeart size={17} />
              )}
              <span>{post.likes.length || ""}</span>
            </button>

            <button
              className="post-action-btn ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <FiBookmark size={17} />
            </button>
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-4 space-y-3 animate-slide-up">
              <div className="divider" />

              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <Avatar user={comment.user} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-ink-primary">
                        {comment.user.fullName}
                      </span>
                      <span className="text-ink-secondary text-xs">
                        @{comment.user.username}
                      </span>
                    </div>
                    <p className="text-sm text-ink-primary">{comment.text}</p>
                  </div>
                </div>
              ))}

              {/* Comment input */}
              <div className="flex gap-3 pt-2">
                <Avatar user={authUser} size="sm" linkable={false} />
                <div className="flex-1 flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent border-b border-surface-3 pb-2 text-sm text-ink-primary placeholder-ink-secondary focus:outline-none focus:border-brand transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentText.trim()) {
                        e.preventDefault();
                        commentPost();
                      }
                    }}
                  />
                  <button
                    onClick={() => commentText.trim() && commentPost()}
                    disabled={!commentText.trim() || isCommenting}
                    className="text-brand text-sm font-semibold disabled:opacity-40 hover:text-brand-dark transition-colors"
                  >
                    {isCommenting ? <LoadingSpinner size="sm" /> : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default Post;