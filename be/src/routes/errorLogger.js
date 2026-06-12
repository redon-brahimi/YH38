
import logger from '../logger.js';

// import pkg from 'pg'; // Temporarily disabled DB logging
// const { Pool } = pkg; // Temporarily disabled DB logging
// const pool = new Pool({ connectionString: process.env.DATABASE_URL }); // Temporarily disabled DB logging

const errorLogger = async (err, req, res, next) => {
  // Log to winston logger first
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? { id: req.user.id, type: req.user.type } : null,
  });

  // // Log to database - Temporarily disabled
  // try {
  //   await pool.query(
  //     `INSERT INTO api_error_logs (method, url, message, stack, ip_address, user_context)
  //      VALUES ($1, $2, $3, $4, $5, $6)`,
  //     [
  //       req.method,
  //       req.originalUrl,
  //       err.message,
  //       err.stack,
  //       req.ip,
  //       req.user ? { id: req.user.id, email: req.user.email, type: req.user.type } : null,
  //     ]
  //   );
  // } catch (dbError) {
  //   // If DB logging fails, log that failure to the file logger
  //   logger.error('Failed to log error to database:', {
  //     dbError: dbError.message,
  //     originalError: err.message,
  //   });
  // }

  // Pass the error to the next error-handling middleware (e.g., Express's default one)
  next(err);
};

export default errorLogger;