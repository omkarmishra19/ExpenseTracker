import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";

const passwordPattern = /^\d{6}$/;

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    token: location.state?.resetToken || "",
    newPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!passwordPattern.test(form.newPassword)) {
      setError("New password must be exactly 6 digits.");
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword(form);
      setSuccess("Password reset successful. You can login now.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfccb,_#ffffff_28%,_#fff7ed_58%,_#dbeafe)] px-6 py-10 font-body text-ink">
      <div className="mx-auto flex min-h-screen max-w-md items-center">
        <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 shadow-float md:p-10">
          <div className="mb-8 space-y-3 text-center">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-coral">
              Expense Tracker
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                Password Reset
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
                Set new password
              </h2>
              <p className="mt-2 text-slate-600">
                Use your email, reset code, and a new 6-digit password.
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
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Reset code
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base tracking-[0.3em] outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-orange-100"
                name="token"
                value={form.token}
                onChange={handleChange}
                maxLength={6}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                New password
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base tracking-[0.3em] outline-none transition focus:border-coral focus:bg-white focus:ring-4 focus:ring-orange-100"
                name="newPassword"
                type="password"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={form.newPassword}
                onChange={handleChange}
                required
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            <button
              className="w-full rounded-2xl bg-coral px-4 py-3 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Need a new code?{" "}
            <Link className="font-semibold text-coral hover:text-orange-700" to="/forgot-password">
              Generate again
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default ResetPassword;
