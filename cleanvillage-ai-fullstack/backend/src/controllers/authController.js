const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { ROLES } = require('../config/constants');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: (parseInt(process.env.JWT_COOKIE_EXPIRES_DAYS, 10) || 7) * 24 * 60 * 60 * 1000,
});

// @desc    Register a new user (Admin/Officer/Worker account)
// @route   POST /api/auth/register
// @access  Public for the demo; lock this to Admin-only via `authorize`
//          in routes if you don't want open self-registration in production.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, title, phone, workerId } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: Object.values(ROLES).includes(role) ? role : ROLES.WORKER,
    title,
    phone,
    workerId: role === ROLES.WORKER ? workerId || null : null,
  });

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOptions());
  res.status(201).json({ success: true, token, user: user.toSafeObject() });
});

// @desc    Login and receive a JWT
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been disabled');
  }

  const token = generateToken(user._id);
  res.cookie('token', token, cookieOptions());
  res.status(200).json({ success: true, token, user: user.toSafeObject() });
});

// @desc    Get the currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Log out (clears the auth cookie; client should also drop its token)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out' });
});

module.exports = { register, login, getMe, logout };
