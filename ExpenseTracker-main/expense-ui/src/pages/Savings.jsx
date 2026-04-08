import { useEffect, useMemo, useState } from "react";
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

function getCurrentMonthLabel() {
  return new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function getMonthKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

function Savings() {
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [budgetTarget, setBudgetTarget] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const currentMonthKey = getMonthKey();
  const budgetStorageKey = user ? `budget-target:${user.email}:${currentMonthKey}` : `budget-target:${currentMonthKey}`;

  useEffect(() => {
    const loadData = async () => {
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
        setError("Unable to load savings data right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      setBudgetTarget(localStorage.getItem(`budget-target:${user.email}:${currentMonthKey}`) || "");
    }
  }, [user, currentMonthKey]);

  const currentMonthExpenses = useMemo(
    () =>
      expenses.filter((expense) => (expense.expenseDate || "").startsWith(currentMonthKey)),
    [expenses, currentMonthKey]
  );

  const currentMonthIncomes = useMemo(
    () =>
      incomes.filter((income) => (income.incomeDate || "").startsWith(currentMonthKey)),
    [incomes, currentMonthKey]
  );

  const monthlySpent = useMemo(
    () => currentMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [currentMonthExpenses]
  );

  const monthlyIncome = useMemo(
    () => currentMonthIncomes.reduce((sum, income) => sum + Number(income.amount || 0), 0),
    [currentMonthIncomes]
  );

  const monthlySavings = monthlyIncome - monthlySpent;
  const numericBudgetTarget = Number(budgetTarget || 0);
  const hasBudgetTarget = numericBudgetTarget > 0;
  const remainingBudget = hasBudgetTarget ? numericBudgetTarget - monthlySpent : null;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, (monthlySavings / monthlyIncome) * 100) : 0;
  const targetUsage = hasBudgetTarget ? (monthlySpent / numericBudgetTarget) * 100 : 0;
  const monthProgress = new Date().getDate() / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const expectedSpendByNow = hasBudgetTarget ? numericBudgetTarget * monthProgress : null;
  const safeToSpendNow = hasBudgetTarget ? Math.max(0, expectedSpendByNow - monthlySpent) : null;
  const dailyBudgetLeft =
    hasBudgetTarget
      ? Math.max(
          0,
          remainingBudget /
            Math.max(1, new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate() + 1)
        )
      : 0;

  const targetStatus =
    numericBudgetTarget === 0
      ? {
          label: "Target not set",
          tone: isDark ? "text-slate-300" : "text-slate-600",
          message: "Set a target to start tracking monthly spending discipline."
        }
      : targetUsage <= 70
        ? {
            label: "On track",
            tone: "text-emerald-500",
            message: `You have used ${targetUsage.toFixed(1)}% of your ${getCurrentMonthLabel()} budget.`
          }
        : targetUsage <= 100
          ? {
              label: "Watch spending",
              tone: "text-orange-500",
              message: `You have used ${targetUsage.toFixed(1)}% of your budget and should spend carefully for the rest of the month.`
            }
          : {
              label: "Over target",
              tone: "text-red-500",
              message: `You are ${formatAmount(Math.abs(remainingBudget))} above your monthly budget target.`
            };

  const saveBudgetTarget = () => {
    if (!user) {
      return;
    }

    localStorage.setItem(budgetStorageKey, budgetTarget);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading savings...
      </div>
    );
  }

  return (
    <AppShell
      title="Savings and budget"
      subtitle="This section now evaluates your monthly target with month-based logic instead of all-time totals."
      user={user}
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-4">
        {[
          { label: "Monthly target", value: budgetTarget ? formatAmount(budgetTarget) : "Not set" },
          { label: "This month spent", value: formatAmount(monthlySpent) },
          { label: "Budget left", value: hasBudgetTarget ? formatAmount(remainingBudget) : "Not set" },
          { label: "Monthly savings rate", value: `${savingsRate.toFixed(1)}%` }
        ].map((item) => (
          <div
            key={item.label}
            className={`rounded-[1.75rem] border p-6 shadow-float ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
            }`}
          >
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>{item.label}</p>
            <p className="mt-3 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className={`rounded-[2rem] border p-6 shadow-float ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
          }`}
        >
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
            Budget control
          </p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Set your monthly target</h2>
              <p className={`${isDark ? "text-slate-300" : "text-slate-600"} mt-2 text-sm`}>
                Budget logic is now based only on {getCurrentMonthLabel()}.
              </p>
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-semibold ${targetStatus.tone} ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
              {targetStatus.label}
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <input
              className={`${isDark ? "border-white/10 bg-white/5 text-white focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"} w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
              type="number"
              min="0"
              placeholder="Enter monthly budget"
              value={budgetTarget}
              onChange={(event) => setBudgetTarget(event.target.value)}
            />
            <button
              className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              onClick={saveBudgetTarget}
            >
              Save
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className={isDark ? "text-slate-300" : "text-slate-600"}>Target usage</span>
              <span className={`font-semibold ${targetStatus.tone}`}>{numericBudgetTarget ? `${targetUsage.toFixed(1)}%` : "0%"}</span>
            </div>
            <div className={`h-4 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
              <div
                className={`h-full rounded-full transition-all ${
                  targetUsage <= 70 ? "bg-emerald-500" : targetUsage <= 100 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(targetUsage, 100)}%` }}
              />
            </div>
          </div>

          <p className={`${isDark ? "text-slate-300" : "text-slate-600"} mt-4 text-sm leading-7`}>
            {targetStatus.message}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                label: "Expected spend by now",
                value: hasBudgetTarget ? formatAmount(expectedSpendByNow) : "Not set"
              },
              {
                label: "Safe to spend now",
                value: hasBudgetTarget ? formatAmount(safeToSpendNow) : "Not set"
              },
              {
                label: "Daily budget left",
                value: hasBudgetTarget ? formatAmount(dailyBudgetLeft) : "Not set"
              }
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border px-4 py-4 ${
                  isDark ? "border-white/10 bg-slate-950/30" : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>{item.label}</p>
                <p className="mt-2 text-xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-[2rem] border p-6 shadow-float ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
          }`}
        >
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
            Saving breakdown
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">How this month is balancing</h2>
          <div className="mt-6 space-y-4">
            {[
              { label: "Income collected", value: formatAmount(monthlyIncome), color: "bg-emerald-500" },
              { label: "Expense spent", value: formatAmount(monthlySpent), color: "bg-orange-500" },
              { label: "Amount saved", value: formatAmount(monthlySavings), color: "bg-sky-500" }
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border px-4 py-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${item.color}`} />
                    <p className="font-semibold">{item.label}</p>
                  </div>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={`rounded-2xl border px-4 py-4 ${isDark ? "border-white/10 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
              <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>Tracked expenses this month</p>
              <p className="mt-2 text-2xl font-bold">{currentMonthExpenses.length}</p>
            </div>
            <div className={`rounded-2xl border px-4 py-4 ${isDark ? "border-white/10 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
              <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>Tracked incomes this month</p>
              <p className="mt-2 text-2xl font-bold">{currentMonthIncomes.length}</p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default Savings;
