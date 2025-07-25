// src/context/ExpenseContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { transactionsAPI, analyticsAPI, settingsAPI, apiHelpers } from "../services/api";
import { useAuth } from "./AuthContext";

// Initial state
const initialState = {
  dailyData: {},
  currentDate: new Date().toISOString().split("T")[0],
  loading: false,
  error: null,
  settings: {
    currency: "INR",
    dateFormat: "dd/MM/yyyy",
    theme: "light",
    autoBackup: true,
    notifications: true,
    defaultCategory: "Other",
  },
  isOnline: navigator.onLine,
  syncStatus: 'synced', // 'synced', 'syncing', 'offline', 'error'
};

// Action types
const ActionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_CURRENT_DATE: "SET_CURRENT_DATE",
  SET_DAILY_DATA: "SET_DAILY_DATA",
  ADD_TRANSACTION: "ADD_TRANSACTION",
  UPDATE_TRANSACTION: "UPDATE_TRANSACTION",
  DELETE_TRANSACTION: "DELETE_TRANSACTION",
  SET_SETTINGS: "SET_SETTINGS",
  SET_ONLINE_STATUS: "SET_ONLINE_STATUS",
  SET_SYNC_STATUS: "SET_SYNC_STATUS",
  BULK_UPDATE: "BULK_UPDATE",
};

// Reducer function
function expenseReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    case ActionTypes.SET_CURRENT_DATE:
      return { ...state, currentDate: action.payload };

    case ActionTypes.SET_DAILY_DATA:
      return { ...state, dailyData: action.payload };

    case ActionTypes.ADD_TRANSACTION:
      const { date, transaction } = action.payload;
      const currentData = state.dailyData[date] || { income: [], expenses: [] };
      const transactionType = transaction.type === 'income' ? 'income' : 'expenses';

      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [date]: {
            ...currentData,
            [transactionType]: [...currentData[transactionType], transaction],
          },
        },
      };

    case ActionTypes.UPDATE_TRANSACTION:
      const { date: updateDate, transactionId, updatedTransaction } = action.payload;
      const dayData = state.dailyData[updateDate] || { income: [], expenses: [] };

      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [updateDate]: {
            income: dayData.income.map(t => t.id === transactionId ? updatedTransaction : t),
            expenses: dayData.expenses.map(t => t.id === transactionId ? updatedTransaction : t),
          },
        },
      };

    case ActionTypes.DELETE_TRANSACTION:
      const { date: deleteDate, transactionId: deleteId } = action.payload;
      const deleteData = state.dailyData[deleteDate] || { income: [], expenses: [] };

      return {
        ...state,
        dailyData: {
          ...state.dailyData,
          [deleteDate]: {
            income: deleteData.income.filter(t => t.id !== deleteId),
            expenses: deleteData.expenses.filter(t => t.id !== deleteId),
          },
        },
      };

    case ActionTypes.SET_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case ActionTypes.SET_ONLINE_STATUS:
      return { ...state, isOnline: action.payload };

    case ActionTypes.SET_SYNC_STATUS:
      return { ...state, syncStatus: action.payload };

    case ActionTypes.BULK_UPDATE:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// Create context
const ExpenseContext = createContext();

// Provider component
export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => dispatch({ type: ActionTypes.SET_ONLINE_STATUS, payload: true });
    const handleOffline = () => dispatch({ type: ActionTypes.SET_ONLINE_STATUS, payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadInitialData();
    }
  }, [isAuthenticated, user]);

  // Load initial data from API
  const loadInitialData = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    dispatch({ type: ActionTypes.SET_SYNC_STATUS, payload: 'syncing' });

    try {
      // Load transactions for current month
      const startOfMonth = new Date(state.currentDate);
      startOfMonth.setDate(1);
      const endOfMonth = new Date(state.currentDate);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);

      const [transactionsResponse, settingsResponse] = await Promise.all([
        transactionsAPI.getByDateRange(
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        ),
        settingsAPI.get().catch(() => ({ data: state.settings }))
      ]);

      // Process transactions into daily data structure
      const dailyData = {};
      transactionsResponse.data.forEach(transaction => {
        const date = transaction.date;
        if (!dailyData[date]) {
          dailyData[date] = { income: [], expenses: [] };
        }
        if (transaction.type === 'income') {
          dailyData[date].income.push(transaction);
        } else {
          dailyData[date].expenses.push(transaction);
        }
      });

      dispatch({
        type: ActionTypes.BULK_UPDATE, payload: {
          dailyData,
          settings: settingsResponse.data,
          syncStatus: 'synced'
        }
      });

    } catch (error) {
      const errorResult = apiHelpers.handleError(error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: errorResult.error });
      dispatch({ type: ActionTypes.SET_SYNC_STATUS, payload: 'error' });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Sync data when coming back online
  useEffect(() => {
    if (state.isOnline && state.syncStatus === 'offline' && isAuthenticated) {
      loadInitialData();
    }
  }, [state.isOnline, isAuthenticated]);

  // Action creators
  const actions = {
    setCurrentDate: (date) => {
      dispatch({ type: ActionTypes.SET_CURRENT_DATE, payload: date });
      // Load data for new month if needed
      if (new Date(date).getMonth() !== new Date(state.currentDate).getMonth()) {
        loadInitialData();
      }
    },

    addIncome: async (date, incomeData) => {
      if (!state.isOnline) {
        return { success: false, error: "Cannot add transactions while offline" };
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      try {
        const transactionData = {
          ...incomeData,
          type: 'income',
          date,
          amount: parseFloat(incomeData.amount),
        };

        const response = await transactionsAPI.create(transactionData);
        const transaction = response.data;

        dispatch({
          type: ActionTypes.ADD_TRANSACTION,
          payload: { date, transaction }
        });

        return { success: true, data: transaction };
      } catch (error) {
        const errorResult = apiHelpers.handleError(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorResult.error });
        return errorResult;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    addExpense: async (date, expenseData) => {
      if (!state.isOnline) {
        return { success: false, error: "Cannot add transactions while offline" };
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      try {
        const transactionData = {
          ...expenseData,
          type: 'expense',
          date,
          amount: parseFloat(expenseData.amount),
        };

        const response = await transactionsAPI.create(transactionData);
        const transaction = response.data;

        dispatch({
          type: ActionTypes.ADD_TRANSACTION,
          payload: { date, transaction }
        });

        return { success: true, data: transaction };
      } catch (error) {
        const errorResult = apiHelpers.handleError(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorResult.error });
        return errorResult;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    updateTransaction: async (transactionId, updatedData) => {
      if (!state.isOnline) {
        return { success: false, error: "Cannot update transactions while offline" };
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      try {
        const response = await transactionsAPI.update(transactionId, updatedData);
        const updatedTransaction = response.data;

        dispatch({
          type: ActionTypes.UPDATE_TRANSACTION,
          payload: {
            date: updatedTransaction.date,
            transactionId,
            updatedTransaction
          }
        });

        return { success: true, data: updatedTransaction };
      } catch (error) {
        const errorResult = apiHelpers.handleError(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorResult.error });
        return errorResult;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    deleteTransaction: async (transactionId, date) => {
      if (!state.isOnline) {
        return { success: false, error: "Cannot delete transactions while offline" };
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      try {
        await transactionsAPI.delete(transactionId);

        dispatch({
          type: ActionTypes.DELETE_TRANSACTION,
          payload: { date, transactionId }
        });

        return { success: true };
      } catch (error) {
        const errorResult = apiHelpers.handleError(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorResult.error });
        return errorResult;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    updateSettings: async (newSettings) => {
      const updatedSettings = { ...state.settings, ...newSettings };

      // Update local state immediately
      dispatch({ type: ActionTypes.SET_SETTINGS, payload: updatedSettings });

      if (state.isOnline) {
        try {
          await settingsAPI.update(updatedSettings);
          return { success: true };
        } catch (error) {
          // Revert on error
          dispatch({ type: ActionTypes.SET_SETTINGS, payload: state.settings });
          const errorResult = apiHelpers.handleError(error);
          dispatch({ type: ActionTypes.SET_ERROR, payload: errorResult.error });
          return errorResult;
        }
      }

      return { success: true, warning: "Settings saved locally. Will sync when online." };
    },

    calculateDayStats: (date) => {
      const dayData = state.dailyData[date] || { income: [], expenses: [] };
      const totalIncome = dayData.income.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = dayData.expenses.reduce((sum, item) => sum + item.amount, 0);
      const balance = totalIncome - totalExpenses;
      const transactionCount = dayData.income.length + dayData.expenses.length;

      // Category breakdown
      const categoryTotals = {};
      dayData.expenses.forEach((expense) => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
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

    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    refreshData: () => {
      if (isAuthenticated && state.isOnline) {
        return loadInitialData();
      }
      return Promise.resolve();
    },

    // Bulk operations
    bulkDeleteTransactions: async (transactionIds) => {
      if (!state.isOnline) {
        return { success: false, error: "Cannot delete transactions while offline" };
      }

      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      try {
        await transactionsAPI.bulkDelete(transactionIds);

        // Refresh data to get updated state
        await loadInitialData();

        return { success: true, message: `Deleted ${transactionIds.length} transactions` };
      } catch (error) {
        const errorResult = apiHelpers.handleError(error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: errorResult.error });
        return errorResult;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },
  };

  const contextValue = {
    ...state,
    ...actions,
    isAuthenticated,
    user,
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