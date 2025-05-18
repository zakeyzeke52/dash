const Wallet = require('../models/Wallet');

exports.listWallets = async (req, res) => {
    try {
        const wallets = await Wallet.find({ user: req.user.id });
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addWallet = async (req, res) => {
    try {
        const { name, currency, address } = req.body;

        // Check if wallet address already exists for this user
        const existingWallet = await Wallet.findOne({
            user: req.user.id,
            address
        });

        if (existingWallet) {
            return res.status(400).json({ message: 'Wallet address already exists' });
        }

        const wallet = await Wallet.create({
            user: req.user.id,
            name,
            currency,
            address
        });

        res.status(201).json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.json({ message: 'Wallet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 