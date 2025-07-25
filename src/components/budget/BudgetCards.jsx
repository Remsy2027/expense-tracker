import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

const BudgetCards = ({
  calculations,
  budgetGoals,
  budgetPerformance,
  monthProgress,
  className = "",
}) => {
  const cards = [
    {
      id: "income",
      title: "Monthly Income",
      current: calculations.monthlyIncome,
      target: budgetGoals.monthlyIncome,
      progress: budgetPerformance.incomeProgress,
      icon: TrendingUp,
      color: "green",
      type: "income",
    },
    {
      id: "expenses",
      title: "Monthly Expenses",
      current: calculations.monthlyExpenses,
      target: budgetGoals.monthlyExpenses,
      progress: budgetPerformance.expenseProgress,
      icon: TrendingDown,
      color: "red",
      type: "expense",
    },
    {
      id: "savings",
      title: "Monthly Savings",
      current: calculations.monthlySavings,
      target: budgetGoals.savingsTarget,
      progress: budgetPerformance.savingsProgress,
      icon: Target,
      color: "blue",
      type: "savings",
    },
    {
      id: "balance",
      title: "Current Balance",
      current: calculations.balance,
      target: null,
      progress: null,
      icon: DollarSign,
      color: calculations.balance >= 0 ? "blue" : "orange",
      type: "balance",
    },
  ];

  const getStatusInfo = (card) => {
    if (card.type === "balance") {
      return {
        status: card.current >= 0 ? "good" : "poor",
        message: card.current >= 0 ? "Positive balance" : "Negative balance",
        icon: card.current >= 0 ? CheckCircle : AlertCircle,
      };
    }

    if (!card.target) {
      return { status: "neutral", message: "No target set", icon: AlertCircle };
    }

    const timeProgress = monthProgress;
    let status, message, icon;

    if (card.type === "expense") {
      if (card.progress <= timeProgress) {
        status = "good";
        message = "On track";
        icon = CheckCircle;
      } else if (card.progress <= 100) {
        status = "warning";
        message = "Monitor closely";
        icon = AlertCircle;
      } else {
        status = "danger";
        message = "Over budget";
        icon = AlertCircle;
      }
    } else {
      if (card.progress >= timeProgress * 0.8) {
        status = "good";
        message = "On track";
        icon = CheckCircle;
      } else {
        status = "warning";
        message = "Behind target";
        icon = AlertCircle;
      }
    }

    return { status, message, icon };
  };

  const getCardColor = (card) => {
    const statusInfo = getStatusInfo(card);
    
    if (statusInfo.status === "good") {
      return "border-green-200 bg-green-50";
    } else if (statusInfo.status === "warning") {
      return "border-yellow-200 bg-yellow-50";
    } else if (statusInfo.status === "danger" || statusInfo.status === "poor") {
      return "border-red-200 bg-red-50";
    } else {
      return "border-gray-200 bg-white";
    }
  };

  const getIconColor = (card) => {
    switch (card.color) {
      case "green":
        return "bg-green-100 text-green-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "orange":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {cards.map((card) => {
        const IconComponent = card.icon;
        const statusInfo = getStatusInfo(card);
        const StatusIcon = statusInfo.icon;

        return (
          <div
            key={card.id}
            className={`card hover:shadow-md transition-all duration-200 ${getCardColor(card)}`}
          >
            {/* Clean Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getIconColor(card)}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <StatusIcon className={`h-5 w-5 ${
                statusInfo.status === "good" ? "text-green-600" :
                statusInfo.status === "warning" ? "text-yellow-600" :
                "text-red-600"
              }`} />
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {card.title}
            </h3>

            {/* Current Value */}
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(card.current)}
              </p>
              {card.target && (
                <p className="text-sm text-gray-500">
                  of {formatCurrency(card.target)}
                </p>
              )}
            </div>

            {/* Clean Progress Bar */}
            {card.progress !== null && card.target && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.min(card.progress, 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      statusInfo.status === "good" ? "bg-green-500" :
                      statusInfo.status === "warning" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(card.progress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status */}
            <div className="text-center">
              <span className={`text-sm font-medium ${
                statusInfo.status === "good" ? "text-green-700" :
                statusInfo.status === "warning" ? "text-yellow-700" :
                "text-red-700"
              }`}>
                {statusInfo.message}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetCards;