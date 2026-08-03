require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');   // ← harus ada baris ini

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);             // ← prefix /api

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Clinic API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;