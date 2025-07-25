// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/json', 'text/csv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON and CSV files are allowed.'));
    }
  }
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [decoded.userId]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user
    const result = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email',
      [name, req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user transactions
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { date, month, year } = req.query;
    let query = 'SELECT * FROM transactions WHERE user_id = $1';
    let params = [req.user.id];

    if (date) {
      query += ' AND DATE(transaction_date) = $2';
      params.push(date);
    } else if (month && year) {
      query += ' AND EXTRACT(MONTH FROM transaction_date) = $2 AND EXTRACT(YEAR FROM transaction_date) = $3';
      params.push(month, year);
    }

    query += ' ORDER BY transaction_date DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { type, amount, description, source, category, transaction_date, notes } = req.body;

    if (!type || !amount || (!description && !source)) {
      return res.status(400).json({ error: 'Type, amount, and description/source are required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Type must be either "income" or "expense"' });
    }

    const result = await pool.query(
      `INSERT INTO transactions 
       (user_id, type, amount, description, source, category, transaction_date, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING *`,
      [req.user.id, type, amount, description, source, category, transaction_date || new Date(), notes]
    );

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update transaction
app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, source, category, notes } = req.body;

    const result = await pool.query(
      `UPDATE transactions 
       SET amount = COALESCE($1, amount), 
           description = COALESCE($2, description),
           source = COALESCE($3, source),
           category = COALESCE($4, category),
           notes = COALESCE($5, notes),
           updated_at = NOW()
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
      [amount, description, source, category, notes, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction updated successfully',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user settings
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT settings FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    const settings = result.rows.length > 0 ? result.rows[0].settings : {};
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
app.put('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;

    const result = await pool.query(
      `INSERT INTO user_settings (user_id, settings, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       ON CONFLICT (user_id) 
       DO UPDATE SET settings = $2, updated_at = NOW() 
       RETURNING settings`,
      [req.user.id, JSON.stringify(settings)]
    );

    res.json({
      message: 'Settings updated successfully',
      settings: result.rows[0].settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export data
app.get('/api/export', authenticateToken, async (req, res) => {
  try {
    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY transaction_date DESC',
      [req.user.id]
    );

    const settings = await pool.query(
      'SELECT settings FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    const exportData = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      },
      transactions: transactions.rows,
      settings: settings.rows.length > 0 ? settings.rows[0].settings : {},
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="expenseflow-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import data
app.post('/api/import', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = await fs.readFile(req.file.path, 'utf8');
    const importData = JSON.parse(fileContent);

    if (!importData.transactions || !Array.isArray(importData.transactions)) {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    // Import transactions
    let importedCount = 0;
    for (const transaction of importData.transactions) {
      try {
        await pool.query(
          `INSERT INTO transactions 
           (user_id, type, amount, description, source, category, transaction_date, notes, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            req.user.id,
            transaction.type,
            transaction.amount,
            transaction.description,
            transaction.source,
            transaction.category,
            transaction.transaction_date,
            transaction.notes
          ]
        );
        importedCount++;
      } catch (error) {
        console.error('Failed to import transaction:', error);
      }
    }

    // Import settings if available
    if (importData.settings) {
      await pool.query(
        `INSERT INTO user_settings (user_id, settings, created_at, updated_at) 
         VALUES ($1, $2, NOW(), NOW()) 
         ON CONFLICT (user_id) 
         DO UPDATE SET settings = $2, updated_at = NOW()`,
        [req.user.id, JSON.stringify(importData.settings)]
      );
    }

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      message: 'Data imported successfully',
      importedTransactions: importedCount
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics endpoints
app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const monthlyStats = await pool.query(
      `SELECT 
         type,
         SUM(amount) as total,
         COUNT(*) as count
       FROM transactions 
       WHERE user_id = $1 
         AND EXTRACT(MONTH FROM transaction_date) = $2 
         AND EXTRACT(YEAR FROM transaction_date) = $3
       GROUP BY type`,
      [req.user.id, currentMonth, currentYear]
    );

    const categoryStats = await pool.query(
      `SELECT 
         category,
         SUM(amount) as total,
         COUNT(*) as count
       FROM transactions 
       WHERE user_id = $1 
         AND type = 'expense'
         AND EXTRACT(MONTH FROM transaction_date) = $2 
         AND EXTRACT(YEAR FROM transaction_date) = $3
         AND category IS NOT NULL
       GROUP BY category
       ORDER BY total DESC`,
      [req.user.id, currentMonth, currentYear]
    );

    const dailyTrend = await pool.query(
      `SELECT 
         DATE(transaction_date) as date,
         type,
         SUM(amount) as total
       FROM transactions 
       WHERE user_id = $1 
         AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(transaction_date), type
       ORDER BY date DESC`,
      [req.user.id]
    );

    res.json({
      monthlyStats: monthlyStats.rows,
      categoryStats: categoryStats.rows,
      dailyTrend: dailyTrend.rows
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});