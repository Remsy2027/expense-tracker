// src/App.jsx
import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ExpenseProvider } from "./context/ExpenseContext";
import { NotificationProvider } from "./hooks/useNotifications";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Main app components (existing)
import Header from "./components/common/Header";
import MobileMenu from "./components/common/MobileMenu";
import Notifications from "./components/common/Notifications";
import DateSelector from "./components/dashboard/DateSelector";
import SummaryCards from "./components/dashboard/SummaryCards";
import QuickActions from "./components/dashboard/QuickActions";
import TransactionList from "./components/transactions/TransactionList";
import Charts from "./components/analytics/Charts";
import BudgetOverview from "./components/budget/BudgetOverview";

// Authentication wrapper component
const AuthWrapper = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-700">
            Loading ExpenseFlow...
          </h2>
          <p className="mt-2 text-gray-500">
            Checking your authentication status
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  return children;
};

// Navigation configuration
const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "Home",
    description: "Overview and quick actions",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: "List",
    description: "View and manage all transactions",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "BarChart3",
    description: "Charts and financial insights",
  },
  {
    id: "budget",
    label: "Budget",
    icon: "Wallet",
    description: "Monthly budget tracking",
  },
];

// Enhanced Expense Data Hook with API integration
const useExpenseDataWithAPI = (currentDate) => {
  const { apiCall } = useAuth();
  const [dailyData, setDailyData] = useState({});
  const [calculations, setCalculations] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
    categoryTotals: {},
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch transactions from API
  const fetchTransactions = async (date) => {
    try {
      setIsLoading(true);
      const response = await apiCall(`/api/transactions?date=${date}`);
      
      // Transform API data to match existing format
      const transformedData = {
        income: response.transactions
          .filter(t => t.type === 'income')
          .map(t => ({
            id: t.id,
            source: t.source,
            amount: parseFloat(t.amount),
            time: new Date(t.created_at).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            createdAt: t.created_at,
          })),
        expenses: response.transactions
          .filter(t => t.type === 'expense')
          .map(t => ({
            id: t.id,
            description: t.description,
            category: t.category,
            amount: parseFloat(t.amount),
            time: new Date(t.created_at).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            createdAt: t.created_at,
          })),
      };

      setDailyData(prev => ({ ...prev, [date]: transformedData }));
      calculateStats(transformedData);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const totalIncome = data.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = data.expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpenses;
    const transactionCount = data.income.length + data.expenses.length;
    
    const categoryTotals = {};
    data.expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    setCalculations({
      totalIncome,
      totalExpenses,
      balance,
      transactionCount,
      categoryTotals,
    });
  };

  // Add income
  const addIncome = async (incomeData) => {
    try {
      const response = await apiCall('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'income',
          source: incomeData.source,
          amount: parseFloat(incomeData.amount),
          transaction_date: currentDate,
        }),
      });

      // Refresh data
      await fetchTransactions(currentDate);
      
      return { success: true, data: response.transaction };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Add expense
  const addExpense = async (expenseData) => {
    try {
      const response = await apiCall('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'expense',
          description: expenseData.description,
          category: expenseData.category,
          amount: parseFloat(expenseData.amount),
          transaction_date: currentDate,
        }),
      });

      // Refresh data
      await fetchTransactions(currentDate);
      
      return { success: true, data: response.transaction };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Delete transaction
  const deleteTransaction = async (transactionId) => {
    try {
      await apiCall(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      // Refresh data
      await fetchTransactions(currentDate);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fetch data when date changes
  useEffect(() => {
    if (currentDate) {
      fetchTransactions(currentDate);
    }
  }, [currentDate]);

  return {
    dailyData,
    calculations,
    addIncome,
    addExpense,
    deleteTransaction,
    isLoading,
    currentDayData: dailyData[currentDate] || { income: [], expenses: [] },
  };
};

// Main App Content Component
const AppContent = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Use enhanced expense data hook
  const {
    dailyData,
    calculations,
    addIncome,
    addExpense,
    deleteTransaction,
    isLoading,
    currentDayData,
  } = useExpenseDataWithAPI(currentDate);

  // Handle tab switching
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle date changes
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  // Quick date navigation
  const setQuickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setCurrentDate(date.toISOString().split("T")[0]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        const keyToTab = {
          1: "dashboard",
          2: "transactions",
          3: "analytics",
          4: "budget",
        };

        const targetTab = keyToTab[event.key];
        if (targetTab) {
          event.preventDefault();
          setActiveTab(targetTab);
        }
      }

      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Render tab content
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <SummaryCards
              calculations={calculations}
              currentDate={currentDate}
            />
            <QuickActions onAddIncome={addIncome} onAddExpense={addExpense} />
          </div>
        );

      case "transactions":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionList
              type="income"
              title="Income Transactions"
              data={currentDayData.income}
              onDelete={(id) => deleteTransaction(id)}
              emptyMessage="No income recorded for this date"
            />
            <TransactionList
              type="expenses"
              title="Expense Transactions"
              data={currentDayData.expenses}
              onDelete={(id) => deleteTransaction(id)}
              emptyMessage="No expenses recorded for this date"
            />
          </div>
        );

      case "analytics":
        return (
          <Charts
            calculations={calculations}
            dailyData={dailyData}
            currentDate={currentDate}
          />
        );

      case "budget":
        return (
          <BudgetOverview
            calculations={calculations}
            currentDate={currentDate}
          />
        );

      default:
        return (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              The requested page could not be found.
            </p>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="btn bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={NAV_ITEMS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onLogout={logout}
      />

      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onMobileMenuToggle={toggleMobileMenu}
        navItems={NAV_ITEMS}
        user={user}
        onLogout={logout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selector */}
        <DateSelector
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onQuickDate={setQuickDate}
        />

        {/* Tab Content */}
        <div className="animate-fade-in mt-8">{renderTabContent()}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">💰</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  ExpenseFlow
                </span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Your personal finance companion for smarter money management.
                Track expenses, manage budgets, and visualize your financial
                data with ease.
              </p>
              <p className="text-sm text-gray-500">
                Logged in as: <strong>{user?.name}</strong> ({user?.email})
              </p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Features
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Expense Tracking</li>
                <li>Budget Management</li>
                <li>Data Visualization</li>
                <li>Monthly Reports</li>
                <li>Category Analysis</li>
                <li>Data Sync & Backup</li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Account
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <button className="hover:text-indigo-600 transition-colors">
                    Profile Settings
                  </button>
                </li>
                <li>
                  <button className="hover:text-indigo-600 transition-colors">
                    Export Data
                  </button>
                </li>
                <li>
                  <button className="hover:text-indigo-600 transition-colors">
                    Import Data
                  </button>
                </li>
                <li>
                  <button 
                    onClick={logout}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600">
                © 2024 ExpenseFlow. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0 flex items-center space-x-6 text-sm text-gray-600">
                <span>Built with React & Node.js</span>
                <span>•</span>
                <span>Dockerized for TrueNAS</span>
                <span>•</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App Component with All Providers
const App = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AuthWrapper>
          <ExpenseProvider>
            <AppContent />
          </ExpenseProvider>
        </AuthWrapper>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;