const mongoose = require('mongoose');

const cleaningSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  cleanerName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    enum: ['Daily Sweep', 'Mop', 'Bathroom', 'Deep Clean', 'Trash Removal'],
    default: 'Daily Sweep'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  remarks: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Cleaning', cleaningSchema);
