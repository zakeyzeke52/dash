const express = require('express');
const router = express.Router();
const tradingController = require('../controllers/tradingController');
const auth = require('../middleware/auth');

// Public route - no auth required
router.get('/assets', tradingController.getAssets);

// Protected routes - require auth
router.post('/open-trade', auth, tradingController.openTrade);
router.post('/close-trade/:tradeId', auth, tradingController.closeTrade);
router.get('/active-trades', auth, tradingController.getActiveTrades);
router.get('/trade-history', auth, tradingController.getTradeHistory);
router.get('/trades/count', auth, tradingController.getTradesCount);

module.exports = router; 