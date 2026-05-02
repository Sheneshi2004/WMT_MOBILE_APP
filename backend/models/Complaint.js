const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  complaintNumber: { type: String, unique: true },
  category: { type: String, enum: ['maintenance', 'electricity', 'water', 'food', 'cleanliness', 'security', 'other'], required: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 1000 },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  images: [{ type: String }],
  status: { type: String, enum: ['pending', 'in_progress', 'resolved', 'rejected'], default: 'pending' },
  assignedTo: { type: String, default: null },
  resolution: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
  feedback: String
}, { timestamps: true });

// Generate complaint number before saving
complaintSchema.pre('save', async function() {
  if (!this.complaintNumber) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.complaintNumber = `CMP${String(count + 1).padStart(5, '0')}`;
  }
  
});

module.exports = mongoose.model('Complaint', complaintSchema);