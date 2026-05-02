const Attendance = require('../models/Attendance');
const FoodPreference = require('../models/FoodPreference');
const Meal = require('../models/Meal');
const Resident = require('../models/Resident');

// ==================== ATTENDANCE ====================

// Mark Attendance
const markAttendance = async (req, res) => {
  try {
    const { residentId, date, status, checkInTime, checkOutTime } = req.body;
    
    // Normalize date to start of day (midnight) to ensure only one record per day
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    
    // Removed "already marked" check to allow multiple entries per day
    /*
    const existing = await Attendance.findOne({ residentId, date: normalizedDate });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Attendance already marked for this date' });
    }
    */
    
    const attendance = await Attendance.create({ 
      residentId, 
      date: normalizedDate, 
      status, 
      checkInTime: checkInTime || null, 
      checkOutTime: checkOutTime || null,
      verified: false // Require admin verification
    });
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All Attendance
const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().populate('residentId', 'name email');
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Attendance by Resident
const getAttendanceByResident = async (req, res) => {
  try {
    const attendance = await Attendance.find({ residentId: req.params.residentId }).sort({ date: -1 });
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Attendance by Date
const getAttendanceByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const attendance = await Attendance.find({ date }).populate('residentId', 'name email');
    res.status(200).json({ success: true, count: attendance.length, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Attendance Report
const getAttendanceReport = async (req, res) => {
  try {
    const { month, year, residentId } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const query = { date: { $gte: startDate, $lte: endDate } };
    if (residentId) query.residentId = residentId;
    
    const attendance = await Attendance.find(query).populate('residentId', 'name');
    
    const report = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      leave: attendance.filter(a => a.status === 'leave').length
    };
    
    res.status(200).json({ success: true, data: { report, attendance } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Attendance Statistics
const getAttendanceStatistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPresent = await Attendance.countDocuments({ date: today, status: 'present' });
    const todayAbsent = await Attendance.countDocuments({ date: today, status: 'absent' });
    const todayLate = await Attendance.countDocuments({ date: today, status: 'late' });
    
    const totalResidents = await Resident.countDocuments({ status: 'active' });
    
    res.status(200).json({
      success: true,
      data: {
        today: { present: todayPresent, absent: todayAbsent, late: todayLate, total: totalResidents }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Attendance by ID
const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate('residentId', 'name email');
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Attendance
const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Attendance
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.status(200).json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FOOD PREFERENCE ====================

// Set Food Preference
const setFoodPreference = async (req, res) => {
  try {
    const preference = await FoodPreference.create(req.body);
    res.status(201).json({ success: true, data: preference });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get Food Preference
const getFoodPreference = async (req, res) => {
  try {
    const preference = await FoodPreference.find({ residentId: req.params.residentId, isActive: true });
    res.status(200).json({ success: true, data: preference });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Food Preferences (Admin)
const getAllFoodPreferences = async (req, res) => {
  try {
    const preferences = await FoodPreference.find({ isActive: true }).populate('residentId', 'name email');
    res.status(200).json({ success: true, count: preferences.length, data: preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Food Preference
const updateFoodPreference = async (req, res) => {
  try {
    const preference = await FoodPreference.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!preference) {
      return res.status(404).json({ success: false, message: 'Preference not found' });
    }
    res.status(200).json({ success: true, data: preference });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Food Preference
const deleteFoodPreference = async (req, res) => {
  try {
    const preference = await FoodPreference.findByIdAndDelete(req.params.id);
    if (!preference) {
      return res.status(404).json({ success: false, message: 'Preference not found' });
    }
    res.status(200).json({ success: true, message: 'Food preference deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Today's Menu
const getTodaysMenu = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const meal = await Meal.findOne({ date: { $gte: start, $lte: end } });
    res.status(200).json({ success: true, data: meal || { message: 'No menu for today' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Meal Menu
const createMealMenu = async (req, res) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update Meal Menu
const updateMealMenu = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    res.status(200).json({ success: true, data: meal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Meal Menu
const deleteMealMenu = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }
    res.status(200).json({ success: true, message: 'Menu deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceByResident,
  getAttendanceByDate,
  getAttendanceReport,
  getAttendanceStatistics,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  setFoodPreference,
  getFoodPreference,
  getAllFoodPreferences,
  updateFoodPreference,
  getTodaysMenu,
  createMealMenu,
  updateMealMenu,
  deleteMealMenu,
  deleteFoodPreference
};