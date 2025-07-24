import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar,
  BarChart3,
  Eye,
  EyeOff,
  Target
} from 'lucide-react';
import { formatCurrency, calculatePercentageChange } from '../../utils/helpers';

const TrendChart = ({ 
  calculations, 
  dailyData,
  currentDate,
  className = "",
  days = 7,
  showGoals = false,
  goals = null,
  height = 300
}) => {
  const [viewType, setViewType] = useState('area'); // 'line' or 'area'
  const [visibleLines, setVisibleLines] = useState({
    income: true,
    expenses: true,
    net: false
  });
  const [selectedPeriod, setSelectedPeriod] = useState(days);

  // Generate trend data for the selected period
  const trendData = useMemo(() => {
    const data = [];
    const endDate = new Date(currentDate);
    
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = dailyData[dateStr] || { income: [], expenses: [] };
      const income = dayData.income.reduce((sum, item) => sum + item.amount, 0);
      const expenses = dayData.expenses.reduce((sum, item) => sum + item.amount, 0);
      const net = income - expenses;
      
      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          weekday: selectedPeriod <= 7 ? 'short' : undefined
        }),
        fullDate: dateStr,
        income,
        expenses,
        net,
        isToday: dateStr === currentDate,
        dayOfWeek: date.getDay()
      });
    }
    
    return data;
  }, [dailyData, currentDate, selectedPeriod]);

  // Calculate statistics
  const stats = useMemo(() => {
    const incomeValues = trendData.map(d => d.income);
    const expenseValues = trendData.map(d => d.expenses);
    const netValues = trendData.map(d => d.net);
    
    const avgIncome = incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length;
    const avgExpenses = expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;
    const avgNet = netValues.reduce((a, b) => a + b, 0) / netValues.length;
    
    const maxIncome = Math.max(...incomeValues);
    const maxExpenses = Math.max(...expenseValues);
    const minNet = Math.min(...netValues);
    const maxNet = Math.max(...netValues);
    
    // Calculate trends
    const firstIncome = incomeValues[0] || 0;
    const lastIncome = incomeValues[incomeValues.length - 1] || 0;
    const firstExpenses = expenseValues[0] || 0;
    const lastExpenses = expenseValues[expenseValues.length - 1] || 0;
    
    const incomeChange = calculatePercentageChange(lastIncome, firstIncome);
    const expenseChange = calculatePercentageChange(lastExpenses, firstExpenses);
    
    return {
      avgIncome,
      avgExpenses,
      avgNet,
      maxIncome,
      maxExpenses,
      minNet,
      maxNet,
      incomeChange,
      expenseChange,
      totalDays: trendData.length,
      positiveDays: netValues.filter(v => v > 0).length
    };
  }, [trendData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-48">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{label}</h4>
            {data.isToday && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                Today
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {visibleLines.income && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">Income</span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(data.income)}
                </span>
              </div>
            )}
            
            {visibleLines.expenses && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm text-gray-600">Expenses</span>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {formatCurrency(data.expenses)}
                </span>
              </div>
            )}
            
            {visibleLines.net && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    data.net >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-sm text-gray-600">Net</span>
                </div>
                <span className={`text-sm font-medium ${
                  data.net >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(data.net)}
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {data.fullDate} • {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][data.dayOfWeek]}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Toggle line visibility
  const toggleLine = (lineKey) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey]
    }));
  };

  // Render chart based on view type
  const renderChart = () => {
    const ChartComponent = viewType === 'area' ? AreaChart : LineChart;
    
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="date"
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
          
          {/* Reference line for break-even */}
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="2 2" />
          
          {/* Average lines */}
          {showGoals && goals && (
            <>
              <ReferenceLine 
                y={goals.dailyIncome} 
                stroke="#10b981" 
                strokeDasharray="5 5" 
                label={{ value: "Income Goal", position: "topRight" }}
              />
              <ReferenceLine 
                y={goals.dailyExpenses} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                label={{ value: "Expense Limit", position: "topRight" }}
              />
            </>
          )}
          
          {visibleLines.income && (
            viewType === 'area' ? (
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#incomeGradient)"
                strokeWidth={2}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            )
          )}
          
          {visibleLines.expenses && (
            viewType === 'area' ? (
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#expenseGradient)"
                strokeWidth={2}
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 6 }}
              />
            )
          )}
          
          {visibleLines.net && (
            viewType === 'area' ? (
              <Area
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#netGradient)"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 6 }}
              />
            )
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Period selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 3 Months</option>
            </select>
            
            {/* View type toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('area')}
                className={`p-2 rounded-md transition-colors ${
                  viewType === 'area' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewType('line')}
                className={`p-2 rounded-md transition-colors ${
                  viewType === 'line' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Activity className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Line toggles */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => toggleLine('income')}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              visibleLines.income 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {visibleLines.income ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span>Income</span>
          </button>
          
          <button
            onClick={() => toggleLine('expenses')}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              visibleLines.expenses 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {visibleLines.expenses ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span>Expenses</span>
          </button>
          
          <button
            onClick={() => toggleLine('net')}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              visibleLines.net 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {visibleLines.net ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span>Net Balance</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {renderChart()}
      </div>

      {/* Statistics */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Income</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(stats.avgIncome)}
            </p>
            <div className={`flex items-center justify-center space-x-1 text-xs ${
              stats.incomeChange > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.incomeChange > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(stats.incomeChange).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Expenses</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(stats.avgExpenses)}
            </p>
            <div className={`flex items-center justify-center space-x-1 text-xs ${
              stats.expenseChange < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.expenseChange < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              <span>{Math.abs(stats.expenseChange).toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Avg Net</p>
            <p className={`text-lg font-bold ${
              stats.avgNet >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {formatCurrency(stats.avgNet)}
            </p>
            <p className="text-xs text-gray-500">
              {((stats.positiveDays / stats.totalDays) * 100).toFixed(0)}% positive days
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Best Day</p>
            <p className="text-lg font-bold text-purple-600">
              {formatCurrency(stats.maxNet)}
            </p>
            <p className="text-xs text-gray-500">Highest net balance</p>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Target className="h-4 w-4 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-indigo-800 mb-1">Trend Analysis</h4>
              <div className="text-sm text-indigo-700 space-y-1">
                <p>
                  Over the last {selectedPeriod} days, you had positive balance on{' '}
                  <strong>{stats.positiveDays} out of {stats.totalDays} days</strong> 
                  ({((stats.positiveDays / stats.totalDays) * 100).toFixed(0)}%).
                </p>
                {stats.incomeChange !== 0 && (
                  <p>
                    Your income trend is{' '}
                    <strong className={stats.incomeChange > 0 ? 'text-green-700' : 'text-red-700'}>
                      {stats.incomeChange > 0 ? 'increasing' : 'decreasing'}
                    </strong>{' '}
                    by {Math.abs(stats.incomeChange).toFixed(1)}%.
                  </p>
                )}
                {stats.expenseChange !== 0 && (
                  <p>
                    Your expense trend is{' '}
                    <strong className={stats.expenseChange > 0 ? 'text-red-700' : 'text-green-700'}>
                      {stats.expenseChange > 0 ? 'increasing' : 'decreasing'}
                    </strong>{' '}
                    by {Math.abs(stats.expenseChange).toFixed(1)}%.
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

export default TrendChart;