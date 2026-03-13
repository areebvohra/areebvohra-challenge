/**
 * Enhanced request logging middleware
 * Logs incoming requests with method, URL, query parameters, and body size
 * Also logs response status codes and execution time for performance monitoring
 */
module.exports = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  // Log incoming request
  const queryString = Object.keys(req.query).length > 0 ? `?${new URLSearchParams(req.query)}` : '';
  const bodySize = req.headers['content-length'] ? `(${Math.round(req.headers['content-length'] / 1024)}KB)` : '';

  console.log(`[${requestId}] → ${req.method} ${req.originalUrl} ${bodySize}`);

  // Capture response status
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';

    console.log(`[${requestId}] ← ${statusColor} ${statusCode} (${duration}ms)`);
    return originalSend.call(this, data);
  };

  next();
};