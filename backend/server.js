const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));
app.use('/pages', express.static(path.join(__dirname, '../frontend/src/pages')));
app.use('/js', express.static(path.join(__dirname, '../frontend/src/js')));
app.use('/css', express.static(path.join(__dirname, '../frontend/src/css')));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trading', require('./routes/trading'));
app.use('/api/deposit', require('./routes/deposit'));
app.use('/api/withdrawal', require('./routes/withdrawal'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/user', require('./routes/user'));

// Frontend Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/pages/Login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/pages/Dashboard.html'));
});

app.get('/crypto-trading', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/pages/CryptoTrading.html'));
});

app.get('/stock-trading', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/pages/StockTrading.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/pages/History.html'));
});

app.get('/deposit', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/pages/Deposit.html'));
});

app.get('/withdraw', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/pages/Withdraw.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 