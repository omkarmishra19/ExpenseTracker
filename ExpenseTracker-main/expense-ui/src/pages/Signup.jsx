import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^\d{6}$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!usernamePattern.test(form.username)) {
      setError("Username must be 3 to 20 characters and use only letters, numbers, or underscore.");
      return;
    }

    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!emailPattern.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!passwordPattern.test(form.password)) {
      setError("Password must be exactly 6 numbers.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfccb,_#ffffff_28%,_#fff7ed_58%,_#dbeafe)] px-6 py-10 font-body text-ink">
      <div className="mx-auto flex min-h-screen max-w-lg items-center">
        <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-float md:p-10">
          <div className="mb-8 space-y-3 text-center">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-coral">
              Expense Tracker
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Signup
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 md:text-4xl">
                Create your account
              </h1>
              <p className="mt-2 text-slate-600">
                Add username, full name, email, and a 6-digit password to start.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-orange-100"
                name="username"
                type="text"
                placeholder="omkar_01"
                value={form.username}
                onChange={handleChange}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Full name
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-orange-100"
                name="fullName"
                type="text"
                placeholder="Omkar Mishra"
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-orange-100"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base tracking-[0.3em] outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-orange-100"
                name="password"
                type="password"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="123456"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span className="mt-2 block text-xs text-slate-500">
                Use exactly 6 numbers for your password.
              </span>
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              className="w-full rounded-2xl bg-coral px-4 py-3 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Signup"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-coral hover:text-orange-700" to="/login">
              Login here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Signup;
