const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  // ===== PUBLIC FORM FIELDS =====
  fullName: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  preferredRoomType: { 
    type: String, 
    enum: ['Single', 'Double', 'Triple', 'Shared', 'Any'], 
    required: true 
  },
  preferredVisitDate: { type: Date, required: true },
  message: { type: String, default: null, maxlength: 500 },
  
  // ===== ADMIN FIELDS =====
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'completed'], 
    default: 'pending' 
  },
  assignedRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
  assignedRoomNumber: { type: String, default: null },
  scheduledTime: { type: String, default: null },
  adminNotes: { type: String, default: null },
  approvedAt: { type: Date, default: null },
  approvedBy: { type: String, default: null },
  
  // ===== SECURITY FIELDS =====
  checkInTime: { type: Date, default: null },
  checkOutTime: { type: Date, default: null },
  gatePassNumber: { type: String, unique: true, sparse: true },
  securityGuardName: { type: String, default: null },
  idCardVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Generate gate pass number when check-in
visitorSchema.pre('save', async function() {
  if (this.checkInTime && !this.gatePassNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
    const count = await mongoose.model('Visitor').countDocuments({ gatePassNumber: { $ne: null } });
    this.gatePassNumber = `GP${dateStr}${String(count + 1).padStart(4, '0')}`;
  }
  
});

module.exports = mongoose.model('Visitor', visitorSchema);