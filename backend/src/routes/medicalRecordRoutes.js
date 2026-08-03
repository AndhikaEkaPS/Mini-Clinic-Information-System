const router = require('express').Router();
const ctrl = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.post('/', authorize('doctor'), ctrl.create);
router.get('/:patientId', ctrl.getByPatient);
router.post('/prescriptions', authorize('doctor'), ctrl.createPrescription);
router.get('/prescriptions/:id', ctrl.getPrescription);

module.exports = router;
