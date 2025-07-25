// backend/routes/transactions.js
const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all transactions with pagination and filters
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['income', 'expense']),
  query('category').optional().isString(),
  query('search').optional().isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid parameters', details: errors.array() });
    }

    const { page = 1, limit = 50, type, category, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = { user_id: req.user.id };
    
    if (type) whereClause.type = type;
    if (category) whereClause.category = category;
    
    let searchClause = '';
    if (search) {
      searchClause = `AND (description ILIKE '%${search}%' OR source ILIKE '%${search}%')`;
    }

    const countQuery = `
      SELECT COUNT(*) FROM transactions 
      WHERE user_id = $1 ${type ? 'AND type = $2' : ''} ${category ? 'AND category = $3' : ''} ${searchClause}
    `;
    
    const dataQuery = `
      SELECT * FROM transactions 
      WHERE user_id = $1 ${type ? 'AND type = $2' : ''} ${category ? 'AND category = $3' : ''} ${searchClause}
      ORDER BY date DESC, created_at DESC 
      LIMIT $${Object.keys(whereClause).length + 1} OFFSET $${Object.keys(whereClause).length + 2}
    `;

    const params = [req.user.id];
    if (type) params.push(type);
    if (category) params.push(category);
    params.push(limit, offset);

    const [countResult, dataResult] = await Promise.all([
      req.db.query(countQuery, params.slice(0, -2)),
      req.db.query(dataQuery, params)
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      data: dataResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transactions by specific date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const query = `
      SELECT * FROM transactions 
      WHERE user_id = $1 AND date = $2 
      ORDER BY created_at DESC
    `;
    
    const result = await req.db.query(query, [req.user.id, date]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions by date error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transactions by date range
router.get('/range', auth, [
  query('startDate').isISO8601().toDate(),
  query('endDate').isISO8601().toDate(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid date parameters', details: errors.array() });
    }

    const { startDate, endDate } = req.query;

    const query = `
      SELECT * FROM transactions 
      WHERE user_id = $1 AND date >= $2 AND date <= $3 
      ORDER BY date DESC, created_at DESC
    `;
    
    const result = await req.db.query(query, [req.user.id, startDate, endDate]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions by range error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create new transaction
router.post('/', auth, [
  body('type').isIn(['income', 'expense']),
  body('amount').isFloat({ min: 0.01 }),
  body('date').isISO8601().toDate(),
  body('description').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('source').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('category').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { type, amount, date, description, source, category, notes } = req.body;

    // Validate required fields based on type
    if (type === 'expense' && !description) {
      return res.status(400).json({ error: 'Description is required for expenses' });
    }
    if (type === 'income' && !source) {
      return res.status(400).json({ error: 'Source is required for income' });
    }

    const query = `
      INSERT INTO transactions (user_id, type, amount, date, description, source, category, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [req.user.id, type, amount, date, description, source, category, notes];
    const result = await req.db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/:id', auth, [
  body('type').optional().isIn(['income', 'expense']),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('date').optional().isISO8601().toDate(),
  body('description').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('source').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('category').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Check if transaction exists and belongs to user
    const checkQuery = 'SELECT * FROM transactions WHERE id = $1 AND user_id = $2';
    const checkResult = await req.db.query(checkQuery, [id, req.user.id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updates[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push(`updated_at = $${paramIndex}`);
    updateValues.push(new Date());
    paramIndex++;

    updateValues.push(id, req.user.id);

    const updateQuery = `
      UPDATE transactions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex - 1} AND user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await req.db.query(updateQuery, updateValues);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await req.db.query(query, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Bulk delete transactions
router.delete('/bulk', auth, [
  body('ids').isArray().notEmpty(),
  body('ids.*').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid transaction IDs', details: errors.array() });
    }

    const { ids } = req.body;

    const placeholders = ids.map((_, index) => `$${index + 2}`).join(',');
    const query = `
      DELETE FROM transactions 
      WHERE user_id = $1 AND id IN (${placeholders})
      RETURNING id
    `;

    const result = await req.db.query(query, [req.user.id, ...ids]);

    res.json({ 
      message: `${result.rows.length} transactions deleted successfully`,
      deletedIds: result.rows.map(row => row.id)
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to delete transactions' });
  }
});

// Get available categories
router.get('/categories', auth, async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT category 
      FROM transactions 
      WHERE user_id = $1 AND category IS NOT NULL AND category != ''
      ORDER BY category
    `;
    
    const result = await req.db.query(query, [req.user.id]);
    const userCategories = result.rows.map(row => row.category);

    // Merge with default categories
    const defaultCategories = [
      'Food', 'Transport', 'Shopping', 'Bills', 
      'Entertainment', 'Medical', 'Education', 'Other'
    ];

    const allCategories = [...new Set([...defaultCategories, ...userCategories])];
    res.json(allCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category totals for date range
router.get('/category-totals', auth, [
  query('startDate').isISO8601().toDate(),
  query('endDate').isISO8601().toDate(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid date parameters', details: errors.array() });
    }

    const { startDate, endDate } = req.query;

    const query = `
      SELECT category, SUM(amount) as total
      FROM transactions 
      WHERE user_id = $1 AND type = 'expense' AND date >= $2 AND date <= $3 AND category IS NOT NULL
      GROUP BY category
      ORDER BY total DESC
    `;
    
    const result = await req.db.query(query, [req.user.id, startDate, endDate]);
    
    const categoryTotals = {};
    result.rows.forEach(row => {
      categoryTotals[row.category] = parseFloat(row.total);
    });

    res.json(categoryTotals);
  } catch (error) {
    console.error('Get category totals error:', error);
    res.status(500).json({ error: 'Failed to fetch category totals' });
  }
});

module.exports = router;