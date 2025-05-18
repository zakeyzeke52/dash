const User = require('../models/User');
const Trade = require('../models/Trade');

exports.getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const trades = await Trade.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate total profit/loss
        const totalProfitLoss = trades.reduce((total, trade) => {
            return total + (trade.profitLoss || 0);
        }, 0);

        // Calculate win rate
        const completedTrades = trades.filter(trade => trade.status === 'completed');
        const winningTrades = completedTrades.filter(trade => trade.profitLoss > 0);
        const winRate = completedTrades.length > 0 
            ? (winningTrades.length / completedTrades.length * 100).toFixed(2)
            : 0;

        res.json({
            user,
            stats: {
                totalProfitLoss,
                winRate,
                tradesCount: completedTrades.length
            },
            recentTrades: trades
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 