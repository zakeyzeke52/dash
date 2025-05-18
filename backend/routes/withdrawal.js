const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');

router.post('/request', auth, withdrawalController.requestWithdrawal);
router.get('/history', auth, withdrawalController.getWithdrawalHistory);

module.exports = router; 