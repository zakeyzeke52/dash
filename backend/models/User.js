const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
   
  },
  dateOfBirth: {
    type: Date,
   
  },
  sex: {
    type: String,
    
    enum: ['male', 'female', 'other']
  },
  country: {
    type: String,
   
  },
  occupation: {
    type: String,
   
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  //this.password = await bcrypt.hash(this.password, 12);
  next();
});



module.exports = mongoose.model('User', userSchema); 