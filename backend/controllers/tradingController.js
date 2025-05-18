const Trade = require('../models/Trade');
const User = require('../models/User');
const Asset = require('../models/Asset');

exports.getAssets = async (req, res) => {
  try {
    const { type } = req.query; // 'crypto' or 'stock'
    const assets = await Asset.find({ type });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.openTrade = async (req, res) => {
  try {
    const { symbol, amount, type, duration } = req.body;
    const userId = req.user.id;

    // Get asset and validate
    const asset = await Asset.findOne({ symbol });
    if (!asset) {
      return res.status(400).json({ message: 'Invalid trading pair' });
    }

    // Get user and check balance
    const user = await User.findById(userId);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create trade
    const trade = await Trade.create({
      user: userId,
      symbol,
      amount,
      type,
      duration,
      status: 'active'
    });

    // Deduct amount from user balance
    user.balance -= amount;
    await user.save();

    // Set timeout to close trade
    setTimeout(async () => {
      try {
        const profitLossPercentage = asset.isWin ? 
          (asset.percentageValue / 100) : 
          -(asset.percentageValue / 100);
        const profitLoss = amount * profitLossPercentage;

        // Update trade
        trade.status = 'completed';
        trade.profitLoss = profitLoss;
        trade.closedAt = new Date();
        await trade.save();

        // Update user balance
        if (asset.isWin) {
          user.balance += (amount + profitLoss);
        }
        await user.save();
      } catch (error) {
        console.error('Error closing trade:', error);
      }
    }, duration * 1000);

    res.status(201).json(trade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.closeTrade = async (req, res) => {
  try {
    const { tradeId } = req.params;
    const trade = await Trade.findById(tradeId);
    
    if (!trade || trade.status !== 'active') {
      return res.status(400).json({ message: 'Invalid trade or already closed' });
    }

    const asset = await Asset.findOne({ symbol: trade.symbol });
    const user = await User.findById(trade.user);

    const profitLossPercentage = asset.isWin ? 
      (asset.percentageValue / 100) : 
      -(asset.percentageValue / 100);
    const profitLoss = trade.amount * profitLossPercentage;

    // Update trade
    trade.status = 'completed';
    trade.profitLoss = profitLoss;
    trade.closedAt = new Date();
    await trade.save();

    // Update user balance
    if (asset.isWin) {
      user.balance += (trade.amount + profitLoss);
    }
    await user.save();

    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getActiveTrades = async (req, res) => {
  try {
    const trades = await Trade.find({
      user: req.user.id,
      status: 'active'
    }).sort({ createdAt: -1 });

    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTradeHistory = async (req, res) => {
    try {
        const { type, status, page = 1, limit = 5 } = req.query;
        const skip = (page - 1) * parseInt(limit);
        
        let query = { user: req.user.id, status: 'completed' };
        
        // Add type filter if specified
        if (type && type !== 'all') {
            query.type = type.toLowerCase();
        }
        
        // Add win/loss filter if specified
        if (status && status !== 'all') {
            query.profitLoss = status === 'win' ? { $gt: 0 } : { $lt: 0 };
        }

        // Get trades with pagination
        const trades = await Trade.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Trade.countDocuments(query);

        res.json({
            trades,
            total,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error getting trade history:', error);
        res.status(500).json({ message: 'Error fetching trade history' });
    }
};

// Add this function to get total trades count
const getTotalTradesCount = async (userId) => {
    try {
        const totalTrades = await Trade.countDocuments({ userId });
        return totalTrades;
    } catch (error) {
        console.error('Error getting total trades count:', error);
        return 0;
    }
};

// Update your verify endpoint to include this count
exports.verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const trades = await Trade.find({ user: req.user.id, status: 'completed' })
            .sort({ createdAt: -1 });

        // Calculate stats
        const wins = trades.filter(t => t.profitLoss > 0).length;
        const losses = trades.filter(t => t.profitLoss < 0).length;
        const totalTrades = wins + losses;
        const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;

        const stats = {
            winRate,
            totalTrades,
            wins,
            losses,
            totalProfitLoss: trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)
        };

        // Get recent trades for display
        const recentTrades = trades.slice(0, 5);

        res.json({
            valid: true,
            user,
            stats,
            recentTrades
        });
    } catch (error) {
        console.error('Error in verify:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add this new endpoint
exports.getTradesCount = async (req, res) => {
    try {
        // Change to count all trades (both active and completed)
        const totalTrades = await Trade.countDocuments({ 
            user: req.user.id,
            status: { $in: ['active', 'completed'] }
        });
        res.json({ totalTrades });
    } catch (error) {
        console.error('Error getting trades count:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 