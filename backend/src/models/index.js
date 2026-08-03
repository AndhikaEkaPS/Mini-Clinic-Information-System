const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// Opsi default semua model — underscored: true agar Sequelize
// memetakan createdAt→created_at, updatedAt→updated_at
const BASE = { timestamps: true, underscored: true };

// ── User ──────────────────────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  username:  { type: DataTypes.STRING(50),  allowNull: false, unique: true },
  password:  { type: DataTypes.STRING(255), allowNull: false },
  role:      { type: DataTypes.ENUM('admin','doctor','receptionist'), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'users',
  ...BASE,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
    },
  },
});
User.prototype.validatePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

// ── Patient ───────────────────────────────────────────────────────────────────
const Patient = sequelize.define('Patient', {
  id:                    { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  medical_record_number: { type: DataTypes.STRING(30),  allowNull: false, unique: true },
  nik:                   { type: DataTypes.STRING(16),  allowNull: false, unique: true },
  name:                  { type: DataTypes.STRING(100), allowNull: false },
  gender:                { type: DataTypes.ENUM('male','female'), allowNull: false },
  date_of_birth:         { type: DataTypes.DATEONLY,    allowNull: false },
  phone:                 { type: DataTypes.STRING(20),  allowNull: true },
  address:               { type: DataTypes.TEXT,        allowNull: true },
}, { tableName: 'patients', ...BASE });

// ── Polyclinic ────────────────────────────────────────────────────────────────
const Polyclinic = sequelize.define('Polyclinic', {
  id:          { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'polyclinics', ...BASE });

// ── Registration ──────────────────────────────────────────────────────────────
const Registration = sequelize.define('Registration', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patient_id:      { type: DataTypes.INTEGER, allowNull: false },
  doctor_id:       { type: DataTypes.INTEGER, allowNull: false },
  polyclinic_id:   { type: DataTypes.INTEGER, allowNull: false },
  visit_date:      { type: DataTypes.DATEONLY, allowNull: false },
  payment_type:    { type: DataTypes.ENUM('umum','bpjs','asuransi'), allowNull: false },
  chief_complaint: { type: DataTypes.TEXT },
  status:          {
    type: DataTypes.ENUM('waiting','checkin','examination','done'),
    defaultValue: 'waiting',
  },
}, { tableName: 'registrations', ...BASE });

// ── Queue ─────────────────────────────────────────────────────────────────────
const Queue = sequelize.define('Queue', {
  id:              { type: DataTypes.INTEGER,    primaryKey: true, autoIncrement: true },
  registration_id: { type: DataTypes.INTEGER,    allowNull: false },
  queue_number:    { type: DataTypes.STRING(10), allowNull: false },
  status:          {
    type: DataTypes.ENUM('waiting','called','done','skip'),
    defaultValue: 'waiting',
  },
  called_at:  { type: DataTypes.DATE },
  queue_date: { type: DataTypes.DATEONLY, allowNull: false },
}, { tableName: 'queues', ...BASE });

// ── MedicalRecord ─────────────────────────────────────────────────────────────
const MedicalRecord = sequelize.define('MedicalRecord', {
  id:               { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  registration_id:  { type: DataTypes.INTEGER,     allowNull: false },
  patient_id:       { type: DataTypes.INTEGER,     allowNull: false },
  doctor_id:        { type: DataTypes.INTEGER,     allowNull: false },
  subjective:       { type: DataTypes.TEXT },
  blood_pressure:   { type: DataTypes.STRING(20) },
  temperature:      { type: DataTypes.DECIMAL(4,1) },
  weight:           { type: DataTypes.DECIMAL(5,2) },
  height:           { type: DataTypes.DECIMAL(5,2) },
  diagnosis:        { type: DataTypes.TEXT },
  therapy_plan:     { type: DataTypes.TEXT },
  medical_actions:  { type: DataTypes.TEXT },
  examination_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'medical_records', ...BASE });

// ── Prescription ──────────────────────────────────────────────────────────────
const Prescription = sequelize.define('Prescription', {
  id:                { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medical_record_id: { type: DataTypes.INTEGER, allowNull: false },
  patient_id:        { type: DataTypes.INTEGER, allowNull: false },
  medicines:         { type: DataTypes.JSON,    allowNull: false },
  notes:             { type: DataTypes.TEXT },
}, { tableName: 'prescriptions', ...BASE });

// ── Associations ──────────────────────────────────────────────────────────────
Patient.hasMany(Registration,      { foreignKey: 'patient_id',    as: 'registrations' });
Registration.belongsTo(Patient,    { foreignKey: 'patient_id',    as: 'patient' });

User.hasMany(Registration,         { foreignKey: 'doctor_id',     as: 'doctor_registrations' });
Registration.belongsTo(User,       { foreignKey: 'doctor_id',     as: 'doctor' });

Polyclinic.hasMany(Registration,   { foreignKey: 'polyclinic_id', as: 'registrations' });
Registration.belongsTo(Polyclinic, { foreignKey: 'polyclinic_id', as: 'polyclinic' });

Registration.hasOne(Queue,         { foreignKey: 'registration_id', as: 'queue' });
Queue.belongsTo(Registration,      { foreignKey: 'registration_id', as: 'registration' });

Registration.hasOne(MedicalRecord,    { foreignKey: 'registration_id', as: 'medical_record' });
MedicalRecord.belongsTo(Registration, { foreignKey: 'registration_id', as: 'registration' });

Patient.hasMany(MedicalRecord,     { foreignKey: 'patient_id', as: 'medical_records' });
MedicalRecord.belongsTo(Patient,   { foreignKey: 'patient_id', as: 'patient' });

User.hasMany(MedicalRecord,        { foreignKey: 'doctor_id',  as: 'doctor_records' });
MedicalRecord.belongsTo(User,      { foreignKey: 'doctor_id',  as: 'doctor' });

MedicalRecord.hasOne(Prescription,    { foreignKey: 'medical_record_id', as: 'prescription' });
Prescription.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id', as: 'medical_record' });

module.exports = {
  sequelize,
  User, Patient, Polyclinic,
  Registration, Queue,
  MedicalRecord, Prescription,
};
