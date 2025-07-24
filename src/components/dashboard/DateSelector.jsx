import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, RotateCcw } from 'lucide-react';
import { formatDate, isToday, isThisMonth } from '../../utils/helpers';

const DateSelector = ({ 
  currentDate, 
  onDateChange, 
  onQuickDate,
  showQuickDates = true,
  showCalendar = true,
  className = ''
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date(currentDate));
  const datePickerRef = useRef(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected month when current date changes
  useEffect(() => {
    setSelectedMonth(new Date(currentDate));
  }, [currentDate]);

  // Quick date options
  const quickDateOptions = [
    { 
      label: 'Today', 
      days: 0, 
      icon: Clock,
      active: isToday(currentDate)
    },
    { 
      label: 'Yesterday', 
      days: -1, 
      icon: RotateCcw,
      active: false
    },
    { 
      label: 'Last Week', 
      days: -7, 
      icon: RotateCcw,
      active: false
    },
    { 
      label: 'Last Month', 
      days: -30, 
      icon: RotateCcw,
      active: false
    }
  ];

  const handleQuickDate = (days, option) => {
    onQuickDate(days);
    // Optional: Show visual feedback
  };

  const handleDateChange = (e) => {
    onDateChange(e.target.value);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const selectDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    onDateChange(dateString);
    setShowDatePicker(false);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isToday(dateString)) {
      return `Today, ${formatDate(date, 'MMM dd')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${formatDate(date, 'MMM dd')}`;
    } else if (isThisMonth(dateString)) {
      return formatDate(date, 'dd MMM');
    } else {
      return formatDate(date, 'dd MMM yyyy');
    }
  };

  const getDayStatus = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (dateString === currentDate) {
      return 'selected';
    } else if (dateString === today) {
      return 'today';
    } else if (date > new Date()) {
      return 'future';
    }
    return 'past';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Date Display and Picker */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Selected Date:</span>
          </div>
          
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <span className="font-semibold text-gray-900">
                {formatDisplayDate(currentDate)}
              </span>
              <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${showDatePicker ? 'rotate-90' : ''}`} />
            </button>

            {/* Custom Date Picker */}
            {showDatePicker && showCalendar && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4 min-w-80">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="font-semibold text-gray-900">
                    {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(selectedMonth).map((date, index) => {
                    if (!date) {
                      return <div key={index} className="aspect-square" />;
                    }

                    const status = getDayStatus(date);
                    const baseClasses = "aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200 cursor-pointer";
                    
                    let classes = baseClasses;
                    switch (status) {
                      case 'selected':
                        classes += " bg-indigo-600 text-white font-semibold shadow-sm";
                        break;
                      case 'today':
                        classes += " bg-indigo-100 text-indigo-700 font-medium border border-indigo-300";
                        break;
                      case 'future':
                        classes += " text-gray-300 cursor-not-allowed";
                        break;
                      case 'past':
                      default:
                        classes += " text-gray-700 hover:bg-gray-100";
                        break;
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => status !== 'future' && selectDate(date)}
                        disabled={status === 'future'}
                        className={classes}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Actions in Calendar */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        onDateChange(new Date().toISOString().split('T')[0]);
                        setShowDatePicker(false);
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Jump to Today
                    </button>
                    <input
                      type="date"
                      value={currentDate}
                      onChange={handleDateChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Date Buttons */}
        {showQuickDates && (
          <div className="flex flex-wrap gap-2">
            {quickDateOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.label}
                  onClick={() => handleQuickDate(option.days, option)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    option.active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>
              {isToday(currentDate) ? 'Today' : 
               isThisMonth(currentDate) ? 'This Month' : 
               'Past Date'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>
              {new Date(currentDate).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact version for smaller spaces
export const CompactDateSelector = ({ 
  currentDate, 
  onDateChange, 
  onQuickDate 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="date"
        value={currentDate}
        onChange={(e) => onDateChange(e.target.value)}
        max={new Date().toISOString().split('T')[0]}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
      />
      
      <div className="flex space-x-1">
        <button
          onClick={() => onQuickDate(0)}
          className={`px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
            isToday(currentDate)
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => onQuickDate(-1)}
          className="px-2 py-2 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Yesterday
        </button>
      </div>
    </div>
  );
};

// Range date selector for future use
export const DateRangeSelector = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  className = '' 
}) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-600 mb-1">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="text-xs font-medium text-gray-600 mb-1">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate}
          max={new Date().toISOString().split('T')[0]}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>
    </div>
  );
};

export default DateSelector;