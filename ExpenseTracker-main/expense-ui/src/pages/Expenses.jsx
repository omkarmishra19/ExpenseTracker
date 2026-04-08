import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { deleteExpense, getCurrentUser, getExpenses } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const categoryAccent = {
  PERSONAL: "bg-orange-100 text-orange-700",
  SURVIVAL: "bg-emerald-100 text-emerald-700",
  INVESTMENT: "bg-sky-100 text-sky-700"
};

const sortOptions = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Highest amount" },
  { value: "amount-asc", label: "Lowest amount" },
  { value: "description-asc", label: "Description A-Z" }
];

const pageSize = 6;

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatAmount(value) {
  return currency.format(value || 0);
}

function Expenses() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [page, setPage] = useState(1);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userResponse, expensesResponse] = await Promise.all([
        getCurrentUser(),
        getExpenses()
      ]);

      setUser(userResponse.data);
      setExpenses(expensesResponse.data);
      setError("");
    } catch (err) {
      setError("Unable to load expenses right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredExpenses = useMemo(() => {
    const result = [...expenses].filter((expense) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || expense.category === selectedCategory;

      const expenseDate = expense.expenseDate || "";
      const matchesDate = !selectedDate || expenseDate === selectedDate;

      return matchesSearch && matchesCategory && matchesDate;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.expenseDate) - new Date(b.expenseDate);
        case "amount-desc":
          return Number(b.amount) - Number(a.amount);
        case "amount-asc":
          return Number(a.amount) - Number(b.amount);
        case "description-asc":
          return (a.description || "").localeCompare(b.description || "");
        default:
          return new Date(b.expenseDate) - new Date(a.expenseDate);
      }
    });

    return result;
  }, [expenses, searchTerm, selectedCategory, selectedDate, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedDate, sortBy]);

  const paginatedExpenses = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredExpenses.slice(startIndex, startIndex + pageSize);
  }, [filteredExpenses, page]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const handleDeleteExpense = async (id) => {
    try {
      await deleteExpense(id);
      await loadData();
    } catch (err) {
      setError("Unable to delete expense right now.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("ALL");
    setSelectedDate("");
    setSortBy("date-desc");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading expenses...
      </div>
    );
  }

  return (
    <AppShell
      title="Expense management"
      subtitle="This page is only for expenditure actions, so search, filters, edit, delete, and export stay focused here."
      user={user}
      actions={
        <>
          <Link className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-400" to="/add-expense">
            Add expense
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <section className={`rounded-[2rem] border p-6 shadow-float ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
              Filters and search
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">Find the right expense faster</h2>
          </div>
          <button
            className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
              isDark
                ? "border-white/10 text-slate-100 hover:bg-white/10"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr]">
          <input
            className={`${isDark ? "border-white/10 bg-white/5 text-white placeholder:text-slate-400 focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white"} rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
            placeholder="Search by description..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select
            className={`${isDark ? "border-white/10 bg-white/5 text-white focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"} rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="ALL">All categories</option>
            <option value="PERSONAL">Personal</option>
            <option value="SURVIVAL">Survival</option>
            <option value="INVESTMENT">Investment</option>
          </select>
          <input
            className={`${isDark ? "border-white/10 bg-white/5 text-white focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"} rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
          <select
            className={`${isDark ? "border-white/10 bg-white/5 text-white focus:bg-white/10" : "border-slate-200 bg-slate-50 text-slate-900 focus:bg-white"} rounded-2xl border px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100`}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          { label: "Filtered spend", value: formatAmount(totalSpent) },
          { label: "Filtered entries", value: filteredExpenses.length },
          { label: "Current page", value: `${page} / ${totalPages}` }
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

      <section className={`mt-6 rounded-[2rem] border p-6 shadow-float ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
              Expense records
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold">Expense command center</h2>
          </div>
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>
            Showing {(page - 1) * pageSize + (paginatedExpenses.length ? 1 : 0)}-
            {(page - 1) * pageSize + paginatedExpenses.length} of {filteredExpenses.length}
          </p>
        </div>

        <div className={`overflow-hidden rounded-[1.5rem] border ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <div className={`hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 text-sm font-semibold md:grid ${isDark ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
            <span>Description</span>
            <span>Category</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Action</span>
          </div>

          <div className={`${isDark ? "divide-white/10" : "divide-slate-200"} divide-y`}>
            {paginatedExpenses.length === 0 && (
              <div className={`px-5 py-10 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                No expenses match the current filters.
              </div>
            )}

            {paginatedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="grid gap-3 px-5 py-5 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] md:items-center"
              >
                <div>
                  <p className="font-semibold">{expense.description}</p>
                  <p className={`mt-1 text-sm md:hidden ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {expense.category} | {expense.expenseDate}
                  </p>
                </div>
                <div className="hidden md:block">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${categoryAccent[expense.category] || "bg-slate-100 text-slate-700"}`}
                  >
                    {expense.category}
                  </span>
                </div>
                <p className={`hidden text-sm md:block ${isDark ? "text-slate-300" : "text-slate-600"}`}>{expense.expenseDate}</p>
                <p className="text-base font-bold">{formatAmount(expense.amount)}</p>
                <div className="flex gap-2">
                  <button
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      isDark
                        ? "border-white/10 text-slate-100 hover:bg-white/10"
                        : "border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                    onClick={() => navigate(`/edit-expense/${expense.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark
                ? "border-white/10 text-slate-100 hover:bg-white/10"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isDark
                ? "border-white/10 text-slate-100 hover:bg-white/10"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </section>
    </AppShell>
  );
}

export default Expenses;
