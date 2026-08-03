const { Patient, Registration, Queue } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const getSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [totalPatients, totalPatientsToday, totalQueuesToday, totalWaiting, totalDone] = await Promise.all([
      Patient.count(),
      Registration.count({ where: { visit_date: today } }),
      Queue.count({ where: { queue_date: today } }),
      Registration.count({ where: { visit_date: today, status: 'waiting' } }),
      Registration.count({ where: { visit_date: today, status: 'done' } }),
    ]);

    return successResponse(res, 'Success', {
      total_patients: totalPatients,
      total_patients_today: totalPatientsToday,
      total_queues_today: totalQueuesToday,
      total_waiting: totalWaiting,
      total_done: totalDone,
    });
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

module.exports = { getSummary };
