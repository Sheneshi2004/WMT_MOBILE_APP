const Room = require('../models/Room');
const Resident = require('../models/Resident');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Attendance = require('../models/Attendance');
const Visitor = require('../models/Visitor');
const User = require('../models/User');

// ==================== ADMIN DASHBOARD ====================
const getAdminDashboard = async (req, res) => {
  try {
    // Get all counts
    const totalRooms = await Room.countDocuments({ isActive: true });
    const totalResidents = await Resident.countDocuments({ status: 'active' });
    const totalStaff = await User.countDocuments({ role: 'staff', isActive: true });
    const totalPayments = await Payment.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const totalVisitors = await Visitor.countDocuments();
    
    // Get pending counts
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const pendingVisitors = await Visitor.countDocuments({ status: 'pending' });
    
    // Get room statistics
    const availableRooms = await Room.countDocuments({ isActive: true, status: 'available' });
    const occupiedRooms = await Room.countDocuments({ isActive: true, status: 'occupied' });
    const maintenanceRooms = await Room.countDocuments({ isActive: true, status: 'maintenance' });
    
    // Get payment statistics
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } }
    ]);
    
    // Get recent activities
    const recentResidents = await Resident.find().sort({ createdAt: -1 }).limit(5);
    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5);
    const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalRooms, totalResidents, totalStaff, totalPayments,
          totalComplaints, totalVisitors, pendingComplaints,
          pendingPayments, pendingVisitors
        },
        roomStats: { availableRooms, occupiedRooms, maintenanceRooms, totalRooms },
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        recentActivities: {
          residents: recentResidents,
          complaints: recentComplaints,
          payments: recentPayments
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STAFF DASHBOARD ====================
const getStaffDashboard = async (req, res) => {
  try {
    const assignedComplaints = await Complaint.countDocuments({ assignedTo: req.user.id, status: { $ne: 'resolved' } });
    const resolvedComplaints = await Complaint.countDocuments({ assignedTo: req.user.id, status: 'resolved' });
    const todayAttendance = await Attendance.countDocuments({ date: new Date().setHours(0,0,0,0) });
    
    res.status(200).json({
      success: true,
      data: {
        assignedComplaints,
        resolvedComplaints,
        todayAttendance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RESIDENT DASHBOARD ====================
const getResidentDashboard = async (req, res) => {
  try {
    const resident = await Resident.findOne({ userId: req.user.id });
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident profile not found' });
    }
    
    const myRoom = await Room.findById(resident.roomId);
    const myPayments = await Payment.find({ residentId: resident._id }).sort({ createdAt: -1 }).limit(5);
    const myComplaints = await Complaint.find({ residentId: resident._id }).sort({ createdAt: -1 }).limit(5);
    const pendingPayment = await Payment.findOne({ residentId: resident._id, status: 'pending' });
    const dueAmount = pendingPayment ? pendingPayment.netAmount : 0;
    
    res.status(200).json({
      success: true,
      data: {
        resident,
        myRoom,
        dueAmount,
        recentPayments: myPayments,
        recentComplaints: myComplaints
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SUMMARY CARDS ====================
const getSummaryCards = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments({ isActive: true });
    const availableRooms = await Room.countDocuments({ isActive: true, status: 'available' });
    const totalResidents = await Resident.countDocuments({ status: 'active' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const todayVisitors = await Visitor.countDocuments({ checkInTime: { $gte: new Date().setHours(0,0,0,0) } });
    
    res.status(200).json({
      success: true,
      data: {
        totalRooms,
        availableRooms,
        totalResidents,
        pendingComplaints,
        todayVisitors
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== RECENT ACTIVITIES ====================
const getRecentActivities = async (req, res) => {
  try {
    const recentResidents = await Resident.find().sort({ createdAt: -1 }).limit(10).populate('roomId', 'roomNumber');
    const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(10).populate('residentId', 'name');
    const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(10).populate('residentId', 'name');
    const recentVisitors = await Visitor.find().sort({ createdAt: -1 }).limit(10);
    
    res.status(200).json({
      success: true,
      data: {
        residents: recentResidents,
        complaints: recentComplaints,
        payments: recentPayments,
        visitors: recentVisitors
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CHARTS DATA ====================
const getChartsData = async (req, res) => {
  try {
    // Monthly payments for last 6 months
    const monthlyPayments = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const total = await Payment.aggregate([
        { $match: { paidDate: { $gte: monthStart, $lte: monthEnd }, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$netAmount' } } }
      ]);
      
      monthlyPayments.push({
        month: date.toLocaleString('default', { month: 'short' }),
        amount: total[0]?.total || 0
      });
    }
    
    // Room type distribution
    const roomTypes = await Room.aggregate([
      { $group: { _id: '$roomType', count: { $sum: 1 } } }
    ]);
    
    // Complaint categories
    const complaintCategories = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        monthlyPayments,
        roomTypes,
        complaintCategories
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getStaffDashboard,
  getResidentDashboard,
  getSummaryCards,
  getRecentActivities,
  getChartsData
};