import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database('database.sqlite');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    baseCurrency TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    userId TEXT,
    name TEXT,
    color TEXT,
    type TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT,
    type TEXT,
    amount REAL,
    date TEXT,
    categoryId TEXT,
    paymentMethod TEXT,
    description TEXT,
    currency TEXT,
    FOREIGN KEY(userId) REFERENCES users(id),
    FOREIGN KEY(categoryId) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    userId TEXT,
    categoryId TEXT,
    amount REAL,
    period TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { email, name } = req.body;
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      if (!name) {
        return res.status(400).json({ error: 'Name is required for new users' });
      }
      const id = crypto.randomUUID();
      db.prepare('INSERT INTO users (id, email, name, baseCurrency) VALUES (?, ?, ?, ?)').run(id, email, name, 'USD');
      user = { id, email, name, baseCurrency: 'USD' };
    }
    
    res.json(user);
  });

  // Get user data (transactions, categories, budgets)
  app.get('/api/data', (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const transactions = db.prepare('SELECT * FROM transactions WHERE userId = ?').all(userId);
    const categories = db.prepare('SELECT * FROM categories WHERE userId = ?').all(userId);
    const budgets = db.prepare('SELECT * FROM budgets WHERE userId = ?').all(userId);

    res.json({ transactions, categories, budgets });
  });

  // Transactions
  app.post('/api/transactions', (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id, type, amount, date, categoryId, paymentMethod, description, currency } = req.body;
    
    db.prepare(`
      INSERT INTO transactions (id, userId, type, amount, date, categoryId, paymentMethod, description, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, type, amount, date, categoryId, paymentMethod, description, currency);
    
    res.json({ success: true });
  });

  app.put('/api/transactions/:id', (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { type, amount, date, categoryId, paymentMethod, description, currency } = req.body;
    
    db.prepare(`
      UPDATE transactions 
      SET type = ?, amount = ?, date = ?, categoryId = ?, paymentMethod = ?, description = ?, currency = ?
      WHERE id = ? AND userId = ?
    `).run(type, amount, date, categoryId, paymentMethod, description, currency, req.params.id, userId);
    
    res.json({ success: true });
  });

  app.delete('/api/transactions/:id', (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    db.prepare('DELETE FROM transactions WHERE id = ? AND userId = ?').run(req.params.id, userId);
    res.json({ success: true });
  });

  // Categories
  app.post('/api/categories', (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id, name, color, type } = req.body;
    
    db.prepare(`
      INSERT INTO categories (id, userId, name, color, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, name, color, type);
    
    res.json({ success: true });
  });

  // Budgets
  app.post('/api/budgets', (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id, categoryId, amount, period } = req.body;
    
    db.prepare(`
      INSERT INTO budgets (id, userId, categoryId, amount, period)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, categoryId, amount, period);
    
    res.json({ success: true });
  });

  app.put('/api/budgets/:id', (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { categoryId, amount, period } = req.body;
    
    db.prepare(`
      UPDATE budgets 
      SET categoryId = ?, amount = ?, period = ?
      WHERE id = ? AND userId = ?
    `).run(categoryId, amount, period, req.params.id, userId);
    
    res.json({ success: true });
  });

  app.delete('/api/budgets/:id', (req, res) => {
    const userId = req.headers['user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    db.prepare('DELETE FROM budgets WHERE id = ? AND userId = ?').run(req.params.id, userId);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
