const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');
const auth = require('../middleware/auth');

router.get('/currencies', auth, depositController.getAvailableCurrencies);
router.get('/wallet-address/:currency', auth, depositController.getWalletAddress);
router.post('/confirm', auth, depositController.confirmDeposit);
router.get('/recent', auth, depositController.getRecentDeposits);

module.exports = router; 