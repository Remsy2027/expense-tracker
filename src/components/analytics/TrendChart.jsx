import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const TrendChart = ({
  calculations,
  dailyData,
  currentDate,
  className = "",
  days = 7,
  height = 280,
}) => {
  // Generate clean trend data
  const trendData = useMemo(() => {
    const data = [];
    const endDate = new Date(currentDate);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayData = dailyData[dateStr] || { income: [], expenses: [] };
      const income = dayData.income.reduce((sum, item) => sum + item.amount, 0);
      const expenses = dayData.expenses.reduce(
        (sum, item) => sum + item.amount,
        0,
      );

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: dateStr,
        income,
        expenses,
        net: income - expenses,
        isToday: dateStr === currentDate,
      });
    }

    return data;
  }, [dailyData, currentDate, days]);

  // Calculate simple statistics
  const stats = useMemo(() => {
    const incomeValues = trendData.map((d) => d.income);
    const expenseValues = trendData.map((d) => d.expenses);
    const netValues = trendData.map((d) => d.net);

    const avgIncome = incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length;
    const avgExpenses = expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;
    const positiveDays = netValues.filter((v) => v > 0).length;

    return {
      avgIncome,
      avgExpenses,
      positiveDays,
      totalDays: trendData.length,
    };
  }, [trendData]);

  // Clean tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{label}</h4>
            {data.isToday && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                Today
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Income</span>
              </div>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(data.income)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600">Expenses</span>
              </div>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(data.expenses)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700">Net</span>
              <span
                className={`text-sm font-bold ${
                  data.net >= 0 ? "text-blue-600" : "text-orange-600"
                }`}
              >
                {formatCurrency(data.net)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`card ${className}`}>
      {/* Clean Header */}
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Activity className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {days}-Day Trend
          </h3>
          <p className="text-sm text-gray-500">
            Income and expenses over time
          </p>
        </div>
      </div>

      {/* Clean Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={trendData}>
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
            tickFormatter={(value) =>
              `₹${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
            }
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

      {/* Clean Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-gray-600">Avg Income</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(stats.avgIncome)}
          </p>
        </div>

        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 bg-red-100 rounded-xl flex items-center justify-center">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-sm text-gray-600">Avg Expenses</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(stats.avgExpenses)}
          </p>
        </div>

        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 bg-blue-100 rounded-xl flex items-center justify-center">
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Positive Days</p>
          <p className="text-lg font-bold text-blue-600">
            {stats.positiveDays}/{stats.totalDays}
          </p>
        </div>
      </div>

      {/* Clean Insight */}
      <div className="mt-6 p-4 bg-green-50 rounded-xl">
        <p className="text-sm text-green-800">
          Over the last {days} days, you had positive balance on{" "}
          <strong>
            {stats.positiveDays} out of {stats.totalDays} days
          </strong>{" "}
          ({((stats.positiveDays / stats.totalDays) * 100).toFixed(0)}%).
        </p>
      </div>
    </div>
  );
};

export default TrendChart;