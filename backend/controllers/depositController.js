const Transaction = require('../models/Transaction');
const User = require('../models/User');
const SystemWallet = require('../models/SystemWallet');

const systemWallets = {
    BTC: {
        address: '3FZbg129cpjqZGjdwV8eyHuJJnKLtktZc5',
        qrCode: 'btc_qr_code_url'
    },
    ETH: {
        address: '0x5b838a6a701c568545dcfc8083c2db75',
        qrCode: 'eth_qr_code_url'
    },
    USDT: {
        address: 'TXmEJ5wXrhnKhWE6SxzBXXXXXXXXXX',
        qrCode: 'usdt_qr_code_url'
    },
    BNB: {
        address: 'bnb1v3X5wXrhnKhWE6SxzBXXXXXXXXX',
        qrCode: 'bnb_qr_code_url'
    },
    SOL: {
        address: 'soL5wXrhnKhWE6SxzBXXXXXXXXX',
        qrCode: 'sol_qr_code_url'
    }
};

exports.getWalletAddress = async (req, res) => {
    try {
        const { currency } = req.params;
        const systemWallet = await SystemWallet.findOne({ currency: currency.toUpperCase() });
        
        if (!systemWallet) {
            return res.status(404).json({ message: 'Wallet not found for this currency' });
        }

        res.json({
            address: systemWallet.address,
            network: systemWallet.network,
            minDeposit: systemWallet.minDeposit
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailableCurrencies = async (req, res) => {
    try {
        const wallets = await SystemWallet.find().select('currency network minDeposit');
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.confirmDeposit = async (req, res) => {
    try {
        const { currency, amount, walletAddress } = req.body;
        
        const deposit = await Transaction.create({
            user: req.user.id,
            type: 'deposit',
            currency,
            amount,
            walletAddress,
            status: 'pending'
        });

        res.status(201).json(deposit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecentDeposits = async (req, res) => {
    try {
        const deposits = await Transaction.find({
            user: req.user.id,
            type: 'deposit'
        }).sort({ createdAt: -1 }).limit(10);

        res.json(deposits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 