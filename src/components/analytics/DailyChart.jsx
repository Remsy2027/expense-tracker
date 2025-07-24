import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const DailyChart = ({ 
  calculations, 
  className = "",
  showComparison = false,
  previousData = null,
  height = 300,
  animated = true
}) => {
  const [activeBar, setActiveBar] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Prepare chart data
  const chartData = [
    {
      name: 'Income',
      value: calculations.totalIncome,
      fill: '#10b981',
      icon: TrendingUp,
      description: "Total money earned today",
      change: previousData ? calculations.totalIncome - (previousData.totalIncome || 0) : 0
    },
    {
      name: 'Expenses',
      value: calculations.totalExpenses,
      fill: '#ef4444',
      icon: TrendingDown,
      description: "Total money spent today",
      change: previousData ? calculations.totalExpenses - (previousData.totalExpenses || 0) : 0
    },
    {
      name: 'Balance',
      value: Math.max(0, calculations.balance),
      fill: calculations.balance >= 0 ? '#3b82f6' : '#f59e0b',
      icon: DollarSign,
      description: calculations.balance >= 0 ? "Positive balance (surplus)" : "Negative balance (deficit)",
      change: previousData ? calculations.balance - (previousData.balance || 0) : 0
    }
  ];

  // Filter data based on selected metric
  const filteredData = selectedMetric === 'all' 
    ? chartData 
    : chartData.filter(item => item.name.toLowerCase() === selectedMetric);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.fill }}
            />
            <h4 className="font-semibold text-gray-900">{label}</h4>
          </div>
          
          <p className="text-2xl font-bold mb-2" style={{ color: data.fill }}>
            {formatCurrency(data.value)}
          </p>
          
          <p className="text-sm text-gray-600 mb-2">{data.description}</p>
          
          {showComparison && data.change !== 0 && (
            <div className={`flex items-center space-x-1 text-sm ${
              data.change > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.change > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>
                {data.change > 0 ? '+' : ''}{formatCurrency(Math.abs(data.change))} vs yesterday
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Handle bar click
  const handleBarClick = (data, index) => {
    setActiveBar(activeBar === index ? null : index);
  };

  // Calculate percentages for comparison
  const totalAmount = chartData.reduce((sum, item) => sum + Math.abs(item.value), 0);
  const getPercentage = (value) => totalAmount > 0 ? ((Math.abs(value) / totalAmount) * 100).toFixed(1) : 0;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Daily Financial Overview</h3>
          </div>
          
          {/* Metric selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Metrics</option>
            <option value="income">Income Only</option>
            <option value="expenses">Expenses Only</option>
            <option value="balance">Balance Only</option>
          </select>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          {chartData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <IconComponent className="h-4 w-4" style={{ color: item.fill }} />
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
                <p className="text-lg font-bold" style={{ color: item.fill }}>
                  {formatCurrency(item.value)}
                </p>
                <p className="text-xs text-gray-500">{getPercentage(item.value)}% of total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onClick={handleBarClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
              stroke="#ffffff"
              strokeWidth={2}
              cursor="pointer"
            >
              {filteredData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={activeBar === index ? `${entry.fill}CC` : entry.fill}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Quick Insights</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {calculations.balance > 0 ? (
                  <p>✅ You're in the green today with a positive balance of {formatCurrency(calculations.balance)}</p>
                ) : calculations.balance < 0 ? (
                  <p>⚠️ You've overspent by {formatCurrency(Math.abs(calculations.balance))} today</p>
                ) : (
                  <p>⚖️ You've broken even today with no surplus or deficit</p>
                )}
                
                {calculations.totalExpenses > calculations.totalIncome && calculations.totalIncome > 0 && (
                  <p>📈 Expenses are {((calculations.totalExpenses / calculations.totalIncome - 1) * 100).toFixed(1)}% higher than income</p>
                )}
                
                {calculations.transactionCount > 0 && (
                  <p>📊 Average transaction amount: {formatCurrency(calculations.totalExpenses / calculations.transactionCount)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison with previous day */}
      {showComparison && previousData && (
        <div className="px-6 pb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Compared to Yesterday</h4>
          <div className="grid grid-cols-3 gap-4">
            {chartData.map((item, index) => {
              const change = item.change;
              const isPositive = change > 0;
              const isNeutral = change === 0;
              
              return (
                <div key={index} className="text-center">
                  <p className="text-xs text-gray-500 mb-1">{item.name}</p>
                  {isNeutral ? (
                    <p className="text-sm font-medium text-gray-500">No change</p>
                  ) : (
                    <div className={`flex items-center justify-center space-x-1 ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="text-sm font-medium">
                        {formatCurrency(Math.abs(change))}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyChart;