import React from 'react';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, getDaysInMonth } from '../../utils/helpers';

const MonthlyProgress = ({ 
  calculations, 
  currentDate, 
  budgetGoals, 
  budgetPerformance,
  className = ""
}) => {
  const currentDay = new Date(currentDate).getDate();
  const daysInMonth = getDaysInMonth(currentDate);
  const monthProgress = (currentDay / daysInMonth) * 100;
  const monthName = new Date(currentDate).toLocaleDateString('en-US', { month: 'long' });

  // Calculate daily averages and projections
  const dailyAverages = {
    income: calculations.monthlyIncome / currentDay,
    expenses: calculations.monthlyExpenses / currentDay,
    savings: calculations.monthlySavings / currentDay
  };

  const projections = {
    income: dailyAverages.income * daysInMonth,
    expenses: dailyAverages.expenses * daysInMonth,
    savings: dailyAverages.savings * daysInMonth
  };

  // Calculate remaining targets
  const remaining = {
    income: Math.max(0, budgetGoals.monthlyIncome - calculations.monthlyIncome),
    expenses: Math.max(0, budgetGoals.monthlyExpenses - calculations.monthlyExpenses),
    savings: Math.max(0, budgetGoals.savingsTarget - calculations.monthlySavings)
  };

  const remainingDays = daysInMonth - currentDay;
  const dailyTargets = {
    income: remainingDays > 0 ? remaining.income / remainingDays : 0,
    expenses: remainingDays > 0 ? remaining.expenses / remainingDays : 0,
    savings: remainingDays > 0 ? remaining.savings / remainingDays : 0
  };

  // Progress indicators
  const progressItems = [
    {
      id: 'income',
      title: 'Monthly Income',
      current: calculations.monthlyIncome,
      target: budgetGoals.monthlyIncome,
      progress: budgetPerformance.incomeProgress,
      projected: projections.income,
      dailyAverage: dailyAverages.income,
      dailyTarget: dailyTargets.income,
      color: 'green',
      icon: TrendingUp,
      isGood: budgetPerformance.incomeProgress >= (monthProgress * 0.8) // Should be at least 80% of time progress
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      current: calculations.monthlyExpenses,
      target: budgetGoals.monthlyExpenses,
      progress: budgetPerformance.expenseProgress,
      projected: projections.expenses,
      dailyAverage: dailyAverages.expenses,
      dailyTarget: dailyTargets.expenses,
      color: 'red',
      icon: TrendingDown,
      isGood: budgetPerformance.expenseProgress <= (monthProgress * 1.2) // Should not exceed 120% of time progress
    },
    {
      id: 'savings',
      title: 'Monthly Savings',
      current: calculations.monthlySavings,
      target: budgetGoals.savingsTarget,
      progress: budgetPerformance.savingsProgress,
      projected: projections.savings,
      dailyAverage: dailyAverages.savings,
      dailyTarget: dailyTargets.savings,
      color: 'blue',
      icon: Target,
      isGood: budgetPerformance.savingsProgress >= (monthProgress * 0.8)
    }
  ];

  const getProgressColor = (item) => {
    if (item.id === 'expenses') {
      return item.progress <= 80 ? 'bg-green-500' :
             item.progress <= 100 ? 'bg-yellow-500' : 'bg-red-500';
    } else {
      return item.progress >= 80 ? 'bg-green-500' :
             item.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500';
    }
  };

  const getStatusIcon = (item) => {
    if (item.isGood) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Progress Tracking</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Day {currentDay} of {daysInMonth}</p>
            <p className="text-xs text-gray-500">{monthName}</p>
          </div>
        </div>

        {/* Month timeline */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Month Progress</span>
            <span>{monthProgress.toFixed(1)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${monthProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Start</span>
            <span>{remainingDays} days left</span>
            <span>End</span>
          </div>
        </div>
      </div>

      {/* Progress Items */}
      <div className="p-6 space-y-6">
        {progressItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    item.color === 'green' ? 'bg-green-100' :
                    item.color === 'red' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      item.color === 'green' ? 'text-green-600' :
                      item.color === 'red' ? 'text-red-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  {getStatusIcon(item)}
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(item.current)}
                  </p>
                  <p className="text-sm text-gray-500">
                    of {formatCurrency(item.target)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.min(item.progress, 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(item)}`}
                    style={{ width: `${Math.min(item.progress, 100)}%` }}
                  />
                </div>
                {item.progress > 100 && (
                  <p className="text-xs text-red-600 mt-1">
                    Over target by {formatCurrency(item.current - item.target)}
                  </p>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Daily Average</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.dailyAverage)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Projected Total</p>
                  <p className={`font-medium ${
                    item.id === 'expenses' 
                      ? item.projected > item.target ? 'text-red-600' : 'text-gray-900'
                      : item.projected >= item.target ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {formatCurrency(item.projected)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">
                    {item.id === 'expenses' ? 'Budget Left' : 'Target Left'}
                  </p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(Math.abs(item.target - item.current))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Daily Need</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.dailyTarget)}
                  </p>
                </div>
              </div>

              {/* Status message */}
              <div className={`mt-3 p-3 rounded-lg ${
                item.isGood 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-sm ${
                  item.isGood ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {item.id === 'income' && item.isGood && 
                    `Great! Your income is on track. Keep up the good work.`}
                  {item.id === 'income' && !item.isGood && 
                    `Consider additional income sources to reach your ${formatCurrency(item.target)} goal.`}
                  
                  {item.id === 'expenses' && item.isGood && 
                    `Good job controlling expenses. Stay within your ${formatCurrency(item.target)} budget.`}
                  {item.id === 'expenses' && !item.isGood && 
                    `Monitor spending closely. You need to limit expenses to ${formatCurrency(item.dailyTarget)}/day.`}
                  
                  {item.id === 'savings' && item.isGood && 
                    `Excellent savings progress! You're on track to meet your goal.`}
                  {item.id === 'savings' && !item.isGood && 
                    `Increase savings to ${formatCurrency(item.dailyTarget)}/day to reach your target.`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="px-6 pb-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-indigo-800 mb-2">Month Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-700">
                <div>
                  <p className="font-medium">Income Status</p>
                  <p>
                    {budgetPerformance.incomeOnTrack 
                      ? `On track to meet income goal` 
                      : `Need ${formatCurrency(dailyTargets.income)}/day to reach goal`}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Expense Status</p>
                  <p>
                    {budgetPerformance.expenseOnTrack 
                      ? `Staying within expense budget` 
                      : `Over budget - reduce by ${formatCurrency(dailyTargets.expenses)}/day`}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Savings Status</p>
                  <p>
                    {budgetPerformance.savingsOnTrack 
                      ? `Meeting savings target` 
                      : `Increase savings by ${formatCurrency(dailyTargets.savings)}/day`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyProgress;