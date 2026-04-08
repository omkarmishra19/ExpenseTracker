import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^\d{6}$/;

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
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
      const response = await login(form);
      localStorage.setItem("token", response.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_34%,_#dbeafe_100%)] px-6 py-10 font-body text-ink">
      <div className="mx-auto flex min-h-screen max-w-md items-center">
        <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-float md:p-10">
          <div className="mb-8 space-y-3 text-center">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-coral">
              Expense Tracker
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Login
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-slate-600">
                Sign in with your email and 6-digit password.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
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
                Password must be exactly 6 digits.
              </span>
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            New here?{" "}
            <Link className="font-semibold text-coral hover:text-orange-700" to="/signup">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Forgot password?{" "}
            <Link className="font-semibold text-coral hover:text-orange-700" to="/forgot-password">
              Reset it here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;
