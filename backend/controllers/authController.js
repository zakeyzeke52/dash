const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Trade = require('../models/Trade');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD
  }
});

exports.register = async (req, res) => {
  try {
    const { 
      fullName, 
      dateOfBirth, 
      sex, 
      country, 
      occupation, 
      email, 
      password 
    } = req.body;
console.log(password)
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user with plain text password
    const user = await User.create({
      fullName,
      dateOfBirth,
      sex,
      country,
      occupation,
      email,
      password, // Storing password as plain text as requested
      balance: 0 // Starting balance
    });

    // Send welcome email
    const mailOptions = {
      from: process.env.ZOHO_EMAIL,
      to: email,
      subject: 'Welcome to MaxMarket! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Welcome to MaxMarket, ${fullName}! 🎉</h2>
          
          <p>Thank you for joining our trading platform. We're excited to have you on board!</p>
          
          <h3>Getting Started:</h3>
          <ul>
            <li>Explore our Crypto and Stock trading options</li>
            <li>Make your first deposit to start trading</li>
            <li>Set up your trading preferences</li>
            <li>Check out our trading tutorials</li>
          </ul>
          
          <p>For your security, please:</p>
          <ul>
            <li>Never share your password with anyone</li>
            <li>Enable two-factor authentication if available</li>
            <li>Regularly monitor your account activities</li>
          </ul>
          
          <p>If you have any questions or need assistance, our support team is here to help 24/7.</p>
          
          <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5;">
            <p style="margin: 0;">Happy Trading! 📈</p>
           
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    if (password !== user.password) {
      console.log('Password mismatch:', { 
        provided: password, 
        actual: user.password
      });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and return token with 30 day expiration
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Password Reset Link',
      text: `Please click on the following link to reset your password: \n\n
             ${req.protocol}://${req.get('host')}/reset-password/${resetToken}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ valid: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ valid: false });
        }

        // Get user stats
        const trades = await Trade.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        const totalProfitLoss = trades.reduce((total, trade) => 
            total + (trade.profitLoss || 0), 0);

        const completedTrades = trades.filter(trade => trade.status === 'completed');
        const winningTrades = completedTrades.filter(trade => trade.profitLoss > 0);
        const winRate = completedTrades.length > 0 
            ? (winningTrades.length / completedTrades.length * 100).toFixed(2)
            : 0;

        res.json({
            valid: true,
            user: {
                email: user.email,
                balance: user.balance
            },
            stats: {
                totalProfitLoss,
                winRate,
                tradesCount: completedTrades.length
            },
            recentTrades: trades
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ valid: false });
    }
}; 