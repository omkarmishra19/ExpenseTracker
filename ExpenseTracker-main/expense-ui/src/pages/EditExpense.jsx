import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { getExpenseById, updateExpense } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const categories = ["PERSONAL", "SURVIVAL", "INVESTMENT"];
const today = new Date().toISOString().split("T")[0];

function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [expense, setExpense] = useState({
    description: "",
    category: "PERSONAL",
    amount: "",
    expenseDate: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadExpense = async () => {
      try {
        const response = await getExpenseById(id);
        setExpense(response.data);
      } catch (err) {
        setError("Unable to load expense details.");
      } finally {
        setIsLoading(false);
      }
    };

    loadExpense();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setExpense((current) => ({
      ...current,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!expense.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (Number(expense.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!expense.expenseDate) {
      setError("Expense date is required.");
      return;
    }

    if (expense.expenseDate > today) {
      setError("Expense date cannot be in the future.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateExpense(id, {
        ...expense,
        amount: Number(expense.amount)
      });
      navigate("/expenses");
    } catch (err) {
      setError("Failed to update expense.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading expense...
      </div>
    );
  }

  return (
    <AppShell
      title="Update expense"
      subtitle="Edit one expense record without mixing it into the main dashboard view."
      actions={
        <Link
          className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
            isDark
              ? "border-white/10 text-slate-100 hover:bg-white/10"
              : "border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
          to="/expenses"
        >
          Back to expenses
        </Link>
      }
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-slate-900 shadow-float">
          <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                name="description"
                value={expense.description}
                onChange={handleChange}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                name="category"
                value={expense.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Amount
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                type="number"
                min="0"
                step="0.01"
                name="amount"
                value={expense.amount}
                onChange={handleChange}
                required
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Expense date
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                type="date"
                name="expenseDate"
                value={expense.expenseDate}
                onChange={handleChange}
                max={today}
                required
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 md:col-span-2">
                {error}
              </div>
            )}

            <div className="flex gap-3 md:col-span-2">
              <button
                className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update expense"}
              </button>
              <Link
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                to="/expenses"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

export default EditExpense;
