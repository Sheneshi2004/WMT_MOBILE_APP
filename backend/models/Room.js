const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, uppercase: true },
  roomType: { type: String, enum: ['Single', 'Double', 'Triple', 'Shared', 'Quad', 'Dormitory'], required: true },
  capacity: { type: Number, required: true, min: 1 },
  currentOccupancy: { type: Number, default: 0 },
  pricePerMonth: { type: Number, required: true, min: 0 },
  description: { type: String },
  facilities: [{ type: String }],
  images: [{ type: String }],
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved'], default: 'available' },
  isActive: { type: Boolean, default: true },
  reminderEnabled: { type: Boolean, default: false },
  reminderDate: { type: Date },
  reminderMessage: { type: String }
}, { timestamps: true });

// Auto update status when occupancy changes
roomSchema.pre('save', function () {
  // If the user manually updated currentOccupancy, let's enforce status.
  // Otherwise, respect manual status changes.
  if (this.currentOccupancy >= this.capacity) {
    this.status = 'occupied';
  } else if (this.status === 'occupied' && this.currentOccupancy < this.capacity && this.isModified('currentOccupancy')) {
    this.status = 'available';
  }

  if (this.status === 'occupied' || this.status === 'maintenance') {
    this.reminderEnabled = false;
  }

  if (this.status === 'available') {
    this.reminderEnabled = true;
  }

  if (this.reminderDate && new Date() > this.reminderDate) {
    this.reminderEnabled = false;
  }

});

module.exports = mongoose.model('Room', roomSchema);