import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await forgotPassword({ email });
      const resetToken = response.data?.resetToken || "";
      const message = response.data?.message || "Reset code generated successfully.";
      setInfo(`${message}${resetToken ? ` Your reset code is ${resetToken}.` : ""}`);
      navigate("/reset-password", {
        state: {
          email,
          resetToken
        }
      });
    } catch (err) {
      setError(err.response?.data || "Unable to generate reset code.");
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
                Password Reset
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
                Forgot password
              </h2>
              <p className="mt-2 text-slate-600">
                Enter your email to generate a 6-digit reset code.
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
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setInfo("");
                }}
                required
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {info && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {info}
              </div>
            )}

            <button
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Generating..." : "Generate reset code"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Remembered it?{" "}
            <Link className="font-semibold text-coral hover:text-orange-700" to="/login">
              Back to login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;
