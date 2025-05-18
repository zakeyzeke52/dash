const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static('frontend/src'));

// Import routes
const authRoutes = require('./routes/auth');
const tradingRoutes = require('./routes/trading');
const depositRoutes = require('./routes/deposit');
const withdrawRoutes = require('./routes/withdraw');
const staticRoutes = require('./routes/static');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/withdraw', withdrawRoutes);

// Use static routes last (after API routes)
app.use('/', staticRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 