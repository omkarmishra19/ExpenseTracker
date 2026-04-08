import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import AppShell from "../components/AppShell";
import { getCurrentUser, getExpenses } from "../services/api";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#f97316", "#0f766e", "#2563eb", "#7c3aed", "#dc2626"];

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

function groupByMonth(expenses) {
  const monthlyMap = new Map();

  expenses.forEach((expense) => {
    const date = new Date(expense.expenseDate);
    const key = date.toLocaleString("en-IN", {
      month: "short",
      year: "numeric"
    });

    monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(expense.amount || 0));
  });

  return Array.from(monthlyMap.entries()).map(([month, amount]) => ({
    month,
    amount
  }));
}

function groupByDay(expenses) {
  const sortedExpenses = [...expenses]
    .filter((expense) => expense.expenseDate)
    .sort((a, b) => new Date(a.expenseDate) - new Date(b.expenseDate))
    .slice(-14);

  return sortedExpenses.map((expense) => ({
    day: new Date(expense.expenseDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short"
    }),
    amount: Number(expense.amount || 0)
  }));
}

function groupByCategory(expenses) {
  const categoryMap = new Map();

  expenses.forEach((expense) => {
    const key = expense.category || "OTHER";
    categoryMap.set(key, (categoryMap.get(key) || 0) + Number(expense.amount || 0));
  });

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name,
      value
    }))
    .sort((a, b) => b.value - a.value);
}

function Analytics() {
  const { isDark } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("monthly");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [userResponse, expensesResponse] = await Promise.all([
          getCurrentUser(),
          getExpenses()
        ]);

        setUser(userResponse.data);
        setExpenses(expensesResponse.data);
      } catch (err) {
        setError("Unable to load analytics right now.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const monthlyData = useMemo(() => groupByMonth(expenses), [expenses]);
  const dailyData = useMemo(() => groupByDay(expenses), [expenses]);
  const categoryData = useMemo(() => groupByCategory(expenses), [expenses]);
  const totalSpend = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    [expenses]
  );
  const averageSpend = expenses.length ? totalSpend / expenses.length : 0;
  const topCategory = categoryData[0];
  const largestExpense = useMemo(() => {
    if (!expenses.length) {
      return null;
    }

    return [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  }, [expenses]);
  const busiestMonth = useMemo(() => {
    if (!monthlyData.length) {
      return null;
    }

    return [...monthlyData].sort((a, b) => b.amount - a.amount)[0];
  }, [monthlyData]);
  const selectedTrendData = viewMode === "monthly" ? monthlyData : dailyData;
  const selectedTrendLabel = viewMode === "monthly" ? "Month wise" : "Day wise";
  const selectedTrendTitle =
    viewMode === "monthly" ? "Spending trend by month" : "Spending trend by day";
  const selectedTrendCount =
    viewMode === "monthly" ? `${monthlyData.length} months tracked` : `${dailyData.length} days tracked`;

  const handleExportPdf = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("Expense Analytics Report", 14, 18);
    pdf.setFontSize(11);
    pdf.text(`Generated for: ${user?.fullName || "User"}`, 14, 27);
    pdf.text(`Email: ${user?.email || "-"}`, 14, 34);
    pdf.text(`Report month: ${getCurrentMonthLabel()}`, 14, 41);

    autoTable(pdf, {
      startY: 48,
      head: [["Metric", "Value"]],
      body: [
        ["Total spend", formatAmount(totalSpend)],
        ["Average expense", formatAmount(averageSpend)],
        ["Top category", topCategory ? `${topCategory.name} (${formatAmount(topCategory.value)})` : "No data"],
        ["Highest month", busiestMonth ? `${busiestMonth.month} (${formatAmount(busiestMonth.amount)})` : "No data"],
        ["Largest expense", largestExpense ? `${largestExpense.description} (${formatAmount(largestExpense.amount)})` : "No data"],
        ["Tracked entries", String(expenses.length)]
      ],
      theme: "striped"
    });

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 10,
      head: [["Category", "Amount", "Share"]],
      body: categoryData.map((item) => [
        item.name,
        formatAmount(item.value),
        totalSpend ? `${((item.value / totalSpend) * 100).toFixed(1)}%` : "0%"
      ]),
      theme: "grid"
    });

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 10,
      head: [["Description", "Category", "Date", "Amount"]],
      body: expenses.map((expense) => [
        expense.description,
        expense.category,
        expense.expenseDate,
        formatAmount(expense.amount)
      ]),
      theme: "striped"
    });

    pdf.save("expense-analytics-report.pdf");
  };

  const handleExportCsv = () => {
    const headers = ["Description", "Category", "Date", "Amount"];
    const rows = expenses.map((expense) => [
      expense.description,
      expense.category,
      expense.expenseDate,
      expense.amount
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expense-analytics-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading analytics...
      </div>
    );
  }

  return (
    <AppShell
      title="Expense analytics"
      subtitle="A richer command view of your spending trends, with both monthly and day-wise analysis."
      user={user}
      actions={
        <>
          <button
            className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
              isDark
                ? "border-white/10 text-slate-100 hover:bg-white/10"
                : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
          <button
            className="rounded-2xl border border-orange-300/40 bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
            onClick={handleExportPdf}
          >
            Export PDF
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <section
        className={`overflow-hidden rounded-[2rem] border p-6 shadow-float ${
          isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`absolute inset-x-0 h-40 opacity-80 ${
            isDark
              ? "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.20),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_28%)]"
              : "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.18),_transparent_28%)]"
          }`}
        />
        <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total spend",
              value: formatAmount(totalSpend),
              note: "All tracked expenses",
              accent: "from-orange-500 to-amber-400"
            },
            {
              label: "Average expense",
              value: formatAmount(averageSpend),
              note: "Per recorded entry",
              accent: "from-sky-500 to-cyan-400"
            },
            {
              label: "Top category",
              value: topCategory ? topCategory.name : "No data",
              note: topCategory ? formatAmount(topCategory.value) : "Waiting for records",
              accent: "from-violet-500 to-fuchsia-500"
            },
            {
              label: "Highest month",
              value: busiestMonth ? busiestMonth.month : "No data",
              note: busiestMonth ? formatAmount(busiestMonth.amount) : "Waiting for records",
              accent: "from-emerald-500 to-teal-400"
            }
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-[1.75rem] border p-5 ${
                isDark ? "border-white/10 bg-slate-950/30" : "border-slate-200 bg-white/90"
              }`}
            >
              <div className={`h-2 w-20 rounded-full bg-gradient-to-r ${item.accent}`} />
              <p className={`mt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.label}</p>
              <p className="mt-3 text-3xl font-bold">{item.value}</p>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item.note}</p>
            </div>
          ))}
        </div>
        <div className="relative mt-6 flex flex-wrap gap-3">
          {[
            { value: "monthly", label: "Monthly view" },
            { value: "daily", label: "Day wise view" }
          ].map((item) => (
            <button
              key={item.value}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                viewMode === item.value
                  ? "bg-orange-500 text-white"
                  : isDark
                    ? "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setViewMode(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-float">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                {selectedTrendLabel}
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">{selectedTrendTitle}</h2>
            </div>
            <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
              {selectedTrendCount}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === "monthly" ? (
                <BarChart data={selectedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmount(value)} />
                  <Bar dataKey="amount" radius={[14, 14, 0, 0]} fill="#f97316" />
                </BarChart>
              ) : (
                <LineChart data={selectedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatAmount(value)} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0f766e"
                    strokeWidth={3}
                    dot={{ fill: "#0f766e", r: 4 }}
                    activeDot={{ r: 7, fill: "#f97316" }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className={`rounded-[2rem] border p-6 shadow-float ${
            isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
          }`}
        >
          <div className="mb-4">
            <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${isDark ? "text-orange-200" : "text-orange-600"}`}>
              Category mix
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">Where money goes</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={102}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatAmount(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {categoryData.map((entry, index) => (
              <div
                key={entry.name}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
                  isDark ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div
            className={`rounded-[2rem] border p-6 shadow-float ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
            }`}
          >
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
              Performance snapshot
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">Monthly and day-wise tracking</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
                <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>Monthly entries</p>
                <p className="mt-2 text-2xl font-bold">{monthlyData.length}</p>
                <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Best for long-term income, expense, and savings patterns.
                </p>
              </div>
              <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-slate-950/30" : "border-slate-200 bg-slate-50"}`}>
                <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>Day-wise entries</p>
                <p className="mt-2 text-2xl font-bold">{dailyData.length}</p>
                <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Best for everyday spending movement and short-term control.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
          <div
            className={`rounded-[2rem] border p-6 shadow-float ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
            }`}
          >
            <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
              Big picture
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold">Key insights</h2>
            <div className="mt-5 space-y-4">
              {[
                {
                  title: "Largest expense",
                  value: largestExpense ? formatAmount(largestExpense.amount) : "No data",
                  note: largestExpense
                    ? `${largestExpense.description} | ${largestExpense.expenseDate}`
                    : "Add expenses to unlock this insight"
                },
                {
                  title: "Most expensive category",
                  value: topCategory ? topCategory.name : "No data",
                  note: topCategory ? formatAmount(topCategory.value) : "Waiting for records"
                },
                {
                  title: "Total entries tracked",
                  value: String(expenses.length),
                  note: expenses.length ? "Your analytics view is active and learning from your data." : "No expenses yet"
                }
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border px-4 py-4 ${
                    isDark ? "border-white/10 bg-slate-950/30" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>{item.title}</p>
                      <p className="mt-1 text-xl font-bold">{item.value}</p>
                      <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        {item.note}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`rounded-[2rem] border p-6 shadow-float ${
              isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm font-semibold uppercase tracking-[0.25em]`}>
                  Category ranking
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">Leaderboard</h2>
              </div>
              <div className={`rounded-full px-3 py-2 text-sm font-semibold ${isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-600"}`}>
                Top spenders
              </div>
            </div>

            <div className="space-y-4">
              {categoryData.length === 0 && (
                <div className={`${isDark ? "text-slate-400" : "text-slate-500"} text-sm`}>
                  No category data available yet.
                </div>
              )}
              {categoryData.map((item, index) => {
                const percentage = totalSpend ? (item.value / totalSpend) * 100 : 0;

                return (
                  <div key={item.name}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <p className="font-semibold">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatAmount(item.value)}</p>
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className={`h-3 overflow-hidden rounded-full ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default Analytics;
