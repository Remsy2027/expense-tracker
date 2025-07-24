import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Activity,
  Calendar,
  Filter,
  Download,
  Maximize2
} from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import { formatCurrency, calculatePercentageChange } from '../../utils/helpers';

const Charts = ({ 
  calculations, 
  dailyData, 
  currentDate,
  timeRange = '7days' 
}) => {
  const [selectedChart, setSelectedChart] = useState('overview');
  const [chartFilter, setChartFilter] = useState('all');
  const [showFullscreen, setShowFullscreen] = useState(null);

  // Chart data processing
  const chartData = useMemo(() => {
    // Daily overview data
    const dailyOverview = [
      { name: 'Income', value: calculations.totalIncome, fill: '#10b981' },
      { name: 'Expenses', value: calculations.totalExpenses, fill: '#ef4444' },
      { name: 'Balance', value: Math.max(0, calculations.balance), fill: '#3b82f6' }
    ];

    // Category data with colors
    const categoryData = Object.entries(calculations.categoryTotals || {}).map(([category, amount]) => {
      const categoryInfo = CATEGORIES.find(cat => cat.name === category);
      return {
        name: category,
        value: amount,
        fill: categoryInfo?.color || '#6b7280',
        percentage: ((amount / calculations.totalExpenses) * 100).toFixed(1)
      };
    }).sort((a, b) => b.value - a.value);

    // Trend data (last 7 days)
    const trendData = calculations.trendData || [];

    // Weekly summary
    const weeklyData = trendData.map(day => ({
      ...day,
      net: day.income - day.expenses
    }));

    // Monthly comparison (if enough data)
    const monthlyComparison = [];
    const currentMonth = new Date(currentDate).getMonth();
    const currentYear = new Date(currentDate).getFullYear();
    
    for (let i = 2; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
      
      let monthIncome = 0;
      let monthExpenses = 0;
      
      Object.entries(dailyData).forEach(([date, data]) => {
        const dateObj = new Date(date);
        if (dateObj.getMonth() === monthDate.getMonth() && 
            dateObj.getFullYear() === monthDate.getFullYear()) {
          monthIncome += data.income?.reduce((sum, item) => sum + item.amount, 0) || 0;
          monthExpenses += data.expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
        }
      });
      
      monthlyComparison.push({
        month: monthName,
        income: monthIncome,
        expenses: monthExpenses,
        net: monthIncome - monthExpenses
      });
    }

    return {
      dailyOverview,
      categoryData,
      trendData,
      weeklyData,
      monthlyComparison
    };
  }, [calculations, dailyData, currentDate]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.dataKey}:</span>
              <span className="font-semibold">
                {formatter ? formatter(entry.value) : formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Chart configuration
  const chartConfig = {
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
    colors: {
      income: '#10b981',
      expenses: '#ef4444',
      balance: '#3b82f6',
      net: '#8b5cf6'
    }
  };

  // Chart components
  const DailyOverviewChart = ({ fullscreen = false }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${fullscreen ? 'h-96' : 'h-80'}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Daily Overview</h3>
          </div>
          <button
            onClick={() => setShowFullscreen('overview')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={fullscreen ? 300 : 200}>
          <BarChart data={chartData.dailyOverview} {...chartConfig}>
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
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              stroke="#ffffff"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const CategoryChart = ({ fullscreen = false }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${fullscreen ? 'h-96' : 'h-80'}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
          </div>
          <button
            onClick={() => setShowFullscreen('categories')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {chartData.categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={fullscreen ? 300 : 200}>
            <PieChart>
              <Pie
                data={chartData.categoryData}
                cx="50%"
                cy="50%"
                innerRadius={fullscreen ? 80 : 60}
                outerRadius={fullscreen ? 120 : 90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload.percentage}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No expense data to display</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const TrendChart = ({ fullscreen = false }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${fullscreen ? 'h-96' : 'h-80'}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">7-Day Trend</h3>
          </div>
          <button
            onClick={() => setShowFullscreen('trend')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={fullscreen ? 300 : 200}>
          <AreaChart data={chartData.weeklyData} {...chartConfig}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#incomeGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#expenseGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const NetBalanceChart = ({ fullscreen = false }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${fullscreen ? 'h-96' : 'h-80'}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Net Balance Trend</h3>
          </div>
          <button
            onClick={() => setShowFullscreen('net')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={fullscreen ? 300 : 200}>
          <LineChart data={chartData.weeklyData} {...chartConfig}>
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
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 6, fill: '#8b5cf6' }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // Fullscreen modal
  const FullscreenChart = () => {
    if (!showFullscreen) return null;

    const chartComponents = {
      overview: <DailyOverviewChart fullscreen />,
      categories: <CategoryChart fullscreen />,
      trend: <TrendChart fullscreen />,
      net: <NetBalanceChart fullscreen />
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-4xl">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowFullscreen(null)}
              className="p-2 bg-white rounded-lg text-gray-600 hover:text-gray-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {chartComponents[showFullscreen]}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
            <p className="text-gray-600">Visual insights into your financial data</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={chartFilter}
              onChange={(e) => setChartFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyOverviewChart />
        <CategoryChart />
        <TrendChart />
        <NetBalanceChart />
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Category */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Top Expense Category</h4>
            {chartData.categoryData.length > 0 ? (
              <>
                <p className="text-2xl font-bold text-red-600">
                  {chartData.categoryData[0].name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(chartData.categoryData[0].value)} ({chartData.categoryData[0].percentage}%)
                </p>
              </>
            ) : (
              <p className="text-gray-500">No data</p>
            )}
          </div>

          {/* Spending Trend */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">7-Day Average</h4>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(
                chartData.weeklyData.reduce((sum, day) => sum + day.expenses, 0) / 
                Math.max(chartData.weeklyData.length, 1)
              )}
            </p>
            <p className="text-sm text-gray-600">Daily expenses</p>
          </div>

          {/* Savings Rate */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Savings Rate</h4>
            <p className="text-2xl font-bold text-green-600">
              {calculations.totalIncome > 0 
                ? `${((calculations.balance / calculations.totalIncome) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
            <p className="text-sm text-gray-600">Of daily income</p>
          </div>
        </div>
      </div>

      {/* Fullscreen Chart Modal */}
      <FullscreenChart />
    </div>
  );
};

export default Charts;