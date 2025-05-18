const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['crypto', 'stock'],
    required: true
  },
  isWin: {
    type: Boolean,
    required: true
  },
  percentageValue: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
});

module.exports = mongoose.model('Asset', assetSchema); 