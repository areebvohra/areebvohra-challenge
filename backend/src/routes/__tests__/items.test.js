const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const itemsRouter = require('../items');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}));

describe('Items Routes', () => {
  let app;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/items', itemsRouter);

    // Add basic error handler
    app.use((err, req, res, next) => {
      const status = err.status || 500;
      res.status(status).json({ message: err.message });
    });
  });

  describe('GET /api/items', () => {
    const mockItems = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
      { id: 2, name: 'Headphones', category: 'Electronics', price: 399 },
      { id: 3, name: 'Chair', category: 'Furniture', price: 799 },
      { id: 4, name: 'Monitor', category: 'Electronics', price: 599 },
      { id: 5, name: 'Mouse', category: 'Electronics', price: 49 },
      { id: 6, name: 'Desk', category: 'Furniture', price: 1299 }
    ];

    describe('Basic functionality', () => {
      test('should return all items with pagination metadata', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(5); // Default pageSize is 5
        expect(res.body.pagination).toEqual({
          page: 1,
          pageSize: 5,
          totalCount: 6,
          totalPages: 2,
          hasMore: true
        });
      });

      test('should filter items by search query', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?q=laptop');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([mockItems[0]]);
        expect(res.body.pagination.totalCount).toBe(1);
      });

      test('should filter items case-insensitively', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?q=CHAIR');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([mockItems[2]]);
      });

      test('should return empty array when no matches found', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?q=nonexistent');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.totalCount).toBe(0);
      });
    });

    describe('Pagination', () => {
      test('should paginate with default page size of 5', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?page=1');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(5);
        expect(res.body.data[0].id).toBe(1);
        expect(res.body.data[4].id).toBe(5);
      });

      test('should return page 2 when requested', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?page=2');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].id).toBe(6);
        expect(res.body.pagination.page).toBe(2);
        expect(res.body.pagination.hasMore).toBe(false);
      });

      test('should set hasMore to true when more items exist', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?page=1');

        expect(res.body.pagination.hasMore).toBe(true);
      });

      test('should set hasMore to false on last page', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?page=2');

        expect(res.body.pagination.hasMore).toBe(false);
      });

      test('should calculate totalPages correctly', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items');

        expect(res.body.pagination.totalPages).toBe(2);
      });

      test('should handle invalid page number (less than 1)', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?page=0');

        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(1);
      });

      test('should handle negative page number', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?page=-5');

        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(1);
      });

      test('should handle non-numeric page parameter', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?page=abc');

        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(1);
      });

      test('should request page beyond available pages', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        const res = await request(app).get('/api/items?page=999');

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
        expect(res.body.pagination.hasMore).toBe(false);
      });
    });

    describe('Combined search and pagination', () => {
      test('should apply search first, then paginate', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        // Search for "o" which matches Monitor, Mouse (2 items)
        const res = await request(app).get('/api/items?q=o&page=1');

        // Should filter by name substring, then paginate
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.pagination.totalCount).toBeGreaterThan(0);
      });

      test('should respect pagination bounds with search filter', async () => {
        fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

        // Search for "phone" which matches Headphones (1 item)
        const res = await request(app).get('/api/items?q=phone');

        expect(res.body.data).toHaveLength(1); // 1 item matches
        expect(res.body.pagination.totalCount).toBe(1);
        expect(res.body.pagination.totalPages).toBe(1);
      });
    });

    describe('Error handling', () => {
      test('should handle file read errors', async () => {
        fs.readFile.mockRejectedValueOnce(new Error('File not found'));

        const res = await request(app).get('/api/items');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('File not found');
      });

      test('should handle invalid JSON', async () => {
        fs.readFile.mockResolvedValueOnce('invalid json');

        const res = await request(app).get('/api/items');

        expect(res.status).toBe(500);
      });
    });
  });

  describe('GET /api/items/:id', () => {
    const mockItems = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
      { id: 2, name: 'Headphones', category: 'Electronics', price: 399 }
    ];

    test('should return item by id', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

      const res = await request(app).get('/api/items/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockItems[0]);
    });

    test('should return second item', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

      const res = await request(app).get('/api/items/2');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockItems[1]);
    });

    test('should return 404 when item not found', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

      const res = await request(app).get('/api/items/999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Item not found');
    });

    test('should handle file read errors', async () => {
      fs.readFile.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/items/1');

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Database error');
    });

    test('should handle invalid id format', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));

      const res = await request(app).get('/api/items/abc');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/items', () => {
    const mockItems = [
      { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 }
    ];

    test('should create new item', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValueOnce();

      const newItem = { name: 'New Item', category: 'Test', price: 100 };
      const res = await request(app).post('/api/items').send(newItem);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('New Item');
      expect(res.body.price).toBe(100);
      expect(res.body.id).toBeDefined();
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    test('should accept empty body and create item', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValueOnce();

      const res = await request(app).post('/api/items').send({});

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
    });

    test('should assign unique timestamp-based id', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValueOnce();
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValueOnce();

      const item1 = { name: 'Item 1', price: 100 };
      const item2 = { name: 'Item 2', price: 200 };

      // Mock Date.now() to return different values
      const originalDateNow = Date.now;
      let callCount = 0;
      global.Date.now = jest.fn(() => originalDateNow() + (callCount++ * 1000));

      const res1 = await request(app).post('/api/items').send(item1);
      const res2 = await request(app).post('/api/items').send(item2);

      // Restore original Date.now
      global.Date.now = originalDateNow;

      expect(res1.body.id).toBeDefined();
      expect(res2.body.id).toBeDefined();
      expect(res1.body.id).not.toBe(res2.body.id);
    });

    test('should handle read errors', async () => {
      fs.readFile.mockRejectedValueOnce(new Error('Cannot read file'));

      const res = await request(app).post('/api/items').send({ name: 'Test' });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Cannot read file');
    });

    test('should handle write errors', async () => {
      fs.readFile.mockResolvedValueOnce(JSON.stringify(mockItems));
      fs.writeFile.mockRejectedValueOnce(new Error('Cannot write file'));

      const res = await request(app).post('/api/items').send({ name: 'Test' });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe('Cannot write file');
    });

    test('should handle invalid JSON in stored data', async () => {
      fs.readFile.mockResolvedValueOnce('invalid json');

      const res = await request(app).post('/api/items').send({ name: 'Test' });

      expect(res.status).toBe(500);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for undefined routes', async () => {
      const res = await request(app).get('/api/items/action/invalid');

      expect(res.status).toBe(404);
    });
  });
});
