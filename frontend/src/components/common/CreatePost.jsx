import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiImage, FiX } from "react-icons/fi";
import Avatar from "./Avatar";
import LoadingSpinner from "./LoadingSpinner";

const CreatePost = ({ authUser }) => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const fileRef = useRef(null);
  const queryClient = useQueryClient();

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, img }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      return data;
    },
    onSuccess: () => {
      setText("");
      setImg(null);
      setImgPreview(null);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Posted!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImgPreview(reader.result);
      setImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImg = () => {
    setImg(null);
    setImgPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !img) return;
    createPost();
  };

  const charCount = text.length;
  const maxChars = 280;
  const remaining = maxChars - charCount;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining < 20;

  return (
    <div className="px-4 py-4 border-b border-surface-3">
      <div className="flex gap-3">
        <Avatar user={authUser} size="md" linkable={false} />

        <form className="flex-1" onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            rows={text.length > 80 ? 4 : 2}
            className="w-full bg-transparent text-ink-primary placeholder-ink-secondary text-lg resize-none focus:outline-none leading-relaxed"
            maxLength={300}
          />

          {imgPreview && (
            <div className="relative mt-2 rounded-2xl overflow-hidden border border-surface-3">
              <img
                src={imgPreview}
                alt="Preview"
                className="w-full max-h-72 object-cover"
              />
              <button
                type="button"
                onClick={removeImg}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-ghost text-brand p-2"
              >
                <FiImage size={18} />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImgChange}
              />
            </div>

            <div className="flex items-center gap-3">
              {charCount > 0 && (
                <span
                  className={`text-sm font-mono ${
                    isOverLimit
                      ? "text-red-500"
                      : isNearLimit
                      ? "text-yellow-500"
                      : "text-ink-secondary"
                  }`}
                >
                  {remaining}
                </span>
              )}
              <button
                type="submit"
                disabled={isPending || isOverLimit || (!text.trim() && !img)}
                className="btn-primary text-sm px-5 py-2"
              >
                {isPending ? <LoadingSpinner size="sm" /> : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;