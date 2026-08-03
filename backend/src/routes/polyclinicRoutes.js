const router = require('express').Router();
const { Polyclinic } = require('../models');
const { authenticate } = require('../middlewares/auth');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/polyclinics
router.get('/', authenticate, async (req, res) => {
  try {
    const polyclinics = await Polyclinic.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    return successResponse(res, 'Success', polyclinics);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
});

module.exports = router;
