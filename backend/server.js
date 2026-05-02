const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const app = express();

// ========== BASIC MIDDLEWARE ==========
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// ========== TEST ROUTES ==========
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ========== API ROUTES ==========
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/residents', (req, res, next) => {
  console.log(`[RESIDENTS] ${req.method} ${req.originalUrl}`);
  next();
}, require('./routes/residents'));
app.use('/api/visitors', require('./routes/visitors'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/cleaning', require('./routes/cleaning'));

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.originalUrl} not found` 
  });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

// ========== DATABASE CONNECTION ==========
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));
