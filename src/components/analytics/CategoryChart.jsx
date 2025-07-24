import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  PieChart as PieChartIcon,
  BarChart3,
  TrendingDown,
  Eye,
  EyeOff,
} from "lucide-react";
import { CATEGORIES } from "../../utils/constants";
import { formatCurrency } from "../../utils/helpers";

const CategoryChart = ({
  calculations,
  className = "",
  showAsBar = false,
  interactive = true,
  showLegend = true,
  height = 300,
}) => {
  const [viewType, setViewType] = useState(showAsBar ? "bar" : "pie");
  const [hiddenCategories, setHiddenCategories] = useState(new Set());
  const [activeIndex, setActiveIndex] = useState(null);

  // Prepare category data
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
        fill: categoryInfo?.color || "#6b7280",
        icon: categoryInfo?.icon || "📦",
        percentage: percentage.toFixed(1),
        description: categoryInfo?.description || "Other expenses",
      };
    })
    .sort((a, b) => b.value - a.value);

  // Filter out hidden categories
  const visibleData = categoryData.filter(
    (item) => !hiddenCategories.has(item.name),
  );

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: data.fill }}
            />
            <span className="text-lg">{data.icon}</span>
            <h4 className="font-semibold text-gray-900">{data.name}</h4>
          </div>

          <div className="space-y-1">
            <p className="text-xl font-bold" style={{ color: data.fill }}>
              {formatCurrency(data.value)}
            </p>
            <p className="text-sm font-medium text-gray-600">
              {data.percentage}% of total expenses
            </p>
            <p className="text-xs text-gray-500">{data.description}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = ({ payload }) => (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {payload.map((entry, index) => (
        <div
          key={index}
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
            hiddenCategories.has(entry.value)
              ? "bg-gray-100 opacity-50"
              : "bg-gray-50 hover:bg-gray-100"
          }`}
          onClick={() => toggleCategory(entry.value)}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700 flex-1 truncate">
            {entry.value}
          </span>
          <span className="text-xs text-gray-500">
            {categoryData.find((c) => c.name === entry.value)?.percentage}%
          </span>
        </div>
      ))}
    </div>
  );

  // Toggle category visibility
  const toggleCategory = (categoryName) => {
    if (!interactive) return;

    const newHidden = new Set(hiddenCategories);
    if (newHidden.has(categoryName)) {
      newHidden.delete(categoryName);
    } else {
      newHidden.add(categoryName);
    }
    setHiddenCategories(newHidden);
  };

  // Handle pie segment hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Render pie chart
  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={visibleData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
        >
          {visibleData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={activeIndex === index ? `${entry.fill}DD` : entry.fill}
              stroke={activeIndex === index ? "#ffffff" : "none"}
              strokeWidth={activeIndex === index ? 2 : 0}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend content={<CustomLegend />} />}
      </PieChart>
    </ResponsiveContainer>
  );

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={visibleData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickFormatter={(value) =>
            `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
          }
        />
        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  if (categoryData.length === 0) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Expense Categories
            </h3>
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PieChartIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
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
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Expense Categories
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType("pie")}
                className={`p-2 rounded-md transition-colors ${
                  viewType === "pie"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <PieChartIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewType("bar")}
                className={`p-2 rounded-md transition-colors ${
                  viewType === "bar"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-lg font-bold text-gray-900">
              {categoryData.length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(calculations.totalExpenses)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Top Category</p>
            <p className="text-lg font-bold text-gray-900">
              {categoryData[0]?.icon} {categoryData[0]?.name}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Highest %</p>
            <p className="text-lg font-bold text-purple-600">
              {categoryData[0]?.percentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {viewType === "pie" ? renderPieChart() : renderBarChart()}
      </div>

      {/* Category List */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">
            Category Breakdown
          </h4>
          <button
            onClick={() => setHiddenCategories(new Set())}
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <Eye className="h-3 w-3" />
            <span>Show All</span>
          </button>
        </div>

        <div className="space-y-2">
          {categoryData.map((category, index) => {
            const isHidden = hiddenCategories.has(category.name);
            return (
              <div
                key={category.name}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                  isHidden
                    ? "border-gray-200 bg-gray-50 opacity-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.fill }}
                  />
                  <span className="text-lg">{category.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-500">
                      {category.description}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(category.value)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.percentage}%
                    </p>
                  </div>
                  {interactive && (
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      {isHidden ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="px-6 pb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <TrendingDown className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 mb-1">
                Spending Insights
              </h4>
              <div className="text-sm text-amber-700 space-y-1">
                {categoryData.length > 0 && (
                  <p>
                    Your highest expense category is{" "}
                    <strong>{categoryData[0].name}</strong>
                    accounting for{" "}
                    <strong>{categoryData[0].percentage}%</strong> of total
                    spending.
                  </p>
                )}
                {categoryData.length > 2 && (
                  <p>
                    Top 3 categories represent{" "}
                    <strong>
                      {categoryData
                        .slice(0, 3)
                        .reduce(
                          (sum, cat) => sum + parseFloat(cat.percentage),
                          0,
                        )
                        .toFixed(1)}
                      %
                    </strong>{" "}
                    of your expenses.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryChart;
