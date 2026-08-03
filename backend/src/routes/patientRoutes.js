const router = require('express').Router();
const ctrl = require('../controllers/patientController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'receptionist'), ctrl.create);
router.put('/:id', authorize('admin', 'receptionist'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
