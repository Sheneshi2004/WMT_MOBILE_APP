const Payment = require('../models/Payment');
const Resident = require('../models/Resident');
const Room = require('../models/Room');
const Meal = require('../models/Meal');
const FoodPreference = require('../models/FoodPreference');

// HELPER: Calculate monthly bill for a resident
const calculateMonthlyBill = async (residentId, monthStr) => {
  const resident = await Resident.findById(residentId).populate('roomId');
  if (!resident || !resident.roomId) return { roomAmount: 0, foodAmount: 0 };

  const roomAmount = resident.roomId.pricePerMonth;

  // Find food preferences
  const foodPref = await FoodPreference.findOne({ residentId, isActive: true });
  if (!foodPref || !foodPref.mealType || foodPref.mealType.length === 0) {
    return { roomAmount, foodAmount: 0 };
  }

  // Find all meals for this month
  const startDate = new Date(monthStr);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const meals = await Meal.find({ date: { $gte: startDate, $lt: endDate } });
  
  let foodAmount = 0;
  meals.forEach(dayMenu => {
    foodPref.mealType.forEach(type => {
      if (dayMenu[type] && dayMenu[type].price) {
        foodAmount += dayMenu[type].price;
      }
    });
  });

  return { roomAmount, foodAmount };
};

// CREATE PAYMENT
const createPayment = async (req, res) => {
  try {
    const { residentId, amount, foodAmount: reqFoodAmount, month, dueDate } = req.body;
    
    const resident = await Resident.findById(residentId);
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found' });
    
    let finalAmount = amount;
    let finalFoodAmount = reqFoodAmount || 0;

    // If amount is not provided, calculate it automatically
    if (!amount) {
      const bill = await calculateMonthlyBill(residentId, month);
      finalAmount = bill.roomAmount;
      finalFoodAmount = bill.foodAmount;
    }

    const payment = new Payment({ 
      residentId, 
      roomId: resident.roomId, 
      amount: finalAmount, 
      foodAmount: finalFoodAmount,
      month, 
      dueDate, 
      netAmount: finalAmount + finalFoodAmount 
    });
    await payment.save();
    
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GENERATE MONTHLY BILLS FOR ALL RESIDENTS
const generateMonthlyBills = async (req, res) => {
  try {
    const { month, dueDate } = req.body;
    if (!month || !dueDate) return res.status(400).json({ success: false, message: 'Month and Due Date are required' });

    const residents = await Resident.find({ roomId: { $ne: null } });
    const results = { created: 0, skipped: 0, errors: 0 };

    for (const resident of residents) {
      try {
        // Check if bill already exists for this month
        const start = new Date(month);
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        const existing = await Payment.findOne({ 
          residentId: resident._id, 
          month: { $gte: start, $lt: end } 
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        const bill = await calculateMonthlyBill(resident._id, month);
        
        await Payment.create({
          residentId: resident._id,
          roomId: resident.roomId,
          amount: bill.roomAmount,
          foodAmount: bill.foodAmount,
          month: start,
          dueDate: new Date(dueDate),
          netAmount: bill.roomAmount + bill.foodAmount
        });
        results.created++;
      } catch (err) {
        results.errors++;
      }
    }

    res.status(200).json({ success: true, message: 'Batch generation complete', data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL PAYMENTS
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('residentId', 'name email').populate('roomId', 'roomNumber');
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PAYMENT BY ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('residentId', 'name email');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PAYMENTS BY RESIDENT
const getPaymentsByResident = async (req, res) => {
  try {
    const payments = await Payment.find({ residentId: req.params.residentId }).sort({ month: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PAYMENTS BY MONTH
const getPaymentsByMonth = async (req, res) => {
  try {
    const startDate = new Date(req.params.month);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    
    const payments = await Payment.find({ month: { $gte: startDate, $lt: endDate } });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PAYMENTS BY STATUS
const getPaymentsByStatus = async (req, res) => {
  try {
    const payments = await Payment.find({ status: req.params.status });
    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PAYMENT STATUS
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// MARK AS PAID
const markAsPaid = async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const payment = await Payment.findByIdAndUpdate(req.params.id, {
      status: 'paid', paidDate: new Date(), paymentMethod, transactionId, lateFee: 0
    }, { returnDocument: 'after' });
    
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE PAYMENT
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.status(200).json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET PAYMENT STATISTICS
const getPaymentStatistics = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const totalCollected = await Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$netAmount' } } }]);
    const pendingAmount = await Payment.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$netAmount' } } }]);
    const overdueAmount = await Payment.aggregate([{ $match: { status: 'overdue' } }, { $group: { _id: null, total: { $sum: '$netAmount' } } }]);
    
    res.status(200).json({
      success: true, data: {
        totalPayments, totalCollected: totalCollected[0]?.total || 0,
        pendingAmount: pendingAmount[0]?.total || 0, overdueAmount: overdueAmount[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PROCESS CARD PAYMENT (Fake Gateway with Real Validations)
const processCardPayment = async (req, res) => {
  try {
    const { cardNumber, expiry, cvv, cardholderName } = req.body;
    const errors = [];

    // ===== Card Number Validation (Luhn Algorithm) =====
    const cleanCardNumber = (cardNumber || '').replace(/\s+/g, '');
    if (!cleanCardNumber || cleanCardNumber.length !== 16 || !/^\d{16}$/.test(cleanCardNumber)) {
      errors.push('Card number must be exactly 16 digits');
    } else {
      // Luhn algorithm check
      let sum = 0;
      let isEven = false;
      for (let i = cleanCardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanCardNumber[i], 10);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }
      if (sum % 10 !== 0) {
        errors.push('Invalid card number (failed Luhn check)');
      }
    }

    // ===== Expiry Date Validation =====
    if (!expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      errors.push('Expiry must be in MM/YY format');
    } else {
      const [month, year] = expiry.split('/');
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month), 0); // Last day of expiry month
      if (expiryDate < new Date()) {
        errors.push('Card has expired');
      }
    }

    // ===== CVV Validation =====
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      errors.push('CVV must be 3 or 4 digits');
    }

    // ===== Cardholder Name Validation =====
    if (!cardholderName || cardholderName.trim().length < 3) {
      errors.push('Cardholder name must be at least 3 characters');
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Card validation failed',
        errors
      });
    }

    // ===== Find the payment =====
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    if (payment.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Payment is already paid' });
    }

    // ===== Simulate gateway processing delay =====
    await new Promise(resolve => setTimeout(resolve, 1000));

    // ===== Simulate random decline (5% chance) for realism =====
    const isDeclined = Math.random() < 0.05;
    if (isDeclined) {
      return res.status(402).json({
        success: false,
        message: 'Payment declined by bank. Please try again or use a different card.',
        gatewayResponse: {
          status: 'DECLINED',
          code: 'INSUFFICIENT_FUNDS',
          timestamp: new Date()
        }
      });
    }

    // ===== Process successful payment =====
    const transactionId = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const approvalCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    const maskedCard = '****-****-****-' + cleanCardNumber.slice(-4);

    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.paymentMethod = 'card';
    payment.transactionId = transactionId;
    payment.lateFee = 0;
    payment.netAmount = payment.amount + (payment.foodAmount || 0) - (payment.discount || 0);
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment,
      gatewayResponse: {
        status: 'APPROVED',
        approvalCode,
        transactionId,
        maskedCard,
        amount: payment.netAmount,
        currency: 'LKR',
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPayment,
  generateMonthlyBills,
  getAllPayments,
  getPaymentById,
  getPaymentsByResident,
  getPaymentsByMonth,
  getPaymentsByStatus,
  updatePaymentStatus,
  markAsPaid,
  deletePayment,
  getPaymentStatistics,
  processCardPayment
};