import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { getCurrentUser, getExpenses, getIncomes } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatAmount(value) {
  return currency.format(value || 0);
}

function Dashboard() {
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        const [userResponse, expensesResponse, incomesResponse] = await Promise.all([
          getCurrentUser(),
          getExpenses(),
          getIncomes()
        ]);

        setUser(userResponse.data);
        setExpenses(expensesResponse.data);
        setIncomes(incomesResponse.data);
        setError("");
      } catch (err) {
        setError("Unable to load your dashboard right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );
  const totalIncome = useMemo(
    () => incomes.reduce((sum, income) => sum + Number(income.amount || 0), 0),
    [incomes]
  );
  const savings = totalIncome - totalSpent;
  const latestExpenses = [...expenses]
    .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <AppShell
      title="Your finance workspace"
      subtitle="Everything is now split into focused pages, so you can manage spending, income, savings, and analytics without one crowded dashboard."
      user={user}
      showLogout
      actions={
        <Link className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-400" to="/add-expense">
          Add expense
        </Link>
      }
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            label: "Total income",
            value: formatAmount(totalIncome),
            accent: isDark
              ? "from-emerald-500/20 to-teal-400/10"
              : "from-emerald-100 to-teal-50"
          },
          {
            label: "Total spend",
            value: formatAmount(totalSpent),
            accent: isDark
              ? "from-orange-500/20 to-amber-400/10"
              : "from-orange-100 to-amber-50"
          },
          {
            label: "Current savings",
            value: formatAmount(savings),
            accent: isDark
              ? "from-sky-500/20 to-indigo-400/10"
              : "from-sky-100 to-indigo-50"
          }
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-[1.75rem] border p-6 shadow-float ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
            }`}
          >
            <div className={`mb-5 h-3 w-28 rounded-full bg-gradient-to-r ${item.accent}`} />
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>{item.label}</p>
            <p className="mt-3 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-4">
        {[
          {
            title: "Expenses",
            description: "Search, sort, export, edit, and delete your expense entries.",
            link: "/expenses",
            accent: "from-orange-500 to-amber-400"
          },
          {
            title: "Income",
            description: "Add salary and other income sources in a dedicated page.",
            link: "/income",
            accent: "from-emerald-500 to-teal-400"
          },
          {
            title: "Savings",
            description: "Track budget targets, balance, and monthly saving progress.",
            link: "/savings",
            accent: "from-sky-500 to-blue-500"
          },
          {
            title: "Analytics",
            description: "See month-wise and day-wise graphs in a separate analysis view.",
            link: "/analytics",
            accent: "from-violet-500 to-fuchsia-500"
          }
        ].map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className={`group rounded-[1.75rem] border p-6 shadow-float transition hover:-translate-y-1 ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
            }`}
          >
            <div className={`h-2 w-20 rounded-full bg-gradient-to-r ${item.accent}`} />
            <h2 className="mt-5 font-display text-2xl font-bold">{item.title}</h2>
            <p className={`mt-3 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {item.description}
            </p>
            <p className="mt-6 inline-flex rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-500 transition group-hover:bg-orange-100 dark:bg-white/10 dark:text-orange-200 dark:group-hover:bg-white/15">
              Open page
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-6">
        <div
          className={`rounded-[2rem] border p-6 shadow-float ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
                Recent expenses
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">Latest activity</h2>
            </div>
            <Link className="text-sm font-semibold text-orange-500" to="/expenses">
              View all expenses
            </Link>
          </div>

          <div className={`mt-6 divide-y ${isDark ? "divide-white/10" : "divide-slate-200"}`}>
            {latestExpenses.length === 0 && (
              <div className={`${isDark ? "text-slate-400" : "text-slate-500"} py-6 text-sm`}>
                No expenses added yet.
              </div>
            )}
            {latestExpenses.map((expense) => (
              <div key={expense.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold">{expense.description}</p>
                  <p className={`${isDark ? "text-slate-400" : "text-slate-500"} mt-1 text-sm`}>
                    {expense.category} | {expense.expenseDate}
                  </p>
                </div>
                <p className="font-bold">{formatAmount(expense.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default Dashboard;
