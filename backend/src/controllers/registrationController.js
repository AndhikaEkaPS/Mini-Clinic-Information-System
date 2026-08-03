const { Registration, Patient, User, Polyclinic, Queue } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');

// Generate queue number: A001, A002 ...
const generateQueueNumber = async (date) => {
  const count = await Queue.count({ where: { queue_date: date } });
  return `A${String(count + 1).padStart(3, '0')}`;
};

const getAll = async (req, res) => {
  try {
    const { date, status } = req.query;
    const where = {};
    if (date) where.visit_date = date;
    if (status) where.status = status;

    const registrations = await Registration.findAll({
      where,
      include: [
        { model: Patient, as: 'patient', attributes: ['id', 'name', 'medical_record_number'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
        { model: Polyclinic, as: 'polyclinic', attributes: ['id', 'name'] },
        { model: Queue, as: 'queue', attributes: ['id', 'queue_number', 'status'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, 'Success', registrations);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const create = async (req, res) => {
  try {
    const { patient_id, doctor_id, polyclinic_id, visit_date, payment_type, chief_complaint } = req.body;

    const registration = await Registration.create({
      patient_id, doctor_id, polyclinic_id, visit_date, payment_type, chief_complaint, status: 'waiting',
    });

    // Auto-generate queue
    const queue_number = await generateQueueNumber(visit_date);
    await Queue.create({ registration_id: registration.id, queue_number, queue_date: visit_date, status: 'waiting' });

    return successResponse(res, 'Pendaftaran berhasil', registration, 201);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const updateStatus = async (req, res) => {
  try {
    const registration = await Registration.findByPk(req.params.id);
    if (!registration) return errorResponse(res, 'Pendaftaran tidak ditemukan', {}, 404);
    await registration.update({ status: req.body.status });
    return successResponse(res, 'Status diperbarui', registration);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

module.exports = { getAll, create, updateStatus };
