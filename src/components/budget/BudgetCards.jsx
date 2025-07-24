import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const BudgetCards = ({ 
  calculations, 
  budgetGoals, 
  budgetPerformance, 
  monthProgress,
  className = ""
}) => {
  const cards = [
    {
      id: 'income',
      title: 'Monthly Income',
      current: calculations.monthlyIncome,
      target: budgetGoals.monthlyIncome,
      progress: budgetPerformance.incomeProgress,
      projected: budgetPerformance.projectedIncome,
      icon: TrendingUp,
      color: 'green',
      type: 'income'
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      current: calculations.monthlyExpenses,
      target: budgetGoals.monthlyExpenses,
      progress: budgetPerformance.expenseProgress,
      projected: budgetPerformance.projectedExpenses,
      icon: TrendingDown,
      color: 'red',
      type: 'expense'
    },
    {
      id: 'savings',
      title: 'Monthly Savings',
      current: calculations.monthlySavings,
      target: budgetGoals.savingsTarget,
      progress: budgetPerformance.savingsProgress,
      projected: calculations.monthlySavings, // Savings don't project the same way
      icon: Target,
      color: 'blue',
      type: 'savings'
    },
    {
      id: 'balance',
      title: 'Current Balance',
      current: calculations.balance,
      target: null, // No target for daily balance
      progress: null,
      projected: null,
      icon: DollarSign,
      color: calculations.balance >= 0 ? 'blue' : 'orange',
      type: 'balance'
    }
  ];

  const getStatusInfo = (card) => {
    if (card.type === 'balance') {
      return {
        status: card.current >= 0 ? 'good' : 'poor',
        message: card.current >= 0 ? 'Positive balance' : 'Negative balance',
        icon: card.current >= 0 ? CheckCircle : AlertCircle
      };
    }

    if (!card.target) return { status: 'neutral', message: 'No target set', icon: Clock };

    const timeProgress = monthProgress;
    const expectedProgress = card.type === 'expense' ? timeProgress : timeProgress;
    
    let status, message, icon;
    
    if (card.type === 'expense') {
      if (card.progress <= expectedProgress) {
        status = 'good';
        message = 'On track';
        icon = CheckCircle;
      } else if (card.progress <= 100) {
        status = 'warning';
        message = 'Monitor closely';
        icon = AlertCircle;
      } else {
        status = 'danger';
        message = 'Over budget';
        icon = AlertCircle;
      }
    } else {
      if (card.progress >= expectedProgress * 0.8) {
        status = 'good';
        message = 'On track';
        icon = CheckCircle;
      } else if (card.progress >= expectedProgress * 0.5) {
        status = 'warning';
        message = 'Behind target';
        icon = AlertCircle;
      } else {
        status = 'danger';
        message = 'Significantly behind';
        icon = AlertCircle;
      }
    }

    return { status, message, icon };
  };

  const getCardBackground = (card) => {
    const statusInfo = getStatusInfo(card);
    
    switch (statusInfo.status) {
      case 'good':
        return 'from-green-500 to-green-600';
      case 'warning':
        return 'from-yellow-500 to-yellow-600';
      case 'danger':
        return 'from-red-500 to-red-600';
      case 'poor':
        return 'from-orange-500 to-orange-600';
      default:
        return card.color === 'green' ? 'from-green-500 to-green-600' :
               card.color === 'red' ? 'from-red-500 to-red-600' :
               card.color === 'blue' ? 'from-blue-500 to-blue-600' :
               'from-gray-500 to-gray-600';
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
            className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            {/* Gradient Background */}
            <div className={`bg-gradient-to-br ${getCardBackground(card)} p-6 text-white relative`}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
                                   radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)`
                }} />
              </div>

              {/* Header */}
              <div className="relative flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <IconComponent className="h-6 w-6" />
                </div>
                <StatusIcon className="h-5 w-5" />
              </div>

              {/* Title */}
              <h3 className="text-white/90 text-sm font-medium mb-2">
                {card.title}
              </h3>

              {/* Current Value */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(card.current)}
                </p>
                {card.target && (
                  <p className="text-white/80 text-sm">
                    of {formatCurrency(card.target)}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {card.progress !== null && card.target && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-white/80 mb-1">
                    <span>Progress</span>
                    <span>{Math.min(card.progress, 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white/90 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(card.progress, 100)}%` }}
                    />
                  </div>
                  {card.progress > 100 && (
                    <p className="text-white/90 text-xs mt-1">
                      {formatCurrency(card.current - card.target)} over target
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90 font-medium">
                  {statusInfo.message}
                </span>
                {card.projected && card.projected !== card.current && (
                  <span className="text-white/80">
                    Est: {formatCurrency(card.projected)}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="bg-white p-4 border-t border-gray-200">
              {card.target ? (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Remaining</p>
                    <p className="font-semibold text-gray-900">
                      {card.type === 'expense' 
                        ? formatCurrency(Math.max(0, card.target - card.current))
                        : formatCurrency(Math.max(0, card.target - card.current))
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">
                      {card.type === 'expense' ? 'Budget Left' : 'To Goal'}
                    </p>
                    <p className={`font-semibold ${
                      card.type === 'expense'
                        ? card.current <= card.target ? 'text-green-600' : 'text-red-600'
                        : card.current >= card.target ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {card.type === 'expense'
                        ? card.current <= card.target ? 'Within Budget' : 'Over Budget'
                        : card.current >= card.target ? 'Goal Met' : 'In Progress'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-gray-600">Today's Status</p>
                  <p className={`font-semibold ${
                    card.current >= 0 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {card.current >= 0 ? 'Surplus' : 'Deficit'}
                  </p>
                </div>
              )}
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        );
      })}
    </div>
  );
};

export default BudgetCards;