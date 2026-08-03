const router = require('express').Router();
const ctrl = require('../controllers/queueController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.put('/:id/call', ctrl.callNext);
router.put('/:id/status', ctrl.updateStatus);

module.exports = router;
