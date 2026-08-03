const { Op } = require('sequelize');
const { Patient } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');

// Generate: RM-YYYYMMDD-XXXX
const generateMedicalRecordNumber = async () => {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
  const count = await Patient.count();
  const seq = String(count + 1).padStart(4, '0');
  return `RM-${datePart}-${seq}`;
};

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    const where = search
      ? { [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { nik: { [Op.like]: `%${search}%` } },
          { medical_record_number: { [Op.like]: `%${search}%` } },
        ]}
      : {};

    const { count, rows } = await Patient.findAndCountAll({
      where, limit: parseInt(limit), offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, 'Success', {
      data: rows,
      pagination: { total: count, page: parseInt(page), limit: parseInt(limit),
        totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const getById = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return errorResponse(res, 'Pasien tidak ditemukan', {}, 404);
    return successResponse(res, 'Success', patient);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const create = async (req, res) => {
  try {
    const { nik, name, gender, date_of_birth, phone, address } = req.body;
    const existing = await Patient.findOne({ where: { nik } });
    if (existing) return errorResponse(res, 'NIK sudah terdaftar', { nik: 'NIK duplikat' }, 422);

    const medical_record_number = await generateMedicalRecordNumber();
    const patient = await Patient.create({ nik, name, gender, date_of_birth, phone, address, medical_record_number });
    return successResponse(res, 'Pasien berhasil ditambahkan', patient, 201);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const update = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return errorResponse(res, 'Pasien tidak ditemukan', {}, 404);

    const { nik, name, gender, date_of_birth, phone, address } = req.body;
    if (nik && nik !== patient.nik) {
      const dup = await Patient.findOne({ where: { nik } });
      if (dup) return errorResponse(res, 'NIK sudah terdaftar', { nik: 'NIK duplikat' }, 422);
    }

    await patient.update({ nik, name, gender, date_of_birth, phone, address });
    return successResponse(res, 'Pasien berhasil diperbarui', patient);
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

const remove = async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return errorResponse(res, 'Pasien tidak ditemukan', {}, 404);
    await patient.destroy();
    return successResponse(res, 'Pasien berhasil dihapus');
  } catch (err) {
    return errorResponse(res, 'Server error', { detail: err.message }, 500);
  }
};

module.exports = { getAll, getById, create, update, remove };
