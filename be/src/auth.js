import jwt from 'jsonwebtoken';
import pkg from 'pg';
import logger from './logger.js';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // The token payload should contain user id and type.
      // Based on your models, we check against clients or admins tables.
      let userQuery;
      if (decoded.type === 'client') {
        userQuery = pool.query("SELECT id, name, email, phone, notification_preference, 'client' as type FROM clients WHERE id = $1", [decoded.id]);
      } else if (decoded.type === 'admin') {
        // Correctly select the role AND alias 'admin' as the type.
        // This ensures req.user has both .role and .type properties.
        userQuery = pool.query("SELECT id, name, email, role, 'admin' as type FROM admins WHERE id = $1", [decoded.id]);
      } else {
        return res.status(401).json({ success: false, error: 'Not authorized, invalid token subject type' });
      }

      const { rows } = await userQuery;

      if (rows.length === 0) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }
      
      req.user = rows[0];
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Not authorized, token expired' });
      }
      logger.error('Authentication error:', { error, token });
      return res.status(401).json({ success: false, error: 'Not authorized, token is invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};