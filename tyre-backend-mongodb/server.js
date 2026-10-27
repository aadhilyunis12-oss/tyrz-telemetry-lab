require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const catalogRoutes = require('./src/routes/catalogRoutes');
const inspectionRoutes = require('./src/routes/inspectionRoutes');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tyre-fitment-backend' });
});
app.use('/api/catalog', catalogRoutes);
app.use('/api/inspections', inspectionRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use((error, _req, res, _next) => {
  console.error('API error:', error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Data validation failed.', details: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID or field value.' });
  }
  return res.status(500).json({ message: 'Unexpected backend error.' });
});

async function start() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing. Copy .env.example to .env and add your MongoDB URI.');
  }
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 12000 });
  console.log('✅ Connected to MongoDB');
  app.listen(port, () => console.log(`✅ API running at http://localhost:${port}`));
}

start().catch(error => {
  console.error('❌ Startup failed:', error.message);
  process.exit(1);
});
