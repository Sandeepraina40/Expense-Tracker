/**
 * Auth Controller
 * Handles user registration and authentication
 * Includes JWT token generation and welcome email dispatch
 * @author Harsh Chimnani
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

// JWT token expiration duration
const TOKEN_EXPIRY = '30d';

/**
 * Generate a signed JWT token for authenticated users
 * @param {string} userId - MongoDB user ID
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: TOKEN_EXPIRY,
  });
};

/**
 * Format the user response object with token
 * @param {object} user - Mongoose user document
 * @returns {object} Sanitized user data with auth token
 */
const formatUserResponse = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  token: generateToken(user._id),
});

// ============================================================
// @desc    Register a new user account
// @route   POST /api/auth/register
// @access  Public
// ============================================================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required input fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password.',
      });
    }

    // Check for existing user with same email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Create new user document in the database
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid user data. Please try again.' });
    }

    // Send welcome email asynchronously (non-blocking)
    sendWelcomeEmail(user).catch((err) => {
      console.error('Welcome email failed for:', user.email, err.message);
    });

    // Return user data with authentication token
    res.status(201).json(formatUserResponse(user));
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
};

/**
 * Send a welcome email to newly registered users
 * @param {object} user - The newly created user
 */
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    email: user.email,
    subject: 'Welcome to Expense Tracker!',
    message: `Hi ${user.name},\n\nWelcome to your new Expense Tracker! We're excited to have you on board.\n\nStart tracking your expenses today and gain valuable insights into your spending habits.\n\nBest regards,\nThe Expense Tracker Team`,
  });
};

// ============================================================
// @desc    Authenticate user and return token
// @route   POST /api/auth/login
// @access  Public
// ============================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required input fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide both email and password.',
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() });

    // Verify user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Return user data with fresh authentication token
    res.status(200).json(formatUserResponse(user));
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
};

module.exports = { registerUser, loginUser };
