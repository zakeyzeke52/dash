const express = require('express');
const router = express.Router();
const path = require('path');

// Serve static pages
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/pages/Login.html'));
});

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/pages/Dashboard.html'));
});

router.get('/crypto-trading', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/pages/CryptoTrading.html'));
});

router.get('/stock-trading', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/pages/StockTrading.html'));
});

router.get('/deposit', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/pages/Deposit.html'));
});

router.get('/withdraw', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/pages/Withdraw.html'));
});

router.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/src/pages/History.html'));
});

// Redirect root to login
router.get('/', (req, res) => {
    res.redirect('/login');
});

module.exports = router; 