const router = require('express').Router();
const { getSummary } = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, getSummary);

module.exports = router;
