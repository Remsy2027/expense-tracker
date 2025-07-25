import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { CATEGORIES } from "../../utils/constants";
import { formatCurrency } from "../../utils/helpers";

const CategoryChart = ({
  calculations,
  className = "",
  height = 280,
}) => {
  // Prepare clean category data
  const categoryData = Object.entries(calculations.categoryTotals || {})
    .map(([category, amount]) => {
      const categoryInfo = CATEGORIES.find((cat) => cat.name === category);
      const percentage =
        calculations.totalExpenses > 0
          ? (amount / calculations.totalExpenses) * 100
          : 0;

      return {
        name: category,
        value: amount,
        fill: categoryInfo?.color || "#9CA3AF",
        icon: categoryInfo?.icon || "📦",
        percentage: percentage.toFixed(1),
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Show only top 6 categories

  // Clean tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{data.icon}</span>
            <h4 className="font-semibold text-gray-900">{data.name}</h4>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            {data.percentage}% of expenses
          </p>
        </div>
      );
    }
    return null;
  };

  if (categoryData.length === 0) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <PieChartIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No expense data
          </h3>
          <p className="text-gray-500">
            Add some expenses to see category breakdown
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      {/* Clean Header */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <PieChartIcon className="h-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Expense Categories
          </h3>
          <p className="text-sm text-gray-500">
            {categoryData.length} categories this period
          </p>
        </div>
      </div>

      {/* Clean Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Clean Category List */}
      <div className="space-y-3">
        {categoryData.map((category, index) => (
          <div
            key={category.name}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.fill }}
              />
              <span className="text-lg">{category.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                <p className="text-sm text-gray-500">
                  {category.percentage}% of total
                </p>
              </div>
            </div>
            <p className="font-semibold text-gray-900">
              {formatCurrency(category.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Clean Summary */}
      {categoryData.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>{categoryData[0].name}</strong> is your top expense category
            at {categoryData[0].percentage}% of total spending
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryChart;