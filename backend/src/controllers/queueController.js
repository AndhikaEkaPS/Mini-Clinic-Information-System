const { Queue, Registration, Patient } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const getAll = async (req, res) => {
  try {
    const { date = new Date().toISOString().slice(0, 10) } = req.query;
    const queues = await Queue.findAll({
      where: { queue_date: date },
      include: [{
        model: Registration, as: 'registration',
        include: [{ model: Patient, as: 'patient', attributes: ['id', 'name', 'medical_record_number'] }],
      }],
      order: [['queue_number', 'ASC']],
    });
    return successResponse(res, 'Success', queues);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const callNext = async (req, res) => {
  try {
    const queue = await Queue.findOne({
      where: { id: req.params.id },
    });
    if (!queue) return errorResponse(res, 'Antrean tidak ditemukan', {}, 404);
    await queue.update({ status: 'called', called_at: new Date() });
    return successResponse(res, 'Antrean dipanggil', queue);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const updateStatus = async (req, res) => {
  try {
    const queue = await Queue.findByPk(req.params.id);
    if (!queue) return errorResponse(res, 'Antrean tidak ditemukan', {}, 404);
    await queue.update({ status: req.body.status });
    return successResponse(res, 'Status antrean diperbarui', queue);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

module.exports = { getAll, callNext, updateStatus };
