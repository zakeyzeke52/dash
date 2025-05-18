const mongoose = require('mongoose');

const systemWalletSchema = new mongoose.Schema({
    currency: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    network: {
        type: String,
        required: true
    },
    minDeposit: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('SystemWallet', systemWalletSchema); 