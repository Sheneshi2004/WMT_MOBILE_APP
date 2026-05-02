const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  breakfast: { item: String, time: String, price: { type: Number, default: 0 } },
  lunch: { item: String, time: String, price: { type: Number, default: 0 } },
  dinner: { item: String, time: String, price: { type: Number, default: 0 } },
  snacks: { item: String, time: String, price: { type: Number, default: 0 } },
  other: { item: String, time: String, price: { type: Number, default: 0 } },
  special: String
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);