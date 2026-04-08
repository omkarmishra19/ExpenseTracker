import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { addIncome, deleteIncome, getCurrentUser, getIncomes } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const incomeSources = ["SALARY", "FROM_INVESTMENT", "TRADING"];
const recurrenceOptions = ["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
const today = new Date().toISOString().split("T")[0];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatAmount(value) {
  return currency.format(value || 0);
}

function Income() {
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    description: "",
    source: "SALARY",
    amount: "",
    incomeDate: today,
    recurringTemplate: false,
    recurrenceFrequency: "NONE",
    recurrenceEndDate: ""
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userResponse, incomesResponse] = await Promise.all([
        getCurrentUser(),
        getIncomes()
      ]);

      setUser(userResponse.data);
      setIncomes(incomesResponse.data);
      setError("");
      setSuccess("");
    } catch (err) {
      setError("Unable to load income records right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalIncome = useMemo(
    () => incomes.reduce((sum, income) => sum + Number(income.amount || 0), 0),
    [incomes]
  );

  const sortedIncomes = [...incomes].sort(
    (a, b) => new Date(b.incomeDate) - new Date(a.incomeDate)
  );

  const handleIncomeChange = (event) => {
    const { name, value } = event.target;
    setIncomeForm((current) => ({
      ...current,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const handleIncomeSubmit = async (event) => {
    event.preventDefault();

    if (!incomeForm.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (Number(incomeForm.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!incomeForm.incomeDate) {
      setError("Income date is required.");
      return;
    }

    if (incomeForm.incomeDate > today) {
      setError("Income date cannot be in the future.");
      return;
    }

    try {
      setIsSubmitting(true);
      await addIncome({
        ...incomeForm,
        amount: Number(incomeForm.amount),
        recurringTemplate: incomeForm.recurrenceFrequency !== "NONE",
        recurrenceEndDate: incomeForm.recurrenceFrequency === "NONE" ? null : incomeForm.recurrenceEndDate || null
      });
      setIncomeForm({
        description: "",
        source: "SALARY",
        amount: "",
        incomeDate: today,
        recurringTemplate: false,
        recurrenceFrequency: "NONE",
        recurrenceEndDate: ""
      });
      setSuccess("Income saved successfully.");
      await loadData();
    } catch (err) {
      setError("Unable to add income right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    try {
      await deleteIncome(id);
      await loadData();
    } catch (err) {
      setError("Unable to delete income right now.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading income...
      </div>
    );
  }

  return (
    <AppShell
      title="Income center"
      subtitle="All income features now live on their own page, separated from expenditure and savings."
      user={user}
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
          {success}
        </div>
      )}

      <section className="grid gap-5 md:grid-cols-3">
        {[
          { label: "Total income", value: formatAmount(totalIncome) },
          { label: "Income records", value: incomes.length },
          { label: "Latest source", value: sortedIncomes[0]?.source || "No entries yet" }
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

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className={`rounded-[2rem] border p-6 shadow-float ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
            Add income
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">Capture your earnings</h2>

          <form className="mt-5 space-y-4" onSubmit={handleIncomeSubmit}>
            <input
              className={`${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white"} w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
              name="description"
              placeholder="Salary April"
              value={incomeForm.description}
              onChange={handleIncomeChange}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select
                className={`${isDark ? "border-white/10 bg-white/5 text-white focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"} rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
                name="source"
                value={incomeForm.source}
                onChange={handleIncomeChange}
              >
                {incomeSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
              <input
                className={`${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white"} rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
                type="number"
                min="0"
                step="0.01"
                name="amount"
                placeholder="50000"
                value={incomeForm.amount}
                onChange={handleIncomeChange}
                required
              />
            </div>
            <input
              className={`${isDark ? "border-white/10 bg-white/5 text-white focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"} w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
              type="date"
              name="incomeDate"
              value={incomeForm.incomeDate}
              onChange={handleIncomeChange}
              max={today}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <select
                className={`${isDark ? "border-white/10 bg-white/5 text-white focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"} rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
                name="recurrenceFrequency"
                value={incomeForm.recurrenceFrequency}
                onChange={handleIncomeChange}
              >
                {recurrenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                className={`${isDark ? "border-white/10 bg-white/5 text-white focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"} rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
                type="date"
                name="recurrenceEndDate"
                min={incomeForm.incomeDate || today}
                value={incomeForm.recurrenceEndDate}
                onChange={handleIncomeChange}
                disabled={incomeForm.recurrenceFrequency === "NONE"}
              />
            </div>
            <button
              className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save income"}
            </button>
          </form>
        </div>

        <div className={`rounded-[2rem] border p-6 shadow-float ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
                Income log
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">All income entries</h2>
            </div>
            <span className={`${isDark ? "text-slate-300" : "text-slate-600"} text-sm`}>
              {incomes.length} records
            </span>
          </div>

          <div className={`${isDark ? "divide-white/10" : "divide-slate-200"} divide-y`}>
            {sortedIncomes.length === 0 && (
              <div className={`${isDark ? "text-slate-400" : "text-slate-500"} py-6 text-sm`}>
                No income records yet.
              </div>
            )}
            {sortedIncomes.map((income) => (
              <div key={income.id} className="flex items-start justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold">{income.description}</p>
                  <p className={`${isDark ? "text-slate-400" : "text-slate-500"} mt-1 text-sm`}>
                    {income.source} | {income.incomeDate}
                  </p>
                  {income.recurrenceTemplateId && (
                    <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Recurring
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-500">{formatAmount(income.amount)}</p>
                  <button
                    className="mt-2 text-sm font-semibold text-red-500"
                    onClick={() => handleDeleteIncome(income.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default Income;
