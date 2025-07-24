import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  List,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  formatCurrency,
  calculatePercentageChange,
  formatPercentage,
} from "../../utils/helpers";

const SummaryCards = ({
  calculations,
  currentDate,
  previousDayData = null,
  showTrends = true,
  showGoals = false,
  monthlyGoals = null,
}) => {
  // Calculate trends if previous day data is available
  const getTrendData = (current, previous, type) => {
    if (!showTrends || !previous) return null;

    const change = calculatePercentageChange(current, previous);
    const isPositive = type === "income" ? change >= 0 : change <= 0; // For expenses, decrease is positive

    return {
      change: Math.abs(change),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
    };
  };

  const cards = [
    {
      id: "income",
      title: "Today's Income",
      value: calculations.totalIncome,
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconColor: "text-green-600",
      trend: getTrendData(
        calculations.totalIncome,
        previousDayData?.totalIncome,
        "income",
      ),
    },
    {
      id: "expenses",
      title: "Today's Expenses",
      value: calculations.totalExpenses,
      icon: TrendingDown,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      iconColor: "text-red-600",
      trend: getTrendData(
        calculations.totalExpenses,
        previousDayData?.totalExpenses,
        "expenses",
      ),
    },
    {
      id: "balance",
      title: "Net Balance",
      value: calculations.balance,
      icon: DollarSign,
      gradient:
        calculations.balance >= 0
          ? "from-blue-500 to-blue-600"
          : "from-orange-500 to-orange-600",
      bgColor: calculations.balance >= 0 ? "bg-blue-50" : "bg-orange-50",
      textColor:
        calculations.balance >= 0 ? "text-blue-700" : "text-orange-700",
      iconColor:
        calculations.balance >= 0 ? "text-blue-600" : "text-orange-600",
      trend: getTrendData(
        calculations.balance,
        previousDayData?.balance,
        "balance",
      ),
    },
    {
      id: "transactions",
      title: "Transactions",
      value: calculations.transactionCount,
      icon: List,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      iconColor: "text-purple-600",
      isCount: true,
      trend: getTrendData(
        calculations.transactionCount,
        previousDayData?.transactionCount,
        "transactions",
      ),
    },
  ];

  // Additional monthly cards if showing goals
  const monthlyCards =
    showGoals && monthlyGoals
      ? [
          {
            id: "monthly-income",
            title: "Monthly Income",
            value: calculations.monthlyIncome,
            target: monthlyGoals.income,
            icon: Calendar,
            gradient: "from-emerald-500 to-emerald-600",
            bgColor: "bg-emerald-50",
            textColor: "text-emerald-700",
            iconColor: "text-emerald-600",
          },
          {
            id: "monthly-expenses",
            title: "Monthly Expenses",
            value: calculations.monthlyExpenses,
            target: monthlyGoals.expenses,
            icon: Target,
            gradient: "from-amber-500 to-amber-600",
            bgColor: "bg-amber-50",
            textColor: "text-amber-700",
            iconColor: "text-amber-600",
          },
        ]
      : [];

  const allCards = [...cards, ...monthlyCards];

  const formatValue = (value, isCount = false) => {
    if (isCount) {
      return value.toString();
    }
    return formatCurrency(value);
  };

  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getProgressStatus = (current, target, type = "income") => {
    if (!target) return null;

    const percentage = (current / target) * 100;

    if (type === "expenses") {
      if (percentage <= 80)
        return {
          status: "success",
          icon: CheckCircle,
          message: "Under budget",
        };
      if (percentage <= 100)
        return {
          status: "warning",
          icon: AlertCircle,
          message: "Near budget limit",
        };
      return { status: "danger", icon: AlertCircle, message: "Over budget" };
    } else {
      if (percentage >= 100)
        return {
          status: "success",
          icon: CheckCircle,
          message: "Goal achieved",
        };
      if (percentage >= 80)
        return {
          status: "warning",
          icon: AlertCircle,
          message: "Close to goal",
        };
      return { status: "info", icon: Target, message: "Working towards goal" };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {allCards.map((card) => {
        const IconComponent = card.icon;
        const hasTarget = card.target !== undefined;
        const progress = hasTarget
          ? getProgressPercentage(card.value, card.target)
          : null;
        const progressStatus = hasTarget
          ? getProgressStatus(
              card.value,
              card.target,
              card.id.includes("expense") ? "expenses" : "income",
            )
          : null;

        return (
          <div
            key={card.id}
            className={`
              relative overflow-hidden rounded-xl border border-gray-200 bg-white
              shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1
              group cursor-pointer
            `}
          >
            {/* Gradient background overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
            />

            {/* Card content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${card.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                </div>

                {/* Trend indicator */}
                {card.trend && (
                  <div
                    className={`flex items-center space-x-1 ${
                      card.trend.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <card.trend.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatPercentage(card.trend.change)}
                    </span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {card.title}
              </h3>

              {/* Value */}
              <div className="mb-4">
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {formatValue(card.value, card.isCount)}
                </p>

                {/* Target comparison */}
                {hasTarget && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Target: {formatCurrency(card.target)}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progressStatus?.status === "success"
                            ? "bg-green-500"
                            : progressStatus?.status === "warning"
                              ? "bg-yellow-500"
                              : progressStatus?.status === "danger"
                                ? "bg-red-500"
                                : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Status message */}
                    {progressStatus && (
                      <div
                        className={`flex items-center space-x-1 mt-2 text-xs ${
                          progressStatus.status === "success"
                            ? "text-green-600"
                            : progressStatus.status === "warning"
                              ? "text-yellow-600"
                              : progressStatus.status === "danger"
                                ? "text-red-600"
                                : "text-blue-600"
                        }`}
                      >
                        <progressStatus.icon className="h-3 w-3" />
                        <span>{progressStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Additional info */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {card.id === "transactions"
                    ? `${card.value} total`
                    : hasTarget
                      ? `Remaining: ${formatCurrency(Math.max(0, card.target - card.value))}`
                      : "Daily total"}
                </span>

                {/* Date indicator */}
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(currentDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </span>
              </div>
            </div>

            {/* Decorative corner element */}
            <div
              className={`absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full`}
            />
          </div>
        );
      })}
    </div>
  );
};

// Compact version for smaller spaces
export const CompactSummaryCards = ({ calculations }) => {
  const cards = [
    {
      label: "Income",
      value: calculations.totalIncome,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Expenses",
      value: calculations.totalExpenses,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Balance",
      value: calculations.balance,
      color: calculations.balance >= 0 ? "text-blue-600" : "text-orange-600",
      bgColor: calculations.balance >= 0 ? "bg-blue-50" : "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-lg p-4 text-center`}
        >
          <p className="text-xs font-medium text-gray-600 mb-1">{card.label}</p>
          <p className={`text-lg font-bold ${card.color}`}>
            {formatCurrency(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
};

// Minimal version for sidebars
export const MinimalSummaryCards = ({ calculations }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Today's Balance</span>
        <span
          className={`font-semibold ${
            calculations.balance >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(calculations.balance)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Transactions</span>
        <span className="font-semibold text-gray-900">
          {calculations.transactionCount}
        </span>
      </div>
    </div>
  );
};

export default SummaryCards;
