import React from "react";
import {
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { formatCurrency, getDaysInMonth } from "../../utils/helpers";
import BudgetCards from "./BudgetCards";

const BudgetOverview = ({ 
  calculations, 
  currentDate, 
  className = "",
  budgetGoals = {
    monthlyIncome: 50000,
    monthlyExpenses: 35000,
    savingsTarget: 15000,
    categories: {
      Food: 8000,
      Transport: 5000,
      Shopping: 4000,
      Bills: 8000,
      Entertainment: 3000,
      Medical: 2000,
      Education: 2000,
      Other: 3000,
    },
  }
}) => {
  // Calculate current month data
  const currentDay = new Date(currentDate).getDate();
  const daysInMonth = getDaysInMonth(currentDate);
  const monthProgress = (currentDay / daysInMonth) * 100;

  // Calculate budget performance
  const budgetPerformance = {
    incomeProgress: (calculations.monthlyIncome / budgetGoals.monthlyIncome) * 100,
    expenseProgress: (calculations.monthlyExpenses / budgetGoals.monthlyExpenses) * 100,
    savingsProgress: (calculations.monthlySavings / budgetGoals.savingsTarget) * 100,
    
    incomeOnTrack: (calculations.monthlyIncome / currentDay) * daysInMonth >= budgetGoals.monthlyIncome,
    expenseOnTrack: (calculations.monthlyExpenses / currentDay) * daysInMonth <= budgetGoals.monthlyExpenses,
  };

  const budgetStatus = {
    overall: budgetPerformance.incomeOnTrack && budgetPerformance.expenseOnTrack ? "good" : "warning",
    message: budgetPerformance.incomeOnTrack && budgetPerformance.expenseOnTrack
      ? "You're on track with your budget!"
      : "Monitor your spending to stay on budget",
  };

  // Top category analysis (simplified)
  const topCategories = Object.entries(budgetGoals.categories)
    .map(([category, budget]) => {
      const spent = calculations.categoryTotals[category] || 0;
      const progress = (spent / budget) * 100;
      
      return {
        category,
        budget,
        spent,
        progress: Math.min(progress, 100),
        status: progress > 100 ? "danger" : progress > 80 ? "warning" : "good",
      };
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 4); // Show top 4

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clean Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Monthly Budget</h2>
              <p className="text-gray-600">
                {new Date(currentDate).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                - Day {currentDay} of {daysInMonth}
              </p>
            </div>
          </div>

          {/* Clean Progress Circle */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - monthProgress / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">
                  {monthProgress.toFixed(0)}%
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Month Progress</p>
          </div>
        </div>

        {/* Clean Status Alert */}
        <div
          className={`mt-4 p-4 rounded-xl ${
            budgetStatus.overall === "good"
              ? "bg-green-50 border border-green-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {budgetStatus.overall === "good" ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
            <p
              className={`font-medium ${
                budgetStatus.overall === "good" ? "text-green-800" : "text-yellow-800"
              }`}
            >
              {budgetStatus.message}
            </p>
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      <BudgetCards
        calculations={calculations}
        budgetGoals={budgetGoals}
        budgetPerformance={budgetPerformance}
        monthProgress={monthProgress}
      />

      {/* Clean Category Summary */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Category Budget Status
            </h3>
            <p className="text-sm text-gray-500">
              Top spending categories this month
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {topCategories.map((category) => (
            <div key={category.category} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{category.category}</h4>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.status === "good"
                        ? "bg-green-100 text-green-700"
                        : category.status === "warning"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {category.progress.toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>{formatCurrency(category.spent)} spent</span>
                  <span>{formatCurrency(category.budget)} budget</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      category.status === "good"
                        ? "bg-green-500"
                        : category.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(category.progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clean Tips */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-900">Budget Tips</h3>
        </div>
        
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Track your daily spending to stay within monthly limits</p>
          <p>• Review your budget weekly and adjust if needed</p>
          <p>• Focus on your top expense categories for maximum impact</p>
          {budgetPerformance.expenseProgress > 80 && (
            <p>• You're at {budgetPerformance.expenseProgress.toFixed(0)}% of your expense budget - monitor closely</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;