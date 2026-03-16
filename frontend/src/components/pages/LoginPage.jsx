import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";

const XLogo = () => (
  <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current text-ink-primary">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const queryClient = useQueryClient();

  const { mutate: login, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <XLogo />
        </div>

        <h1 className="text-3xl font-bold text-ink-primary mb-2">
          Sign in to Twitt
        </h1>
        <p className="text-ink-secondary mb-8">
          Enter your credentials to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm((p) => ({ ...p, username: e.target.value }))
              }
              placeholder="@username"
              className="input-field"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="••••••••"
              className="input-field"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {isPending ? <LoadingSpinner size="sm" /> : "Sign in"}
          </button>
        </form>

        <p className="text-center text-ink-secondary text-sm mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;