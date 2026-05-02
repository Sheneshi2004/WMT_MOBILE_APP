const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Admin Dashboard
router.get('/admin', 
  authMiddleware, 
  roleGuard('admin'), 
  dashboardController.getAdminDashboard
);

// Staff Dashboard
router.get('/staff', 
  authMiddleware, 
  roleGuard('staff', 'admin'), 
  dashboardController.getStaffDashboard
);

// Resident Dashboard
router.get('/resident', 
  authMiddleware, 
  roleGuard('resident'), 
  dashboardController.getResidentDashboard
);

// Summary Cards
router.get('/summary', 
  authMiddleware, 
  dashboardController.getSummaryCards
);

// Recent Activities
router.get('/recent-activities', 
  authMiddleware, 
  dashboardController.getRecentActivities
);

// Charts Data
router.get('/charts', 
  authMiddleware, 
  dashboardController.getChartsData
);

module.exports = router;