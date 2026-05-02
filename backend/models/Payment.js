const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  amount: { type: Number, required: true, min: 0 },
  month: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date, default: null },
  lateFee: { type: Number, default: 0 },
  foodAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'online'], default: null },
  transactionId: { type: String, unique: true, sparse: true },
  receiptUrl: { type: String, default: null },
  remarks: String
}, { timestamps: true });

// Calculate late fee and net amount before saving
paymentSchema.pre('save', function() {
  if (!this.paidDate && new Date() > this.dueDate) {
    const daysLate = Math.floor((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    this.lateFee = daysLate * 50;
    this.netAmount = this.amount + this.foodAmount + this.lateFee - this.discount;
    this.status = 'overdue';
  } else {
    this.netAmount = this.amount + this.foodAmount - this.discount;
  }
});

module.exports = mongoose.model('Payment', paymentSchema);