const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'leave', 'holiday'], required: true },
  checkInTime: { type: String, default: null },
  checkOutTime: { type: String, default: null },
  lateMinutes: { type: Number, default: 0 },
  leaveType: { type: String, enum: ['sick', 'casual', 'emergency', 'vacation'], default: null },
  leaveApproved: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String
}, { timestamps: true });

// Removed unique index to allow multiple check-ins per day
// attendanceSchema.index({ residentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);