const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

/**
 * GET /api/items
 * Retrieves items with optional search filter and pagination.
 *
 * Query Parameters:
 *   - q (string): Search query to filter items by name (case-insensitive)
 *   - page (number): Page number for pagination (defaults to 1, minimum 1)
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { q, page } = req.query;
    const pageSize = 5;

    // Parse and validate page parameter (ensure it's at least 1)
    let currentPage = parseInt(page) || 1;
    if (currentPage < 1) {
      currentPage = 1;
    }

    // Apply search filter first using case-insensitive substring matching on name and category
    let results = data;
    if (q) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(q.toLowerCase()) ||
        item.category.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Calculate pagination metadata
    const totalCount = results.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (currentPage - 1) * pageSize;
    const hasMore = (currentPage * pageSize) < totalCount;

    // Slice results for the current page
    const paginatedResults = results.slice(offset, offset + pageSize);

    res.json({
      data: paginatedResults,
      pagination: {
        page: currentPage,
        pageSize,
        totalCount,
        totalPages,
        hasMore
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/items/:id
 * Retrieves a single item by ID.
 *
 * Parameters:
 *   - id (string): Numeric ID of the item
 *
 * Response: Item object
 *
 * Errors:
 *   - 404: Item not found
 *   - 500: Server error
 */
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/items
 * Creates a new item.
 *
 * Request Body:
 *   {
 *     name: string,
 *     category: string,
 *     price: number
 *   }
 *
 * Response: Created item object with auto-generated ID (timestamp-based)
 */
router.post('/', async (req, res, next) => {
  try {
    const item = req.body;
    const data = await readData();
    // Generate unique ID using timestamp
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;