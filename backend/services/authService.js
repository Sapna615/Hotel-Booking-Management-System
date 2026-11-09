const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/environment');

class AuthService {
  static generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  static async register({ name, email, password, phone }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error('An account with this email already exists');
      err.statusCode = 409;
      err.code = 'EMAIL_ALREADY_EXISTS';
      throw err;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: password,
      role: 'guest',
      phone,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('Your account is currently disabled. Please contact administration.');
      err.statusCode = 403;
      err.code = 'ACCOUNT_DISABLED';
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.code = 'USER_NOT_FOUND';
      throw err;
    }
    return user;
  }
}

module.exports = AuthService;

