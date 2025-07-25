import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
} from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const Charts = ({
  calculations,
  dailyData,
  currentDate,
}) => {
  // Clean chart data processing
  const chartData = useMemo(() => {
    // Simple overview data
    const overviewData = [
      { name: "Income", value: calculations.totalIncome, fill: "#10B981" },
      { name: "Expenses", value: calculations.totalExpenses, fill: "#EF4444" },
      { name: "Balance", value: Math.max(0, calculations.balance), fill: "#3B82F6" },
    ];

    // Last 7 days trend
    const trendData = [];
    const endDate = new Date(currentDate);
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayData = dailyData[dateStr] || { income: [], expenses: [] };
      const income = dayData.income.reduce((sum, item) => sum + item.amount, 0);
      const expenses = dayData.expenses.reduce((sum, item) => sum + item.amount, 0);
      
      trendData.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        income,
        expenses,
        net: income - expenses,
      });
    }

    return { overviewData, trendData };
  }, [calculations, dailyData, currentDate]);

  // Clean tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.dataKey}:</span>
              <span className="font-semibold">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Financial Overview
          </h2>
          <p className="text-gray-600">
            Your daily and weekly financial insights
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Overview Chart */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Today's Summary</h3>
              <p className="text-sm text-gray-500">Income vs Expenses</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData.overviewData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend Chart */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">7-Day Trend</h3>
              <p className="text-sm text-gray-500">Daily patterns</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10B981" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ r: 4, fill: "#EF4444" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clean Summary Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Weekly Average</h4>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(
                chartData.trendData.reduce((sum, day) => sum + day.income, 0) / 7
              )}
            </p>
            <p className="text-sm text-gray-600">Daily income</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Daily Spending</h4>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(
                chartData.trendData.reduce((sum, day) => sum + day.expenses, 0) / 7
              )}
            </p>
            <p className="text-sm text-gray-600">Average per day</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Net Balance</h4>
            <p className={`text-2xl font-bold ${
              calculations.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {formatCurrency(Math.abs(calculations.balance))}
            </p>
            <p className="text-sm text-gray-600">
              {calculations.balance >= 0 ? 'Surplus' : 'Deficit'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;