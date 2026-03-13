const express = require('express');
const fs = require('fs').promises;
const fsWatch = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let cachedStats = null;

// Calculate stats from items
function calculateStats(items) {
  return {
    total: items.length,
    averagePrice: items.length > 0 ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length : 0
  };
}

// Invalidate cache when data file changes
fsWatch.watch(DATA_PATH, { persistent: false }, () => {
  cachedStats = null;
});

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    // Return cached stats if available
    if (cachedStats) {
      return res.json(cachedStats);
    }

    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const items = JSON.parse(raw);
    cachedStats = calculateStats(items);

    res.json(cachedStats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;