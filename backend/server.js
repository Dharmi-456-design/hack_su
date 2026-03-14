/**
 * SmartFactory AI — Backend Server
 * Entry point for Express.js REST API
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ─────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/machines',   require('./routes/machineRoutes'));
app.use('/api/workers',    require('./routes/workerRoutes')); // Note: we'll repurpose this for users handling if needed
app.use('/api/inventory',  require('./routes/inventoryRoutes'));
app.use('/api/production', require('./routes/productionRoutes'));
app.use('/api/alerts',     require('./routes/alertRoutes'));
app.use('/api/analytics',  require('./routes/analyticsRoutes'));
app.use('/api/maintenance',require('./routes/maintenanceRoutes'));
app.use('/api/safety',     require('./routes/safetyRoutes'));
app.use('/api/users',      require('./routes/userRoutes')); // new
app.use('/api/push',       require('./routes/pushRoutes'));

// ─── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SmartFactory API running', time: new Date().toISOString() });
});

// ─── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Database connection ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartfactory')
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 SmartFactory API running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = server;
