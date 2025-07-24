import { useState, useEffect, useMemo, useCallback } from "react";
import { useExpenseContext } from "../context/ExpenseContext";
import { useNotifications } from "./useNotifications";
import { formatCurrency, generateTrendData } from "../utils/helpers";

/**
 * Custom hook for expense data management and calculations
 * Provides computed values, transaction management, and analytics
 */
export function useExpenseData(currentDate) {
  const {
    dailyData,
    addIncome: contextAddIncome,
    addExpense: contextAddExpense,
    deleteTransaction: contextDeleteTransaction,
    updateTransaction: contextUpdateTransaction,
    calculateDayStats,
    calculateMonthStats,
  } = useExpenseContext();

  const { addNotification } = useNotifications();

  // Local state for form management
  const [incomeForm, setIncomeForm] = useState({ source: "", amount: "" });
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    category: "Food",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized calculations for current date
  const calculations = useMemo(() => {
    const dayStats = calculateDayStats(currentDate);
    const monthStats = calculateMonthStats(currentDate);

    // 7-day trend data
    const trendData = generateTrendData(dailyData, currentDate, 7);

    return {
      ...dayStats,
      ...monthStats,
      trendData,
    };
  }, [dailyData, currentDate, calculateDayStats, calculateMonthStats]);

  // Transaction management functions
  const addIncome = useCallback(
    async (incomeData) => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        const result = contextAddIncome(currentDate, incomeData || incomeForm);

        if (result.success) {
          setIncomeForm({ source: "", amount: "" });
          addNotification({
            type: "success",
            message: `Income of ${formatCurrency(result.data.amount)} added successfully!`,
            duration: 3000,
          });
        } else {
          addNotification({
            type: "error",
            message: result.error || "Failed to add income",
            duration: 5000,
          });
        }

        return result;
      } catch (error) {
        addNotification({
          type: "error",
          message: "An unexpected error occurred",
          duration: 5000,
        });
        return { success: false, error: error.message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentDate, incomeForm, contextAddIncome, addNotification, isSubmitting],
  );

  const addExpense = useCallback(
    async (expenseData) => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        const result = contextAddExpense(
          currentDate,
          expenseData || expenseForm,
        );

        if (result.success) {
          setExpenseForm({ description: "", category: "Food", amount: "" });
          addNotification({
            type: "success",
            message: `Expense of ${formatCurrency(result.data.amount)} added successfully!`,
            duration: 3000,
          });
        } else {
          addNotification({
            type: "error",
            message: result.error || "Failed to add expense",
            duration: 5000,
          });
        }

        return result;
      } catch (error) {
        addNotification({
          type: "error",
          message: "An unexpected error occurred",
          duration: 5000,
        });
        return { success: false, error: error.message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      currentDate,
      expenseForm,
      contextAddExpense,
      addNotification,
      isSubmitting,
    ],
  );

  const deleteTransaction = useCallback(
    async (transactionId, transactionType) => {
      try {
        const result = contextDeleteTransaction(
          currentDate,
          transactionId,
          transactionType,
        );

        if (result.success) {
          addNotification({
            type: "success",
            message: "Transaction deleted successfully",
            duration: 3000,
          });
        } else {
          addNotification({
            type: "error",
            message: result.error || "Failed to delete transaction",
            duration: 5000,
          });
        }

        return result;
      } catch (error) {
        addNotification({
          type: "error",
          message: "An unexpected error occurred",
          duration: 5000,
        });
        return { success: false, error: error.message };
      }
    },
    [currentDate, contextDeleteTransaction, addNotification],
  );

  const updateTransaction = useCallback(
    async (transactionId, transactionType, updatedData) => {
      try {
        const result = contextUpdateTransaction(
          currentDate,
          transactionId,
          transactionType,
          updatedData,
        );

        if (result.success) {
          addNotification({
            type: "success",
            message: "Transaction updated successfully",
            duration: 3000,
          });
        } else {
          addNotification({
            type: "error",
            message: result.error || "Failed to update transaction",
            duration: 5000,
          });
        }

        return result;
      } catch (error) {
        addNotification({
          type: "error",
          message: "An unexpected error occurred",
          duration: 5000,
        });
        return { success: false, error: error.message };
      }
    },
    [currentDate, contextUpdateTransaction, addNotification],
  );

  // Quick transaction functions with predefined data
  const addQuickIncome = useCallback(
    (amount, source = "Quick Income") => {
      return addIncome({ amount, source });
    },
    [addIncome],
  );

  const addQuickExpense = useCallback(
    (amount, description = "Quick Expense", category = "Other") => {
      return addExpense({ amount, description, category });
    },
    [addExpense],
  );

  // Form management
  const updateIncomeForm = useCallback((field, value) => {
    setIncomeForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateExpenseForm = useCallback((field, value) => {
    setExpenseForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForms = useCallback(() => {
    setIncomeForm({ source: "", amount: "" });
    setExpenseForm({ description: "", category: "Food", amount: "" });
  }, []);

  // Analytics functions
  const getTopCategories = useCallback(
    (limit = 5) => {
      const categories = Object.entries(calculations.categoryTotals || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([category, amount]) => ({ category, amount }));

      return categories;
    },
    [calculations.categoryTotals],
  );

  const getSpendingTrend = useCallback(
    (days = 30) => {
      return generateTrendData(dailyData, currentDate, days);
    },
    [dailyData, currentDate],
  );

  const getCategoryPercentages = useCallback(() => {
    const total = calculations.totalExpenses;
    if (total === 0) return {};

    const percentages = {};
    Object.entries(calculations.categoryTotals || {}).forEach(
      ([category, amount]) => {
        percentages[category] = ((amount / total) * 100).toFixed(1);
      },
    );

    return percentages;
  }, [calculations.categoryTotals, calculations.totalExpenses]);

  // Validation functions
  const validateIncomeForm = useCallback(() => {
    const errors = [];

    if (!incomeForm.source.trim()) {
      errors.push("Income source is required");
    }

    if (!incomeForm.amount || parseFloat(incomeForm.amount) <= 0) {
      errors.push("Amount must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [incomeForm]);

  const validateExpenseForm = useCallback(() => {
    const errors = [];

    if (!expenseForm.description.trim()) {
      errors.push("Expense description is required");
    }

    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      errors.push("Amount must be greater than 0");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [expenseForm]);

  // Search and filter functions
  const searchTransactions = useCallback(
    (query, type = "all") => {
      const currentData = dailyData[currentDate] || {
        income: [],
        expenses: [],
      };
      const lowerQuery = query.toLowerCase();

      let results = [];

      if (type === "all" || type === "income") {
        const incomeResults = currentData.income
          .filter((item) => item.source.toLowerCase().includes(lowerQuery))
          .map((item) => ({ ...item, type: "income" }));
        results = [...results, ...incomeResults];
      }

      if (type === "all" || type === "expenses") {
        const expenseResults = currentData.expenses
          .filter(
            (item) =>
              item.description.toLowerCase().includes(lowerQuery) ||
              item.category.toLowerCase().includes(lowerQuery),
          )
          .map((item) => ({ ...item, type: "expenses" }));
        results = [...results, ...expenseResults];
      }

      return results.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    },
    [dailyData, currentDate],
  );

  const filterTransactionsByCategory = useCallback(
    (category) => {
      const currentData = dailyData[currentDate] || {
        income: [],
        expenses: [],
      };
      return currentData.expenses.filter(
        (expense) => expense.category === category,
      );
    },
    [dailyData, currentDate],
  );

  const filterTransactionsByAmount = useCallback(
    (minAmount, maxAmount) => {
      const currentData = dailyData[currentDate] || {
        income: [],
        expenses: [],
      };
      const allTransactions = [
        ...currentData.income.map((item) => ({ ...item, type: "income" })),
        ...currentData.expenses.map((item) => ({ ...item, type: "expenses" })),
      ];

      return allTransactions.filter((transaction) => {
        const amount = transaction.amount;
        return amount >= minAmount && amount <= maxAmount;
      });
    },
    [dailyData, currentDate],
  );

  // Export current day data
  const exportDayData = useCallback(() => {
    const currentData = dailyData[currentDate] || { income: [], expenses: [] };
    const stats = calculations;

    const exportData = {
      date: currentDate,
      transactions: currentData,
      statistics: {
        totalIncome: stats.totalIncome,
        totalExpenses: stats.totalExpenses,
        balance: stats.balance,
        transactionCount: stats.transactionCount,
        categoryBreakdown: stats.categoryTotals,
      },
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `expense-tracker-${currentDate}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    addNotification({
      type: "success",
      message: "Data exported successfully",
      duration: 3000,
    });
  }, [dailyData, currentDate, calculations, addNotification]);

  return {
    // Core data
    dailyData,
    calculations,

    // Current day data
    currentDayData: dailyData[currentDate] || { income: [], expenses: [] },

    // Form state
    incomeForm,
    expenseForm,
    isSubmitting,

    // Transaction management
    addIncome,
    addExpense,
    deleteTransaction,
    updateTransaction,
    addQuickIncome,
    addQuickExpense,

    // Form management
    updateIncomeForm,
    updateExpenseForm,
    resetForms,
    validateIncomeForm,
    validateExpenseForm,

    // Analytics
    getTopCategories,
    getSpendingTrend,
    getCategoryPercentages,

    // Search and filter
    searchTransactions,
    filterTransactionsByCategory,
    filterTransactionsByAmount,

    // Export
    exportDayData,
  };
}
