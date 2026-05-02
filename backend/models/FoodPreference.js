const mongoose = require('mongoose');

const foodPreferenceSchema = new mongoose.Schema({
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
  mealType: [{ type: String, enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'other'] }],
  preference: { type: String, enum: ['veg', 'non-veg', 'vegan'], required: true },
  specialRequests: { type: String, maxlength: 200 },
  allergies: [{ type: String }],
  specificAllergies: { type: String, maxlength: 200 },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('FoodPreference', foodPreferenceSchema);