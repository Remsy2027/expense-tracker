import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle, 
  CheckCircle,
  DollarSign,
  PieChart,
  BarChart3,
  Settings,
  Plus,
  X
} from 'lucide-react';
import { formatCurrency, getDaysInMonth } from '../../utils/helpers';
import MonthlyProgress from './MonthlyProgress';
import BudgetCards from './BudgetCards';

const BudgetOverview = ({ 
  calculations, 
  currentDate,
  className = ""
}) => {
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [budgetGoals, setBudgetGoals] = useState({
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
      Other: 3000
    }
  });

  // Calculate current month data
  const currentMonth = new Date(currentDate).getMonth();
  const currentYear = new Date(currentDate).getFullYear();
  const daysInMonth = getDaysInMonth(currentDate);
  const currentDay = new Date(currentDate).getDate();
  const monthProgress = (currentDay / daysInMonth) * 100;

  // Calculate budget performance
  const budgetPerformance = {
    incomeProgress: calculations.monthlyIncome / budgetGoals.monthlyIncome * 100,
    expenseProgress: calculations.monthlyExpenses / budgetGoals.monthlyExpenses * 100,
    savingsProgress: calculations.monthlySavings / budgetGoals.savingsTarget * 100,
    
    // Projected end-of-month figures
    projectedIncome: (calculations.monthlyIncome / currentDay) * daysInMonth,
    projectedExpenses: (calculations.monthlyExpenses / currentDay) * daysInMonth,
    
    // Budget status
    incomeOnTrack: (calculations.monthlyIncome / currentDay * daysInMonth) >= budgetGoals.monthlyIncome,
    expenseOnTrack: (calculations.monthlyExpenses / currentDay * daysInMonth) <= budgetGoals.monthlyExpenses,
    savingsOnTrack: calculations.monthlySavings >= (budgetGoals.savingsTarget * currentDay / daysInMonth)
  };

  const budgetStatus = {
    overall: budgetPerformance.incomeOnTrack && budgetPerformance.expenseOnTrack ? 'good' : 
             budgetPerformance.expenseProgress > 100 ? 'danger' : 'warning',
    message: budgetPerformance.incomeOnTrack && budgetPerformance.expenseOnTrack 
      ? 'You\'re on track with your budget!' 
      : budgetPerformance.expenseProgress > 100 
        ? 'You\'ve exceeded your expense budget'
        : 'Monitor your spending to stay on budget'
  };

  // Category budget analysis
  const categoryBudgetAnalysis = Object.entries(budgetGoals.categories).map(([category, budget]) => {
    const spent = calculations.categoryTotals[category] || 0;
    const progress = (spent / budget) * 100;
    const dailyBudget = budget / daysInMonth;
    const projectedSpent = (spent / currentDay) * daysInMonth;
    
    return {
      category,
      budget,
      spent,
      remaining: Math.max(0, budget - spent),
      progress: Math.min(progress, 100),
      overBudget: spent > budget,
      onTrack: projectedSpent <= budget,
      dailyBudget,
      projectedSpent,
      status: spent > budget ? 'danger' : 
              projectedSpent > budget ? 'warning' : 'good'
    };
  }).sort((a, b) => b.progress - a.progress);

  const handleBudgetSave = (newGoals) => {
    setBudgetGoals(newGoals);
    setShowBudgetSetup(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Monthly Budget</h2>
            </div>
            <p className="text-gray-600">
              {new Date(currentDate).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })} - Day {currentDay} of {daysInMonth}
            </p>
          </div>
          
          <button
            onClick={() => setShowBudgetSetup(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Budget Settings</span>
          </button>
        </div>

        {/* Budget Status Alert */}
        <div className={`mt-4 p-4 rounded-lg border ${
          budgetStatus.overall === 'good' 
            ? 'bg-green-50 border-green-200' 
            : budgetStatus.overall === 'danger'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            {budgetStatus.overall === 'good' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className={`h-5 w-5 ${
                budgetStatus.overall === 'danger' ? 'text-red-600' : 'text-yellow-600'
              }`} />
            )}
            <p className={`font-medium ${
              budgetStatus.overall === 'good' 
                ? 'text-green-800' 
                : budgetStatus.overall === 'danger'
                  ? 'text-red-800'
                  : 'text-yellow-800'
            }`}>
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

      {/* Monthly Progress */}
      <MonthlyProgress
        calculations={calculations}
        currentDate={currentDate}
        budgetGoals={budgetGoals}
        budgetPerformance={budgetPerformance}
      />

      {/* Category Budget Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Category Budget Tracking
          </h3>
          <span className="text-sm text-gray-500">
            {categoryBudgetAnalysis.filter(c => c.overBudget).length} over budget
          </span>
        </div>

        <div className="space-y-4">
          {categoryBudgetAnalysis.map((category) => (
            <div key={category.category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{category.category}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.status === 'good' 
                      ? 'bg-green-100 text-green-700'
                      : category.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {category.overBudget ? 'Over Budget' : 
                     category.onTrack ? 'On Track' : 'At Risk'}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(category.remaining)} remaining
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{category.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      category.status === 'good' 
                        ? 'bg-green-500'
                        : category.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(category.progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Additional info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Daily Budget</p>
                  <p className="font-medium">{formatCurrency(category.dailyBudget)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Projected Total</p>
                  <p className={`font-medium ${
                    category.projectedSpent > category.budget ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {formatCurrency(category.projectedSpent)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Budget Tips & Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-blue-800">Smart Saving Tips</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Track your daily spending to stay within budget</li>
              <li>• Set up automatic transfers to your savings account</li>
              <li>• Review and adjust your budget monthly</li>
              <li>• Use the 50/30/20 rule: needs, wants, savings</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-blue-800">This Month's Focus</h4>
            <div className="space-y-2 text-sm text-blue-700">
              {budgetPerformance.expenseProgress > 80 && (
                <p>• Monitor your spending closely - you're at {budgetPerformance.expenseProgress.toFixed(0)}% of budget</p>
              )}
              {budgetPerformance.incomeProgress < 50 && monthProgress > 50 && (
                <p>• Consider additional income sources to meet your goal</p>
              )}
              {calculations.monthlySavings < 0 && (
                <p>• Focus on reducing expenses to improve your savings rate</p>
              )}
              <p>• Your top expense category is {categoryBudgetAnalysis[0]?.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Setup Modal */}
      {showBudgetSetup && (
        <BudgetSetupModal
          currentGoals={budgetGoals}
          onSave={handleBudgetSave}
          onClose={() => setShowBudgetSetup(false)}
        />
      )}
    </div>
  );
};

// Budget Setup Modal Component
const BudgetSetupModal = ({ currentGoals, onSave, onClose }) => {
  const [goals, setGoals] = useState(currentGoals);

  const handleSave = () => {
    onSave(goals);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Budget Settings</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Monthly Goals */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Monthly Goals</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income Target
                </label>
                <input
                  type="number"
                  value={goals.monthlyIncome}
                  onChange={(e) => setGoals(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Expense Limit
                </label>
                <input
                  type="number"
                  value={goals.monthlyExpenses}
                  onChange={(e) => setGoals(prev => ({ ...prev, monthlyExpenses: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Savings Target
                </label>
                <input
                  type="number"
                  value={goals.savingsTarget}
                  onChange={(e) => setGoals(prev => ({ ...prev, savingsTarget: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Category Budgets */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Category Budgets</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(goals.categories).map(([category, amount]) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {category}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setGoals(prev => ({
                      ...prev,
                      categories: {
                        ...prev.categories,
                        [category]: Number(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;