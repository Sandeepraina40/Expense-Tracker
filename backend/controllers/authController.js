const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');


const TOKEN_EXPIRY = '30d';
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: TOKEN_EXPIRY,
  });
};
const formatUserResponse = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id),
});
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password.',
      });
    }
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data. Please try again.' });
    }
    sendWelcomeEmail(user).catch((err) => {
      console.error('Welcome email failed for:', user.email, err.message);
    });
    res.status(201).json(formatUserResponse(user));
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
};

const sendWelcomeEmail = async (user) => {
  await sendEmail({
    email: user.email,
    subject: 'Welcome to Expense Tracker!',
    message: `Hi ${user.name},\n\nWelcome to your new Expense Tracker! We're excited to have you on board.\n\nStart tracking your expenses today and gain valuable insights into your spending habits.\n\nBest regards,\nThe Expense Tracker Team`,
  });
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide both email and password.',
      });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    res.status(200).json(formatUserResponse(user));
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};

module.exports = { registerUser, loginUser };
