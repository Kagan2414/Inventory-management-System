
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      unit TEXT,
      category TEXT,
      brand TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT,
      image TEXT
    )`);

    // Inventory history table
    db.run(`CREATE TABLE IF NOT EXISTS inventory_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      old_quantity INTEGER,
      new_quantity INTEGER,
      change_date TEXT,
      user_info TEXT,
      FOREIGN KEY(product_id) REFERENCES products(id)
    )`);
  });
}

// Routes
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter(db));

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Inventory Management API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, db };
