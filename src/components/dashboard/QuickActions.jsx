import React, { useState, useRef } from 'react';
import { Plus, Minus, DollarSign, Receipt, Zap, Clock, Tag, Calculator } from 'lucide-react';
import { CATEGORIES, INCOME_SOURCES } from '../../utils/constants';
import { validateTransaction } from '../../utils/helpers';

const QuickActions = ({ 
  onAddIncome, 
  onAddExpense,
  recentTransactions = [],
  quickAmounts = [50, 100, 200, 500, 1000],
  showQuickAmounts = true,
  showRecentTransactions = true
}) => {
  // Form states
  const [incomeForm, setIncomeForm] = useState({ source: '', amount: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', category: 'Food', amount: '' });
  const [isSubmitting, setIsSubmitting] = useState({ income: false, expense: false });
  const [errors, setErrors] = useState({ income: {}, expense: {} });
  const [showQuickEntry, setShowQuickEntry] = useState({ income: false, expense: false });

  // Refs for form inputs
  const incomeAmountRef = useRef(null);
  const expenseAmountRef = useRef(null);

  // Handle income form submission
  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateTransaction(incomeForm, 'income');
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, income: { general: validation.errors.join(', ') } }));
      return;
    }

    setIsSubmitting(prev => ({ ...prev, income: true }));
    setErrors(prev => ({ ...prev, income: {} }));

    try {
      const result = await onAddIncome(incomeForm);
      if (result && result.success) {
        setIncomeForm({ source: '', amount: '' });
        setShowQuickEntry(prev => ({ ...prev, income: false }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, income: { general: 'Failed to add income' } }));
    } finally {
      setIsSubmitting(prev => ({ ...prev, income: false }));
    }
  };

  // Handle expense form submission
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateTransaction(expenseForm, 'expense');
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, expense: { general: validation.errors.join(', ') } }));
      return;
    }

    setIsSubmitting(prev => ({ ...prev, expense: true }));
    setErrors(prev => ({ ...prev, expense: {} }));

    try {
      const result = await onAddExpense(expenseForm);
      if (result && result.success) {
        setExpenseForm({ description: '', category: 'Food', amount: '' });
        setShowQuickEntry(prev => ({ ...prev, expense: false }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, expense: { general: 'Failed to add expense' } }));
    } finally {
      setIsSubmitting(prev => ({ ...prev, expense: false }));
    }
  };

  // Quick amount handlers
  const handleQuickIncome = async (amount) => {
    setIsSubmitting(prev => ({ ...prev, income: true }));
    try {
      await onAddIncome({ source: 'Quick Income', amount });
    } finally {
      setIsSubmitting(prev => ({ ...prev, income: false }));
    }
  };

  const handleQuickExpense = async (amount, category = 'Other') => {
    setIsSubmitting(prev => ({ ...prev, expense: true }));
    try {
      await onAddExpense({ description: 'Quick Expense', category, amount });
    } finally {
      setIsSubmitting(prev => ({ ...prev, expense: false }));
    }
  };

  // Handle recent transaction repeat
  const handleRepeatTransaction = async (transaction) => {
    if (transaction.type === 'income') {
      await onAddIncome({
        source: `${transaction.source} (repeat)`,
        amount: transaction.amount
      });
    } else {
      await onAddExpense({
        description: `${transaction.description} (repeat)`,
        category: transaction.category,
        amount: transaction.amount
      });
    }
  };

  // Keyboard shortcuts
  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      if (type === 'income') {
        handleIncomeSubmit(e);
      } else {
        handleExpenseSubmit(e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Entry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Income Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Add Income</h3>
                <p className="text-green-100 text-sm">Record your earnings</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!showQuickEntry.income ? (
              <div className="space-y-4">
                {/* Quick Income Buttons */}
                {showQuickAmounts && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Add
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {quickAmounts.map(amount => (
                        <button
                          key={amount}
                          onClick={() => handleQuickIncome(amount)}
                          disabled={isSubmitting.income}
                          className="p-3 text-sm font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowQuickEntry(prev => ({ ...prev, income: true }))}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Custom Amount</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Income Source
                  </label>
                  <select
                    value={incomeForm.source}
                    onChange={(e) => setIncomeForm(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select source</option>
                    {INCOME_SOURCES.map(source => (
                      <option key={source.id} value={source.name}>
                        {source.icon} {source.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={incomeAmountRef}
                      type="number"
                      value={incomeForm.amount}
                      onChange={(e) => setIncomeForm(prev => ({ ...prev, amount: e.target.value }))}
                      onKeyPress={(e) => handleKeyPress(e, 'income')}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {errors.income.general && (
                  <p className="text-sm text-red-600">{errors.income.general}</p>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting.income}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting.income ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add Income</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickEntry(prev => ({ ...prev, income: false }))}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Add Expense Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Minus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Add Expense</h3>
                <p className="text-red-100 text-sm">Track your spending</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!showQuickEntry.expense ? (
              <div className="space-y-4">
                {/* Category Quick Add */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Quick Categories
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.slice(0, 4).map(category => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setExpenseForm(prev => ({ ...prev, category: category.name }));
                          setShowQuickEntry(prev => ({ ...prev, expense: true }));
                        }}
                        className="p-3 text-sm font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2"
                      >
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowQuickEntry(prev => ({ ...prev, expense: true }))}
                    className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Receipt className="h-4 w-4" />
                    <span>Custom Expense</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Lunch, Grocery, Gas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      ref={expenseAmountRef}
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      onKeyPress={(e) => handleKeyPress(e, 'expense')}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {errors.expense.general && (
                  <p className="text-sm text-red-600">{errors.expense.general}</p>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting.expense}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting.expense ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add Expense</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickEntry(prev => ({ ...prev, expense: false }))}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions - Quick Repeat */}
      {showRecentTransactions && recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <span className="text-sm text-gray-500">- Click to repeat</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTransactions.slice(0, 6).map((transaction, index) => (
              <button
                key={index}
                onClick={() => handleRepeatTransaction(transaction)}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-left"
              >
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <Plus className={`h-4 w-4 ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  ) : (
                    <Minus className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.type === 'income' ? transaction.source : transaction.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{transaction.amount} • {transaction.category || 'Income'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calculator Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calculator className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Calculator</h3>
        </div>
        
        <div className="text-center text-gray-500">
          <p className="text-sm">Calculator widget coming soon!</p>
          <p className="text-xs mt-1">Quickly calculate amounts before adding transactions</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;