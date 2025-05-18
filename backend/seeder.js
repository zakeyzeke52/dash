const mongoose = require('mongoose');
const Asset = require('./models/Asset');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Wallet = require('./models/Wallet');
const bcrypt = require('bcryptjs');
const SystemWallet = require('./models/SystemWallet');
require('dotenv').config();

const cryptoAssets = [
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin',
    type: 'crypto',
    isWin: true,
    percentageValue: 85
  },
  {
    symbol: 'ETHUSDT',
    name: 'Ethereum',
    type: 'crypto',
    isWin: false,
    percentageValue: 80
  },
  {
    symbol: 'BNBUSDT',
    name: 'Binance Coin',
    type: 'crypto',
    isWin: true,
    percentageValue: 75
  },
  {
    symbol: 'ADAUSDT',
    name: 'Cardano',
    type: 'crypto',
    isWin: false,
    percentageValue: 70
  },
  {
    symbol: 'DOGEUSDT',
    name: 'Dogecoin',
    type: 'crypto',
    isWin: true,
    percentageValue: 65
  }
];

const stockAssets = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    isWin: true,
    percentageValue: 80
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'stock',
    isWin: false,
    percentageValue: 75
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stock',
    isWin: true,
    percentageValue: 85
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    type: 'stock',
    isWin: false,
    percentageValue: 70
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    type: 'stock',
    isWin: true,
    percentageValue: 90
  }
];

// Add system wallets
const systemWallets = [
  {
    currency: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Bitcoin Network',
    minDeposit: 0.001
  },
  {
    currency: 'ETH',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    network: 'Ethereum Network',
    minDeposit: 0.01
  },
  {
    currency: 'USDT',
    address: 'TWd2yzw5VQkhUTi9JdXqQQYGQjR4mYz5Yc',
    network: 'Tron Network',
    minDeposit: 10
  },
  {
    currency: 'BNB',
    address: 'bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m',
    network: 'BNB Smart Chain',
    minDeposit: 0.01
  },
  {
    currency: 'SOL',
    address: '7ZFp9cSwNhA3LsqAJqKXGAQoJ8JYEVoRJXYs3i3m1wQe',
    network: 'Solana Network',
    minDeposit: 0.1
  }
];

// Sample users
const users = [
  {
    email: 'test@example.com',
    password: 'password123',
    balance: 10000,
    wallets: [
      {
        name: 'My Bitcoin Wallet',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        currency: 'BTC'
      },
      {
        name: 'My Ethereum Wallet',
        address: '0x5b838ba6a701c568545dcfc8083fc8875f56beddc4',
        currency: 'ETH'
      }
    ],
    transactions: [
      {
        type: 'deposit',
        currency: 'BTC',
        amount: 0.05,
        status: 'completed',
        walletAddress: '3FZbg129cpjqZGjdwV8eyHuJJnKLtktZc5'
      },
      {
        type: 'withdrawal',
        currency: 'ETH',
        amount: 0.75,
        status: 'completed',
        walletAddress: '0x5b838ba6a701c568545dcfc8083fc8875f56beddc4',
        walletName: 'My Ethereum Wallet'
      },
      {
        type: 'deposit',
        currency: 'USDT',
        amount: 500,
        status: 'pending',
        walletAddress: 'TXmEJ5wXrhnKhWE6SxzBXXXXXXXXXX'
      }
    ]
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/maxmarket');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Asset.deleteMany({}),
      User.deleteMany({}),
      Wallet.deleteMany({}),
      Transaction.deleteMany({}),
      SystemWallet.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Insert assets
    await Asset.insertMany([...cryptoAssets, ...stockAssets]);
    console.log('Seeded assets');

    // Insert users and their data
    for (const userData of users) {
      const user = await User.create({
        email: userData.email,
        password: userData.password, // Store password as plain text
        balance: userData.balance
      });

      // Create user wallets
      const wallets = userData.wallets.map(w => ({
        ...w,
        user: user._id
      }));
      await Wallet.insertMany(wallets);

      // Create transactions
      const transactions = userData.transactions.map(t => ({
        ...t,
        user: user._id
      }));
      await Transaction.insertMany(transactions);
    }
    console.log('Seeded users, wallets, and transactions');

    // Insert system wallets
    await SystemWallet.insertMany(systemWallets);
    console.log('Seeded system wallets');

    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase(); 