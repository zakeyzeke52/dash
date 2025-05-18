const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    enum: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT', 'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,  // Duration in seconds
    required: true,
    min: 30,       // Minimum 30 seconds
        // Maximum 1 hour
  },
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Trade', tradeSchema); 