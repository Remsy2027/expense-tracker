import React, { createContext, useContext, useReducer, useEffect } from "react";
import { formatCurrency, validateTransaction } from "../utils/helpers";
import { CATEGORIES, STORAGE_KEYS } from "../utils/constants";

// Initial state
const initialState = {
  dailyData: {},
  currentDate: new Date().toISOString().split("T")[0],
  loading: false,
  error: null,
  lastBackup: null,
  settings: {
    currency: "INR",
    dateFormat: "dd/MM/yyyy",
    theme: "light",
    autoBackup: true,
    notifications: true,
    defaultCategory: "Other",
  },
};

// Action types
const ActionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_CURRENT_DATE: "SET_CURRENT_DATE",
  SET_DAILY_DATA: "SET_DAILY_DATA",
  ADD_INCOME: "ADD_INCOME",
  ADD_EXPENSE: "ADD_EXPENSE",
  DELETE_TRANSACTION: "DELETE_TRANSACTION",
  UPDATE_TRANSACTION: "UPDATE_TRANSACTION",
  CLEAR_DAY_DATA: "CLEAR_DAY_DATA",
  IMPORT_DATA: "IMPORT_DATA",
  UPDATE_SETTINGS: "UPDATE_SETTINGS",
  SET_LAST_BACKUP: "SET_LAST_BACKUP",
};

// Reducer function
function expenseReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.SET_CURRENT_DATE:
      return {
        ...state,
        currentDate: action.payload,
      };

    case ActionTypes.SET_DAILY_DATA:
      return {
        ...state,
        dailyData: action.payload,
      };

    case ActionTypes.ADD_INCOME:
      const { date: incomeDate, income } = action.payload;
      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [incomeDate]: {
            ...state.dailyData[incomeDate],
            income: [...(state.dailyData[incomeDate]?.income || []), income],
            expenses: state.dailyData[incomeDate]?.expenses || [],
          },
        },
      };

    case ActionTypes.ADD_EXPENSE:
      const { date: expenseDate, expense } = action.payload;
      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [expenseDate]: {
            ...state.dailyData[expenseDate],
            expenses: [
              ...(state.dailyData[expenseDate]?.expenses || []),
              expense,
            ],
            income: state.dailyData[expenseDate]?.income || [],
          },
        },
      };

    case ActionTypes.DELETE_TRANSACTION:
      const {
        date: deleteDate,
        transactionId,
        transactionType,
      } = action.payload;
      const currentDayData = state.dailyData[deleteDate];
      if (!currentDayData) return state;

      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [deleteDate]: {
            ...currentDayData,
            [transactionType]: currentDayData[transactionType].filter(
              (item) => item.id !== transactionId,
            ),
          },
        },
      };

    case ActionTypes.UPDATE_TRANSACTION:
      const {
        date: updateDate,
        transactionId: updateId,
        transactionType: updateType,
        updatedData,
      } = action.payload;
      const dayData = state.dailyData[updateDate];
      if (!dayData) return state;

      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [updateDate]: {
            ...dayData,
            [updateType]: dayData[updateType].map((item) =>
              item.id === updateId ? { ...item, ...updatedData } : item,
            ),
          },
        },
      };

    case ActionTypes.CLEAR_DAY_DATA:
      const { date: clearDate } = action.payload;
      const { [clearDate]: removed, ...remainingData } = state.dailyData;
      return {
        ...state,
        dailyData: remainingData,
      };

    case ActionTypes.IMPORT_DATA:
      return {
        ...state,
        dailyData: action.payload,
        lastBackup: new Date().toISOString(),
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ActionTypes.SET_LAST_BACKUP:
      return {
        ...state,
        lastBackup: action.payload,
      };

    default:
      return state;
  }
}

// Create context
const ExpenseContext = createContext();

// Provider component
export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });

        // Load daily data
        const storedData = localStorage.getItem(STORAGE_KEYS.DAILY_DATA);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          dispatch({ type: ActionTypes.SET_DAILY_DATA, payload: parsedData });
        }

        // Load settings
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          dispatch({
            type: ActionTypes.UPDATE_SETTINGS,
            payload: parsedSettings,
          });
        }

        // Load last backup date
        const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP);
        if (lastBackup) {
          dispatch({ type: ActionTypes.SET_LAST_BACKUP, payload: lastBackup });
        }

        // Load current date
        const storedDate = localStorage.getItem(STORAGE_KEYS.CURRENT_DATE);
        if (storedDate) {
          dispatch({ type: ActionTypes.SET_CURRENT_DATE, payload: storedDate });
        }
      } catch (error) {
        console.error("Failed to load stored data:", error);
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: "Failed to load stored data",
        });
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    loadStoredData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.DAILY_DATA,
        JSON.stringify(state.dailyData),
      );
    } catch (error) {
      console.error("Failed to save daily data:", error);
    }
  }, [state.dailyData]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(state.settings),
      );
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [state.settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DATE, state.currentDate);
    } catch (error) {
      console.error("Failed to save current date:", error);
    }
  }, [state.currentDate]);

  // Action creators
  const actions = {
    setCurrentDate: (date) => {
      dispatch({ type: ActionTypes.SET_CURRENT_DATE, payload: date });
    },

    addIncome: (date, incomeData) => {
      try {
        const validation = validateTransaction(incomeData, "income");
        if (!validation.isValid) {
          throw new Error(validation.errors.join(", "));
        }

        const income = {
          id: Date.now() + Math.random(),
          ...incomeData,
          amount: parseFloat(incomeData.amount),
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: new Date().toISOString(),
        };

        dispatch({
          type: ActionTypes.ADD_INCOME,
          payload: { date, income },
        });

        return { success: true, data: income };
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    addExpense: (date, expenseData) => {
      try {
        const validation = validateTransaction(expenseData, "expense");
        if (!validation.isValid) {
          throw new Error(validation.errors.join(", "));
        }

        const expense = {
          id: Date.now() + Math.random(),
          ...expenseData,
          amount: parseFloat(expenseData.amount),
          time: new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          createdAt: new Date().toISOString(),
        };

        dispatch({
          type: ActionTypes.ADD_EXPENSE,
          payload: { date, expense },
        });

        return { success: true, data: expense };
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    deleteTransaction: (date, transactionId, transactionType) => {
      try {
        dispatch({
          type: ActionTypes.DELETE_TRANSACTION,
          payload: { date, transactionId, transactionType },
        });
        return { success: true };
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    updateTransaction: (date, transactionId, transactionType, updatedData) => {
      try {
        const validation = validateTransaction(
          updatedData,
          transactionType.slice(0, -1),
        );
        if (!validation.isValid) {
          throw new Error(validation.errors.join(", "));
        }

        dispatch({
          type: ActionTypes.UPDATE_TRANSACTION,
          payload: {
            date,
            transactionId,
            transactionType,
            updatedData: {
              ...updatedData,
              amount: parseFloat(updatedData.amount),
              updatedAt: new Date().toISOString(),
            },
          },
        });

        return { success: true };
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message };
      }
    },

    clearDayData: (date) => {
      if (
        window.confirm(
          "Are you sure you want to clear all transactions for this date? This action cannot be undone.",
        )
      ) {
        dispatch({ type: ActionTypes.CLEAR_DAY_DATA, payload: { date } });
        return { success: true };
      }
      return { success: false, error: "Operation cancelled" };
    },

    exportData: () => {
      try {
        const exportData = {
          dailyData: state.dailyData,
          settings: state.settings,
          exportDate: new Date().toISOString(),
          version: "1.0.0",
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri =
          "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

        const exportFileDefaultName = `expense-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();

        dispatch({
          type: ActionTypes.SET_LAST_BACKUP,
          payload: new Date().toISOString(),
        });

        return { success: true };
      } catch (error) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: "Failed to export data",
        });
        return { success: false, error: "Failed to export data" };
      }
    },

    importData: (fileData) => {
      try {
        const parsedData = JSON.parse(fileData);

        // Validate data structure
        if (!parsedData.dailyData || typeof parsedData.dailyData !== "object") {
          throw new Error("Invalid data format");
        }

        if (
          window.confirm(
            "This will replace all existing data. Are you sure you want to continue?",
          )
        ) {
          dispatch({
            type: ActionTypes.IMPORT_DATA,
            payload: parsedData.dailyData,
          });

          if (parsedData.settings) {
            dispatch({
              type: ActionTypes.UPDATE_SETTINGS,
              payload: parsedData.settings,
            });
          }

          return { success: true };
        }

        return { success: false, error: "Import cancelled" };
      } catch (error) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: "Failed to import data. Please check file format.",
        });
        return { success: false, error: "Failed to import data" };
      }
    },

    updateSettings: (newSettings) => {
      dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: newSettings });
    },

    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    calculateDayStats: (date) => {
      const dayData = state.dailyData[date] || { income: [], expenses: [] };
      const totalIncome = dayData.income.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const totalExpenses = dayData.expenses.reduce(
        (sum, item) => sum + item.amount,
        0,
      );
      const balance = totalIncome - totalExpenses;
      const transactionCount = dayData.income.length + dayData.expenses.length;

      // Category breakdown
      const categoryTotals = {};
      dayData.expenses.forEach((expense) => {
        categoryTotals[expense.category] =
          (categoryTotals[expense.category] || 0) + expense.amount;
      });

      return {
        totalIncome,
        totalExpenses,
        balance,
        transactionCount,
        categoryTotals,
        hasTransactions: transactionCount > 0,
      };
    },

    calculateMonthStats: (date) => {
      const currentMonth = new Date(date).getMonth();
      const currentYear = new Date(date).getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      let monthlyIncome = 0;
      let monthlyExpenses = 0;
      let activeDays = 0;
      const dailyStats = [];

      // Calculate for each day of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayStats = actions.calculateDayStats(dateStr);

        monthlyIncome += dayStats.totalIncome;
        monthlyExpenses += dayStats.totalExpenses;

        if (dayStats.hasTransactions) {
          activeDays++;
        }

        dailyStats.push({
          date: dateStr,
          ...dayStats,
        });
      }

      const monthlySavings = monthlyIncome - monthlyExpenses;
      const progressPercentage = (activeDays / daysInMonth) * 100;

      return {
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        activeDays,
        daysInMonth,
        progressPercentage,
        dailyStats,
      };
    },
  };

  const contextValue = {
    ...state,
    ...actions,
  };

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
}

// Custom hook to use the expense context
export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenseContext must be used within an ExpenseProvider");
  }
  return context;
}

export default ExpenseContext;
