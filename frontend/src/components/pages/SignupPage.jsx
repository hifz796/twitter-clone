import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../common/LoadingSpinner";

const Logo = () => (
  <span className="text-2xl font-bold text-ink-primary tracking-tight">
    twitt
  </span>
);
const SignupPage = () => {
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
  });
  const queryClient = useQueryClient();

  const { mutate: signup, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      return data;
    },
    onSuccess: () => {
      toast.success("Account created!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup();
  };

  const fields = [
    { key: "fullName", label: "Full name", placeholder: "Your name", type: "text" },
    { key: "username", label: "Username", placeholder: "@username", type: "text" },
    { key: "email", label: "Email", placeholder: "you@example.com", type: "email" },
    { key: "password", label: "Password", placeholder: "Min. 6 characters", type: "password" },
  ];

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <XLogo />
        </div>

        <h1 className="text-3xl font-bold text-ink-primary mb-2">
          Create your account
        </h1>
        <p className="text-ink-secondary mb-8">
          Join Twitt today
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-ink-secondary mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                placeholder={placeholder}
                className="input-field"
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {isPending ? <LoadingSpinner size="sm" /> : "Create account"}
          </button>
        </form>

        <p className="text-center text-ink-secondary text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;