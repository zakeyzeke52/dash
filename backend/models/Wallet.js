const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema); 