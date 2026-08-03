const router = require('express').Router();
const ctrl = require('../controllers/registrationController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', authorize('admin', 'receptionist'), ctrl.create);
router.put('/:id', authorize('admin', 'receptionist', 'doctor'), ctrl.updateStatus);

module.exports = router;
