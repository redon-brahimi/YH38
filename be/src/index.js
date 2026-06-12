import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from './logger.js';

// Import all routers
import authRoutes from './routes/auth.js';
import repairRoutes from './routes/repairs.js';
import adminRoutes from './routes/admin.js';
import appointmentRoutes from './routes/appointments.js';
import userRoutes from './routes/users.js'; // The missing piece

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middlewares ---
app.use(helmet()); // Apply basic security headers

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
app.use(cors({ origin: allowedOrigins }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes); // This line fixes the "Route not found" error

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// --- Error Handling ---
// 404 Not Found Handler
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
  logger.warn(error.message, { url: req.originalUrl, method: req.method });
  res.status(404).json({ success: false, error: error.message });
});

// Global Error Handler
app.use((error, req, res, next) => {
  logger.error(error.message, {
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
  });
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;