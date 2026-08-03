const router = require('express').Router();
const { User } = require('../models');
const { authenticate } = require('../middlewares/auth');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/users?role=doctor
router.get('/', authenticate, async (req, res) => {
  try {
    const where = { is_active: true };
    if (req.query.role) where.role = req.query.role;

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'username', 'role'],
      order: [['name', 'ASC']],
    });

    return successResponse(res, 'Success', users);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
});

module.exports = router;
