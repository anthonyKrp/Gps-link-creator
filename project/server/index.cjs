const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory (for production)
app.use(express.static(path.join(__dirname, '../dist')));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE links (
    id TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    title TEXT
  )`);
  
  db.run(`CREATE TABLE locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id TEXT,
    latitude REAL,
    longitude REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address TEXT,
    FOREIGN KEY (link_id) REFERENCES links (id)
  )`);
});

// Generate new tracking link
app.post('/api/links', (req, res) => {
  const linkId = uuidv4();
  const title = req.body.title || `Tracking Link ${linkId.substring(0, 8)}`;
  
  db.run('INSERT INTO links (id, title) VALUES (?, ?)', [linkId, title], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({
      id: linkId,
      title: title,
      url: `${req.protocol}://${req.get('host')}/track/${linkId}`,
      created_at: new Date().toISOString()
    });
  });
});

// Store GPS location
app.post('/api/locations', (req, res) => {
  const { linkId, latitude, longitude } = req.body;
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  if (!linkId || !latitude || !longitude) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Verify link exists
  db.get('SELECT id FROM links WHERE id = ?', [linkId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    // Store location
    db.run(
      'INSERT INTO locations (link_id, latitude, longitude, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)',
      [linkId, latitude, longitude, userAgent, ipAddress],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        res.json({
          success: true,
          message: 'Location stored successfully',
          id: this.lastID
        });
      }
    );
  });
});

// Get all links
app.get('/api/links', (req, res) => {
  db.all('SELECT * FROM links ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get locations for a specific link
app.get('/api/links/:id/locations', (req, res) => {
  const linkId = req.params.id;
  
  db.all(
    'SELECT * FROM locations WHERE link_id = ? ORDER BY timestamp DESC',
    [linkId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Get link details
app.get('/api/links/:id', (req, res) => {
  const linkId = req.params.id;
  
  db.get('SELECT * FROM links WHERE id = ?', [linkId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json(row);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all non-API routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});