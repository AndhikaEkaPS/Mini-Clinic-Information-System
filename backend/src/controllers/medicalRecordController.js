const { MedicalRecord, Prescription, Registration, Patient, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

const create = async (req, res) => {
  try {
    const {
      registration_id, patient_id, subjective,
      blood_pressure, temperature, weight, height,
      diagnosis, therapy_plan, medical_actions,
    } = req.body;

    const record = await MedicalRecord.create({
      registration_id, patient_id, doctor_id: req.user.id,
      subjective, blood_pressure, temperature, weight, height,
      diagnosis, therapy_plan, medical_actions: JSON.stringify(medical_actions || []),
    });

    // Update registration status to done
    await Registration.update({ status: 'done' }, { where: { id: registration_id } });

    return successResponse(res, 'Pemeriksaan berhasil disimpan', record, 201);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const getByPatient = async (req, res) => {
  try {
    const records = await MedicalRecord.findAll({
      where: { patient_id: req.params.patientId },
      include: [
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
        { model: Prescription, as: 'prescription' },
      ],
      order: [['examination_date', 'DESC']],
    });
    return successResponse(res, 'Success', records);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const createPrescription = async (req, res) => {
  try {
    const { medical_record_id, patient_id, medicines, notes } = req.body;
    const prescription = await Prescription.create({ medical_record_id, patient_id, medicines, notes });
    return successResponse(res, 'Resep berhasil disimpan', prescription, 201);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [{ model: MedicalRecord, as: 'medical_record' }],
    });
    if (!prescription) return errorResponse(res, 'Resep tidak ditemukan', {}, 404);
    return successResponse(res, 'Success', prescription);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

module.exports = { create, getByPatient, createPrescription, getPrescription };
