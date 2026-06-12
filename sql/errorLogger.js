import pkg from 'pg';
import logger from '../logger.js';

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const logErrorToDb = async (err, req) => {
  try {
    const { message, stack } = err;
    const { method, originalUrl, ip } = req;
    const user = req.user ? { id: req.user.id, type: req.user.type, email: req.user.email } : null;

    await pool.query(
      `INSERT INTO api_error_logs (method, url, message, stack, ip_address, user_context)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [method, originalUrl, message, stack, ip, user ? JSON.stringify(user) : null]
    );
  } catch (dbError) {
    logger.error('CRITICAL: Failed to log error to database:', dbError);
  }
};

export const errorHandler = async (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  const logObject = {
    message: err.message,
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      user: req.user ? { id: req.user.id, type: req.user.type } : 'Not Authenticated'
    },
    stack: err.stack,
  };

  logger.error(logObject);
  await logErrorToDb(err, req);

  res.json({ success: false, error: statusCode === 500 && process.env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message });
};