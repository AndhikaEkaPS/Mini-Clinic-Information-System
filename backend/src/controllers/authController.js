const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username, is_active: true } });
    if (!user) return errorResponse(res, 'Username atau password salah', {}, 401);

    const isValid = await user.validatePassword(password);
    if (!isValid) return errorResponse(res, 'Username atau password salah', {}, 401);

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return successResponse(res, 'Login berhasil', {
      token,
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
    });
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const logout = (req, res) => {
  // JWT stateless — client hanya perlu hapus token
  return successResponse(res, 'Logout berhasil');
};

const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'username', 'role'],
    });
    return successResponse(res, 'Success', user);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

module.exports = { login, logout, me };
