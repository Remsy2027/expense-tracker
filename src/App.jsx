import React, { useState, useEffect } from "react";
import { ExpenseProvider } from "./context/ExpenseContext";
import { NotificationProvider } from "./hooks/useNotifications";
import { useExpenseData } from "./hooks/useExpenseData";
import { useNotifications } from "./hooks/useNotifications";

// Component imports
import Header from "./components/common/Header";
import MobileMenu from "./components/common/MobileMenu";
import Notifications from "./components/common/Notifications";
import DateSelector from "./components/dashboard/DateSelector";
import SummaryCards from "./components/dashboard/SummaryCards";
import QuickActions from "./components/dashboard/QuickActions";
import TransactionList from "./components/transactions/TransactionList";
import Charts from "./components/analytics/Charts";
import BudgetOverview from "./components/budget/BudgetOverview";
import LoadingSpinner from "./components/common/LoadingSpinner";

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

const AppContent = () => {
  // State management
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Custom hooks
  const { dailyData, addIncome, addExpense, deleteTransaction, calculations } =
    useExpenseData(currentDate);

  const { notifications } = useNotifications();

  // Handle app initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate app initialization (loading saved data, etc.)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check for saved preferences
        const savedTab = localStorage.getItem("expense-tracker-active-tab");
        if (savedTab && NAV_ITEMS.find((item) => item.id === savedTab)) {
          setActiveTab(savedTab);
        }

        const savedDate = localStorage.getItem("expense-tracker-current-date");
        if (savedDate) {
          setCurrentDate(savedDate);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize app:", error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem("expense-tracker-active-tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("expense-tracker-current-date", currentDate);
  }, [currentDate]);

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

      // Escape key to close mobile menu
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Render loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">
            Loading ExpenseFlow...
          </h2>
          <p className="mt-2 text-gray-500">
            Preparing your financial dashboard
          </p>
        </div>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    const currentData = dailyData[currentDate] || { income: [], expenses: [] };

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
              data={currentData.income}
              onDelete={(id) => deleteTransaction(id, "income")}
              emptyMessage="No income recorded for this date"
            />
            <TransactionList
              type="expenses"
              title="Expense Transactions"
              data={currentData.expenses}
              onDelete={(id) => deleteTransaction(id, "expenses")}
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
      />

      {/* Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onMobileMenuToggle={toggleMobileMenu}
        navItems={NAV_ITEMS}
      />

      {/* Notifications */}
      <Notifications notifications={notifications} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selector */}
        <DateSelector
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onQuickDate={setQuickDate}
        />

        {/* Tab Content */}
        <div className="animate-fade-in">{renderTabContent()}</div>
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
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <span className="sr-only">GitHub</span>
                  🐙
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  💼
                </a>
              </div>
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
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
                Support
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Contact Us
                  </a>
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
                <span>Built with React & Tailwind CSS</span>
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

// Main App Component with Providers
const App = () => {
  return (
    <NotificationProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </NotificationProvider>
  );
};

export default App;
