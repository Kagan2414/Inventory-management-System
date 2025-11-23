const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

module.exports = (db) => {
  
  // GET all products
  router.get('/', (req, res) => {
    const { category, search, page, limit, sort, order } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Filter by category
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    // Search by name
    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    // Sorting
    const validSortFields = ['name', 'stock', 'category', 'brand'];
    const sortField = validSortFields.includes(sort) ? sort : 'id';
    const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    if (page && limit) {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get total count for pagination
      db.get('SELECT COUNT(*) as count FROM products', [], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          products: rows,
          total: result.count,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || rows.length
        });
      });
    });
  });

  // GET single product
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ product: row });
    });
  });

  // POST create new product
  router.post('/', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    body('unit').optional().trim(),
    body('category').optional().trim(),
    body('brand').optional().trim()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, unit, category, brand, stock, image } = req.body;
    const status = stock > 0 ? 'In Stock' : 'Out of Stock';

    db.run(
      `INSERT INTO products (name, unit, category, brand, stock, status, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, unit, category, brand, stock, status, image],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Product name already exists' });
          }
          return res.status(500).json({ error: err.message });
        }

        // Create initial history entry
        db.run(
          `INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date, user_info)
           VALUES (?, ?, ?, ?, ?)`,
          [this.lastID, 0, stock, new Date().toISOString(), 'Initial creation'],
          (historyErr) => {
            if (historyErr) {
              console.error('Error creating history:', historyErr);
            }
          }
        );

        res.status(201).json({
          message: 'Product created successfully',
          productId: this.lastID
        });
      }
    );
  });

  // PUT update product
  router.put('/:id', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, unit, category, brand, stock, image } = req.body;
    const status = stock > 0 ? 'In Stock' : 'Out of Stock';

    // First, get the old product data
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, oldProduct) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!oldProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if name is unique (if changed)
      if (name !== oldProduct.name) {
        db.get('SELECT id FROM products WHERE name = ? AND id != ?', [name, id], (err, duplicate) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (duplicate) {
            return res.status(400).json({ error: 'Product name already exists' });
          }
          performUpdate();
        });
      } else {
        performUpdate();
      }

      function performUpdate() {
        // Update the product
        db.run(
          `UPDATE products 
           SET name = ?, unit = ?, category = ?, brand = ?, stock = ?, status = ?, image = ?
           WHERE id = ?`,
          [name, unit, category, brand, stock, status, image, id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // If stock changed, add to history
            if (oldProduct.stock !== stock) {
              db.run(
                `INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date, user_info)
                 VALUES (?, ?, ?, ?, ?)`,
                [id, oldProduct.stock, stock, new Date().toISOString(), 'Stock updated'],
                (historyErr) => {
                  if (historyErr) {
                    console.error('Error creating history:', historyErr);
                  }
                }
              );
            }

            res.json({ message: 'Product updated successfully' });
          }
        );
      }
    });
  });

  // DELETE product
  router.delete('/:id', (req, res) => {
    const { id } = req.params;

    // First delete history entries
    db.run('DELETE FROM inventory_history WHERE product_id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Then delete the product
      db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
      });
    });
  });

  // GET inventory history for a product
  router.get('/:id/history', (req, res) => {
    const { id } = req.params;

    db.all(
      `SELECT * FROM inventory_history 
       WHERE product_id = ? 
       ORDER BY change_date DESC`,
      [id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ history: rows });
      }
    );
  });

  // POST import products from CSV
  router.post('/import', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        let added = 0;
        let skipped = 0;
        const duplicates = [];
        let processed = 0;

        if (results.length === 0) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ error: 'CSV file is empty' });
        }

        results.forEach((product, index) => {
          const name = product.name || product.Name;
          const unit = product.unit || product.Unit || '';
          const category = product.category || product.Category || '';
          const brand = product.brand || product.Brand || '';
          const stock = parseInt(product.stock || product.Stock || 0);
          const status = stock > 0 ? 'In Stock' : 'Out of Stock';

          if (!name) {
            processed++;
            skipped++;
            if (processed === results.length) {
              sendResponse();
            }
            return;
          }

          // Check for duplicates
          db.get('SELECT id FROM products WHERE name = ?', [name], (err, row) => {
            if (err) {
              console.error('Error checking duplicate:', err);
              processed++;
              skipped++;
            } else if (row) {
              // Duplicate found
              duplicates.push({ ...product, existingId: row.id });
              processed++;
              skipped++;
            } else {
              // Insert new product
              db.run(
                `INSERT INTO products (name, unit, category, brand, stock, status)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [name, unit, category, brand, stock, status],
                function(err) {
                  processed++;
                  if (err) {
                    console.error('Error inserting product:', err);
                    skipped++;
                  } else {
                    added++;
                    // Create initial history
                    db.run(
                      `INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date, user_info)
                       VALUES (?, ?, ?, ?, ?)`,
                      [this.lastID, 0, stock, new Date().toISOString(), 'Imported from CSV']
                    );
                  }

                  if (processed === results.length) {
                    sendResponse();
                  }
                }
              );
            }

            if (processed === results.length) {
              sendResponse();
            }
          });
        });

        function sendResponse() {
          // Clean up uploaded file
          fs.unlinkSync(filePath);
          
          res.json({
            message: 'Import completed',
            added,
            skipped,
            total: results.length,
            duplicates: duplicates.length > 0 ? duplicates : undefined
          });
        }
      })
      .on('error', (error) => {
        fs.unlinkSync(filePath);
        res.status(500).json({ error: 'Error processing CSV file' });
      });
  });

  // GET export products to CSV
  router.get('/export/csv', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Create CSV headers
      const headers = ['id', 'name', 'unit', 'category', 'brand', 'stock', 'status', 'image'];
      let csv = headers.join(',') + '\n';

      // Add data rows
      rows.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in values
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csv += values.join(',') + '\n';
      });

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
      res.status(200).send(csv);
    });
  });

  // GET unique categories (helper endpoint)
  router.get('/meta/categories', (req, res) => {
    db.all('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ""', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const categories = rows.map(row => row.category);
      res.json({ categories });
    });
  });

  return router;
};