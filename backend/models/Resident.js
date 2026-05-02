const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  nic: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 5 },
  guardianName: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  permanentAddress: { type: String },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  checkInDate: { type: Date, default: Date.now },
  checkOutDate: { type: Date, default: null },
  status: { type: String, enum: ['active', 'inactive', 'blocked', 'left'], default: 'active' },
  roomHistory: [{
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    roomNumber: String,
    assignedDate: Date,
    vacatedDate: Date
  }]
}, { timestamps: true });

// Validate Sri Lankan NIC
residentSchema.path('nic').validate(function(nic) {
  const oldNicRegex = /^[0-9]{9}[Vv]$/;
  const newNicRegex = /^[0-9]{12}$/;
  return oldNicRegex.test(nic) || newNicRegex.test(nic);
}, 'Please enter a valid Sri Lankan NIC');

module.exports = mongoose.model('Resident', residentSchema);