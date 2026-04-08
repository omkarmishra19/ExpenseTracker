import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8081",
});

/* 🔐 JWT automatically attach */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === "/login" || currentPath === "/signup" || currentPath === "/";

        if (!isAuthPage) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// ===== AUTH APIs =====
export const signup = (data) =>
  API.post("/auth/signup", data);

export const login = (data) =>
  API.post("/auth/login", data);

export const forgotPassword = (data) =>
  API.post("/auth/forgot-password", data);

export const resetPassword = (data) =>
  API.post("/auth/reset-password", data);

export const getCurrentUser = () =>
  API.get("/auth/me");

export const getIncomes = () =>
  API.get("/api/incomes");

export const addIncome = (income) =>
  API.post("/api/incomes", income);

export const deleteIncome = (id) =>
  API.delete(`/api/incomes/${id}`);

// ===== EXPENSE APIs =====
export const getExpenses = () =>
  API.get("/api/expenses");

export const addExpense = (expense) =>
  API.post("/api/expenses", expense);

export const deleteExpense = (id) =>
  API.delete(`/api/expenses/${id}`);

export const getExpenseById = (id) =>
  API.get(`/api/expenses/${id}`);

export const updateExpense = (id, expense) =>
  API.put(`/api/expenses/${id}`, expense);

export default API;
