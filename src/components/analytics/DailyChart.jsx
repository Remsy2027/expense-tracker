import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const DailyChart = ({
  calculations,
  className = "",
  height = 280,
}) => {
  // Clean chart data
  const chartData = [
    {
      name: "Income",
      value: calculations.totalIncome,
      fill: "#10B981",
      icon: TrendingUp,
      description: "Money earned today",
    },
    {
      name: "Expenses",
      value: calculations.totalExpenses,
      fill: "#EF4444",
      icon: TrendingDown,
      description: "Money spent today",
    },
    {
      name: "Balance",
      value: Math.max(0, calculations.balance),
      fill: calculations.balance >= 0 ? "#3B82F6" : "#F59E0B",
      icon: DollarSign,
      description: calculations.balance >= 0 ? "Positive balance" : "Negative balance",
    },
  ];

  // Clean tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.fill }}
            />
            <h4 className="font-semibold text-gray-900">{label}</h4>
          </div>
          <p className="text-xl font-bold" style={{ color: data.fill }}>
            {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`card ${className}`}>
      {/* Clean Header */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Daily Overview
          </h3>
          <p className="text-sm text-gray-500">
            Today's financial summary
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {chartData.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={item.name} className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <IconComponent
                  className="h-4 w-4"
                  style={{ color: item.fill }}
                />
                <span className="text-sm font-medium text-gray-600">
                  {item.name}
                </span>
              </div>
              <p className="text-lg font-bold" style={{ color: item.fill }}>
                {formatCurrency(item.value)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Clean Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
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
            tickFormatter={(value) =>
              `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            radius={[8, 8, 0, 0]}
            cursor="pointer"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Clean Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <div className="text-sm text-blue-800">
          {calculations.balance > 0 ? (
            <p>
              ✅ Great! You have a positive balance of{" "}
              <strong>{formatCurrency(calculations.balance)}</strong> today.
            </p>
          ) : calculations.balance < 0 ? (
            <p>
              ⚠️ You've overspent by{" "}
              <strong>{formatCurrency(Math.abs(calculations.balance))}</strong> today.
            </p>
          ) : (
            <p>⚖️ You've broken even today with no surplus or deficit.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChart;