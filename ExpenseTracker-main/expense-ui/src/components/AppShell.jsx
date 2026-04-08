import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/expenses", label: "Expenses" },
  { to: "/income", label: "Income" },
  { to: "/savings", label: "Savings" },
  { to: "/analytics", label: "Analytics" }
];

function AppShell({ title, subtitle, user, children, actions, showLogout = false }) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDark
          ? "bg-[linear-gradient(180deg,_#140f2d_0%,_#0f172a_28%,_#13223f_58%,_#0f3b4c_100%)] text-white"
          : "bg-[linear-gradient(180deg,_#fff7ed_0%,_#fffef7_24%,_#ecfeff_52%,_#eef2ff_100%)] text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <header
          className={`rounded-[2rem] border p-6 shadow-float backdrop-blur ${
            isDark ? "border-white/10 bg-white/5" : "border-orange-100 bg-white/88"
          }`}
        >
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-[2rem] opacity-90 ${
              isDark
                ? "bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.30),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.24),_transparent_30%),radial-gradient(circle_at_center,_rgba(34,197,94,0.12),_transparent_32%)]"
                : "bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.24),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.20),_transparent_30%),radial-gradient(circle_at_center,_rgba(168,85,247,0.12),_transparent_32%)]"
            }`}
          />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div>
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.35em] ${
                    isDark ? "text-orange-200" : "text-orange-600"
                  }`}
                >
                  Expense Tracker
                </p>
                <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">{title}</h1>
                {subtitle && (
                  <p className={`mt-3 max-w-2xl ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-full px-4 py-2 text-sm font-semibold transition ${
                        isActive
                          ? "bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-500 text-white shadow-lg shadow-orange-200/40"
                          : isDark
                            ? "border border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/30 hover:bg-white/10"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50/70"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="flex flex-wrap gap-3 lg:flex-nowrap lg:justify-end">
                {actions}
                <button
                  className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                    isDark
                      ? "border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20"
                      : "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                  }`}
                  onClick={toggleTheme}
                >
                  {isDark ? "Light mode" : "Dark mode"}
                </button>
                {showLogout && (
                  <button
                    className="rounded-2xl border border-red-300/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/20"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                )}
              </div>

              {user && (
                <div
                  className={`flex flex-wrap items-center gap-4 rounded-2xl border px-4 py-3 lg:w-full lg:justify-end ${
                    isDark
                      ? "border-white/10 bg-white/5"
                      : "border-violet-100 bg-gradient-to-r from-orange-50 via-rose-50 to-sky-50"
                  }`}
                >
                  <div
                    className="flex items-center gap-3"
                  >
                    <p className={`text-xs uppercase tracking-[0.25em] ${isDark ? "text-orange-200" : "text-orange-600"}`}>
                      Full Name
                    </p>
                    <p className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {user.fullName}
                    </p>
                  </div>
                  <span className={`${isDark ? "text-slate-500" : "text-slate-300"} hidden text-xl md:inline`}>|</span>
                  <div className="flex items-center gap-3">
                    <p className={`text-xs uppercase tracking-[0.25em] ${isDark ? "text-sky-200" : "text-sky-700"}`}>
                      Email
                    </p>
                    <p className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
