const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');

router.get('/list', auth, walletController.listWallets);
router.post('/add', auth, walletController.addWallet);
router.delete('/delete/:id', auth, walletController.deleteWallet);

module.exports = router; 