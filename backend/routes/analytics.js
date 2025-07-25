// backend/routes/analytics.js
const express = require('express');
const router = express.Router();
const { query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Get dashboard analytics for specific date
router.get('/dashboard', auth, [
  query('date').isISO8601().toDate(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid date parameter', details: errors.array() });
    }

    const { date } = req.query;

    // Get daily totals
    const dailyQuery = `
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 AND date = $2
      GROUP BY type
    `;

    // Get monthly totals
    const monthStart = new Date(date);
    monthStart.setDate(1);
    const monthEnd = new Date(date);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    const monthlyQuery = `
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = $1 AND date >= $2 AND date <= $3
      GROUP BY type
    `;

    // Get category breakdown for the month
    const categoryQuery = `
      SELECT 
        category,
        SUM(amount) as total
      FROM transactions 
      WHERE user_id = $1 AND type = 'expense' AND date >= $2 AND date <= $3 AND category IS NOT NULL
      GROUP BY category
      ORDER BY total DESC
    `;

    const [dailyResult, monthlyResult, categoryResult] = await Promise.all([
      req.db.query(dailyQuery, [req.user.id, date]),
      req.db.query(monthlyQuery, [req.user.id, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]]),
      req.db.query(categoryQuery, [req.user.id, monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]])
    ]);

    // Process results
    const dailyStats = { income: 0, expense: 0, count: 0 };
    dailyResult.rows.forEach(row => {
      dailyStats[row.type] = parseFloat(row.total);
      dailyStats.count += parseInt(row.count);
    });

    const monthlyStats = { income: 0, expense: 0, count: 0 };
    monthlyResult.rows.forEach(row => {
      monthlyStats[row.type] = parseFloat(row.total);
      monthlyStats.count += parseInt(row.count);
    });

    const categoryTotals = {};
    categoryResult.rows.forEach(row => {
      categoryTotals[row.category] = parseFloat(row.total);
    });

    res.json({
      daily: {
        income: dailyStats.income,
        expenses: dailyStats.expense,
        balance: dailyStats.income - dailyStats.expense,
        transactionCount: dailyStats.count
      },
      monthly: {
        income: monthlyStats.income,
        expenses: monthlyStats.expense,
        balance: monthlyStats.income - monthlyStats.expense,
        transactionCount: monthlyStats.count
      },
      categoryTotals
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get monthly statistics
router.get('/monthly', auth, [
  query('year').isInt({ min: 2020, max: 2030 }),
  query('month').isInt({ min: 1, max: 12 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid parameters', details: errors.array() });
    }

    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const query = `
      SELECT 
        DATE(date) as day,
        type,
        SUM(amount) as total
      FROM transactions 
      WHERE user_id = $1 AND date >= $2 AND date <= $3
      GROUP BY DATE(date), type
      ORDER BY day
    `;

    const result = await req.db.query(query, [
      req.user.id, 
      startDate.toISOString().split('T')[0], 
      endDate.toISOString().split('T')[0]
    ]);

    // Process daily data
    const dailyData = {};
    result.rows.forEach(row => {
      const day = row.day;
      if (!dailyData[day]) {
        dailyData[day] = { income: 0, expenses: 0 };
      }
      dailyData[day][row.type === 'income' ? 'income' : 'expenses'] = parseFloat(row.total);
    });

    res.json(dailyData);
  } catch (error) {
    console.error('Monthly analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly data' });
  }
});

// Get trend data
router.get('/trends', auth, [
  query('days').optional().isInt({ min: 1, max: 365 }),
], async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query = `
      SELECT 
        DATE(date) as day,
        type,
        SUM(amount) as total
      FROM transactions 
      WHERE user_id = $1 AND date >= $2 AND date <= $3
      GROUP BY DATE(date), type
      ORDER BY day
    `;

    const result = await req.db.query(query, [
      req.user.id,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    ]);

    // Generate complete date range with zero values
    const trendData = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayStr = d.toISOString().split('T')[0];
      trendData.push({
        date: dayStr,
        income: 0,
        expenses: 0,
        balance: 0
      });
    }

    // Fill in actual data
    result.rows.forEach(row => {
      const dayIndex = trendData.findIndex(d => d.date === row.day);
      if (dayIndex !== -1) {
        const field = row.type === 'income' ? 'income' : 'expenses';
        trendData[dayIndex][field] = parseFloat(row.total);
      }
    });

    // Calculate balance
    trendData.forEach(day => {
      day.balance = day.income - day.expenses;
    });

    res.json(trendData);
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

module.exports = router;