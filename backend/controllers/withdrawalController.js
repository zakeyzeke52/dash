const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Wallet = require('../models/Wallet');

exports.requestWithdrawal = async (req, res) => {
    try {
        const { walletId, amount } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid withdrawal amount' });
        }

        // Check user balance
        const user = await User.findById(req.user.id);
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Get wallet details
        const wallet = await Wallet.findOne({ _id: walletId, user: req.user.id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        // Create withdrawal transaction
        const withdrawal = await Transaction.create({
            user: req.user.id,
            type: 'withdrawal',
            currency: wallet.currency,
            amount,
            walletAddress: wallet.address,
            walletName: wallet.name,
            status: 'pending'
        });

        // Deduct amount from user balance
        user.balance -= amount;
        await user.save();

        res.status(201).json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWithdrawalHistory = async (req, res) => {
    try {
        const withdrawals = await Transaction.find({
            user: req.user.id,
            type: 'withdrawal'
        }).sort({ createdAt: -1 }).limit(10);

        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 