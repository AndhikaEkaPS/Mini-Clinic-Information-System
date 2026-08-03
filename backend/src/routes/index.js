const router = require('express').Router();
const authRoutes         = require('./authRoutes');
const patientRoutes      = require('./patientRoutes');
const registrationRoutes = require('./registrationRoutes');
const queueRoutes        = require('./queueRoutes');
const medicalRecordRoutes = require('./medicalRecordRoutes');
const dashboardRoutes    = require('./dashboardRoutes');
const userRoutes         = require('./userRoutes');
const polyclinicRoutes   = require('./polyclinicRoutes');

router.use('/auth',           authRoutes);
router.use('/patients',       patientRoutes);
router.use('/registrations',  registrationRoutes);
router.use('/queues',         queueRoutes);
router.use('/medical-records',medicalRecordRoutes);
router.use('/dashboard',      dashboardRoutes);
router.use('/users',          userRoutes);
router.use('/polyclinics',    polyclinicRoutes);

module.exports = router;
